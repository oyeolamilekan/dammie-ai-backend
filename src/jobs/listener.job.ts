/**
 * This file contains the listeners for various job queues, processing tasks related to user wallets, deposits, and cryptocurrency swaps.
 * It uses Bull for queue management and interacts with Redis for job storage.
 */
import Bull from "bull";
import Logging from "../library/logging.utils";
import CONFIG from "../config/config";
import { opts } from "./redis.job";
import { quidax } from "../services/quidax.service";
import { createWallet, findAndUpdateWallet, findOneWallet } from "../queries/wallet.query";
import { getUserBy } from "../queries/user.query";
import { createDeposit, findAndUpdateDeposit, findDeposit } from "../queries/deposit.query";
import { telegramBot } from '../plugins/bot';
import { MESSAGES } from "../helpers/messages";
import { findAndUpdateSwap, findSwap, findSwapById } from "../queries/swap.query";
import { findBank } from "../queries/bank.query";
import { QUEUE_NAMES } from "./queueNames.job";

/**
 * Sets up common event handlers for a given Bull queue.
 * This function logs when a job is completed successfully or when it fails.
 * @param queue The Bull queue instance to set up event handlers for.
 * @param queueName A descriptive name for the queue, used in logs.
 */
const setupQueueEvents = (queue: Bull.Queue, queueName: string) => {
  queue.on("global:completed", (job, result) => {
    queue.clean(0, "completed");
    Logging.info(`${queueName} job completed: ${job} Result: ${result}`);
  });

  queue.on("failed", (job, error) => {
    Logging.error(`${queueName} job failed: ${job.id} - ${error.message}`);
  });
};

/**
 * Processes jobs related to creating new cryptocurrency wallets for sub-users.
 * It attempts to create wallets for all supported cryptocurrencies and logs the outcome.
 */
const processCreateSubuser = async () => {
  const walletQueue = new Bull(QUEUE_NAMES.CREATE_WALLET, opts);

  walletQueue.process(async (job: any) => {
    try {
      const { userId, subUserId, email } = job.data;

      const results = await Promise.all(
        CONFIG.SUPPORTED_CRYPTOS.map(async (currency) => {
          try {
            const response = await quidax.fetchCurrency(subUserId, currency);
            const { id: walletId } = response;

            const existingWallet = await findOneWallet({ user: userId, currency });

            if (existingWallet) {
              return { currency, created: false, reason: 'already exists' };
            }

            const wallet = await createWallet({
              user: userId,
              currency,
              isCrypto: true,
              walletId
            });

            await quidax.createPaymentAddress(subUserId, currency);

            Logging.info(`${email} wallet ${wallet ? 'created' : 'failed to create'} for ${currency}`);
            return { currency, created: wallet };
          } catch (error) {
            Logging.error(`Failed to create wallet for ${currency}: ${error}`);
            return { currency, created: false, reason: 'creation failed' };
          }
        })
      );

      return results;
    } catch (error) {
      Logging.error(`Wallet creation failed - Attempt ${job.attemptsMade} for job ${job.id}: ${error}`);
      throw error;
    }
  });

  setupQueueEvents(walletQueue, "Wallet Creation");
};

/**
 * Processes jobs for assigning a new wallet address to a user's cryptocurrency wallet.
 * It updates the wallet in the database with the new address and related details.
 */
const processAssignWalletAddress = async () => {
  const walletAddressQueue = new Bull(QUEUE_NAMES.ASSIGN_WALLET_ADDRESS, opts);

  walletAddressQueue.process(async (job: any) => {
    try {
      const { user, currency, address, network, destination_tag } = job.data.data;
      const userDetail = await getUserBy({ subUserId: user.id });

      if (!userDetail) {
        throw new Error(`User not found for subUserId: ${user.id}`);
      }

      const addressObject = {
        network,
        destinationTag: destination_tag,
        address
      };

      Logging.info(`Assigning crypto address for ${userDetail.firstName} ${userDetail.lastName}: ${JSON.stringify(addressObject)}`);

      await findAndUpdateWallet(
        { user: userDetail._id, currency },
        {
          $push: { address: addressObject },
          $set: { inProgress: false }
        }
      );
    } catch (error) {
      Logging.error(`Wallet address assignment failed - Attempt ${job.attemptsMade} for job ${job.id}: ${error}`);
      throw error;
    }
  });

  setupQueueEvents(walletAddressQueue, "Wallet Address Assignment");
};

/**
 * Processes jobs for confirming new cryptocurrency deposits.
 * It checks for existing deposits, creates a new deposit record, and sends a notification to the user via Telegram.
 */
const processDepositConfirmation = async () => {
  const depositQueue = new Bull(QUEUE_NAMES.DEPOSIT_CONFIRMATION, opts);

  depositQueue.process(async (job: any) => {
    const { user, amount, currency, txid, id, payment_address } = job.data.data;

    try {
      const userObj = await getUserBy({ subUserId: user.id });
      if (!userObj) {
        throw new Error(`User not found for subUserId: ${user.id}`);
      }

      const existingDeposit = await findDeposit({ despoitId: id });
      if (existingDeposit) {
        Logging.info(`Deposit already exists for id: ${id}`);
        return;
      }

      const walletObj = await findOneWallet({ user: userObj._id, currency });
      if (!walletObj) {
        throw new Error(`Wallet not found for user: ${userObj._id}, currency: ${currency}`);
      }

      const depositData = {
        user: userObj._id,
        wallet: walletObj.id,
        currency,
        despoitId: id,
        amount,
        txid,
      };

      await createDeposit(depositData);

      const message = MESSAGES.PENDING_DESPOSIT(amount, currency.toUpperCase(), payment_address.network, txid);
      await telegramBot.sendMessage(userObj.chatId, message);

      Logging.info(`Deposit confirmation processed for ${userObj.email}: ${JSON.stringify(job.data.data)}`);
    } catch (error) {
      Logging.error(`Deposit confirmation failed for user ${user.id}: ${error}`);
      throw error;
    }
  });

  setupQueueEvents(depositQueue, "Deposit Confirmation");
};

/**
 * Processes jobs for handling successful cryptocurrency deposits.
 * It updates the deposit status, increases the user's wallet balance, and sends a success notification via Telegram.
 */
const processDepositSuccess = async () => {
  const depositSuccessQueue = new Bull(QUEUE_NAMES.DEPOSIT_SUCCESSFUL, opts);

  depositSuccessQueue.process(async (job: any) => {
    const { user, amount, currency, id, payment_address, txid } = job.data.data;

    try {
      const existingDeposit = await findDeposit({ despoitId: id, status: CONFIG.SUCCESS });
      if (existingDeposit) {
        Logging.info(`Deposit already processed for id: ${id}`);
        return;
      }

      const userObj = await getUserBy({ subUserId: user.id });
      if (!userObj) {
        throw new Error(`User not found for subUserId: ${user.id}`);
      }

      await Promise.all([
        findAndUpdateDeposit({ despoitId: id }, { status: CONFIG.SUCCESS }),
        findAndUpdateWallet({ user: userObj._id, currency }, { $inc: { balance: amount } })
      ]);

      const message = MESSAGES.SUCESS_DEPOSIT(amount, currency.toUpperCase(), payment_address.network, txid);
      await telegramBot.sendMessage(userObj.chatId, message);

      Logging.info(`Successful deposit processed for ${userObj.email}: ${JSON.stringify(job.data.data)}`);
    } catch (error) {
      Logging.error(`Deposit success processing failed: ${error}`);
      throw error;
    }
  });

  setupQueueEvents(depositSuccessQueue, "Deposit Success");
};

/**
 * Processes jobs for cryptocurrency swaps that are pending or awaiting confirmation.
 * It refreshes and confirms the instant swap with the Quidax service, and updates the user's wallet balance.
 */
const processPendingSwap = async () => {
  const pendingSwapQueue = new Bull(QUEUE_NAMES.PENDING_SWAP, opts);

  pendingSwapQueue.process(async (job: any) => {
    try {
      const { _id } = job.data;
      const swap = await findSwapById(_id);

      if (!swap) {
        Logging.info(`Swap not found for id: ${_id}`);
        return;
      }

      await quidax.refreshInstantSwap(swap.user.subUserId, swap.quotationId, {
        from_currency: swap.fromCurrency.toLowerCase(),
        to_currency: swap.toCurrency.toLowerCase(),
        from_amount: swap.fromAmount
      });

      const swapTransaction = await quidax.confirmInstantSwap(swap.user.subUserId, swap.quotationId);
      await findAndUpdateSwap({ quotationId: swap.quotationId }, { swapTransactionId: swapTransaction.id });
      await findAndUpdateWallet({ user: swap.user._id, currency: swap.fromCurrency.toLowerCase() }, { $inc: { balance: -swap.fromAmount, lockedBalance: swap.fromAmount } })

      Logging.info(`Pending swap processed for quotationId: ${swap.quotationId}`);
    } catch (error) {
      Logging.error(`Pending swap processing failed: ${error}`);
      throw error;
    }
  });

  setupQueueEvents(pendingSwapQueue, "Pending Swap");
};

/**
 * Processes jobs for successful cryptocurrency swaps.
 * It updates the swap status, sends a success message to the user via Telegram, and initiates a withdrawal to a main account.
 */
const processSuccessfulSwap = async () => {
  const successSwapQueue = new Bull(QUEUE_NAMES.SUCCESSFUL_SWAP, opts);

  successSwapQueue.process(async (job: any) => {
    try {
      const { id, received_amount } = job.data.data;
      const swap = await findSwap({ swapTransactionId: id });

      if (!swap) {
        Logging.info(`Swap not found for transactionId: ${id}`);
        return;
      }

      await findAndUpdateSwap({ swapTransactionId: id }, { swapStatus: "success" });

      const message = `✅ Your swap has been successful! 💸 Funds will arrive shortly. 🚀`

      await telegramBot.sendMessage(swap?.user?.chatId as string, message);

      const withdrawal = await quidax.createWithdrawal(swap.user.subUserId, {
        amount: received_amount,
        currency: "ngn",
        fund_uid: CONFIG.MAIN_ACCOUNT_ID
      });

      await findAndUpdateSwap({ swapTransactionId: id }, { sweepId: withdrawal.id });

      Logging.info(`Successful swap processed for transactionId: ${id}`);
    } catch (error) {
      Logging.error(`Successful swap processing failed: ${error}`);
      throw error;
    }
  });

  setupQueueEvents(successSwapQueue, "Successful Swap");
};

/**
 * Processes jobs for finalizing cryptocurrency swaps, including handling withdrawals to user bank accounts.
 * It updates swap and wallet statuses and sends final notifications to users.
 */
const processFinalizeSwap = async () => {
  const finalizeSwapQueue = new Bull(QUEUE_NAMES.FINALIZE_SWAP, opts);

  finalizeSwapQueue.process(async (job: any) => {
    try {
      const { user: { id: userId }, id, amount } = job.data.data;

      if (userId === CONFIG.MAIN_ACCOUNT_ID) {
        const swapObj = await findAndUpdateSwap({ withdrawId: id }, { status: "success" });
        await findAndUpdateWallet({ user: swapObj!.user, currency: swapObj!.fromCurrency.toLowerCase() }, { $inc: { lockedBalance: -swapObj!.fromAmount } });
        const message = `✅ ₦${amount} is on its way to your bank account! 💸 It’ll arrive shortly. 🚀`

        await telegramBot.sendMessage(swapObj?.user?.chatId as string, message);

        Logging.info(`Finalized swap for customer account, sweepId: ${id}`);
        return;
      }

      const swap = await findSwap({ sweepId: id });
      if (!swap) {
        Logging.info(`Swap not found for sweepId: ${id}`);
        return;
      }

      await Promise.all([
        findAndUpdateSwap({ sweepId: id }, { sweepStatus: "success" })
      ]);

      const bankAccount = await findBank({ user: swap.user._id });
      if (!bankAccount) {
        throw new Error(`Bank account not found for user: ${swap.user._id}`);
      }

      const withdrawalAmount = (Number.parseFloat(swap.toAmount) - 200).toString();
      const withdrawal = await quidax.createNgnWithdraw(bankAccount.accountNumber, bankAccount.bankCode, withdrawalAmount);

      await findAndUpdateSwap({ sweepId: id }, { withdrawId: withdrawal.id, withdrawAmount: Number.parseFloat(swap.toAmount) - 200 });

      Logging.info(`Finalized swap for user ${swap.user._id}, sweepId: ${id}`);
    } catch (error) {
      Logging.error(`Finalize swap processing failed: ${error}`);
      throw error;
    }
  });

  setupQueueEvents(finalizeSwapQueue, "Finalize Swap");
};

/**
 * Initializes and starts all job queue listeners.
 * This function ensures that all predefined queues are set up and ready to process incoming jobs.
 */
const initializeQueues = async () => {
  try {
    const queueInitializers = [
      processCreateSubuser,
      processAssignWalletAddress,
      processDepositConfirmation,
      processDepositSuccess,
      processPendingSwap,
      processSuccessfulSwap,
      processFinalizeSwap
    ];

    await Promise.all(queueInitializers.map(initializer => initializer()));

    Logging.info("All job queues initialized successfully");
  } catch (error: any) {
    Logging.error(`Error initializing job queues: ${error.message}`);
    throw error;
  }
};

// Initialize all queues
initializeQueues();
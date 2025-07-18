import { findBank } from "../queries/bank.query";
import { createSwap } from "../queries/swap.query";
import { getUserByTelegramId } from "../queries/user.query";
import { findOneWallet } from "../queries/wallet.query";
import { quidax } from "../services/quidax.service";

/**
 * @function initiateSwap
 * @description Initiates a cryptocurrency swap (e.g., crypto to Naira) for a user.
 * It performs checks for user existence, wallet availability, and sufficient balance
 * before interacting with the Quidax API to create an instant swap quotation.
 * Finally, it records the swap details in the database and generates a formatted message
 * for the user with swap details and an approval action.
 * @param {string} amount - The amount of cryptocurrency the user wants to swap.
 * @param {string} coin - The symbol of the cryptocurrency to be swapped (e.g., "BTC", "ETH").
 * @param {object} user - An object containing user details, specifically `userId` (Telegram ID).
 * @param {string} user.userId - The Telegram ID of the user initiating the swap.
 * @returns {Promise<string>} A promise that resolves to a formatted string message
 *   containing swap details or an error message if the swap cannot be initiated.
 */
export const initiateSwap = async (amount: string, coin: string, user: any) => {
  const numAmount = parseFloat(amount);
  const userData = await getUserByTelegramId(user.userId);

  if (!userData) {
    return '❌ User not found. Please ensure you are registered.';
  }

  const { _id } = userData;

  const wallet = await findOneWallet({
    user: _id,
    currency: coin.toLocaleLowerCase()
  });

  if (!wallet) {
    return '❌ Wallet not found. Please ensure you have a wallet set up.';
  }

  if (wallet.balance < numAmount) {
    return `❌ Insufficient balance. You have only ${wallet.balance} ${coin}`
  }

  if (numAmount <= 0) {
    return '❌ Invalid amount. Please enter a valid amount to swap.';
  }

  if (wallet.balance <= 0) {
    return `❌ Your ${coin} wallet is empty. Please deposit some ${coin} before swapping.`;
  }

  const accountNumber = await findBank({ user: _id });

  if (!accountNumber) {
    return '❌ Bank account not found. Please add a bank account before swapping.';
  }

  const response = await quidax.createInstantSwap(userData.subUserId, {
    from_currency: coin.toLowerCase(),
    to_currency: 'ngn',
    from_amount: numAmount.toString()
  })

  const {
    id,
    quoted_price,
    to_amount,
    from_currency,
    to_currency,
    from_amount
  } = response;

  const swap = await createSwap({
    quotationId: id,
    fromCurrency: from_currency,
    quotedPrice: quoted_price,
    toCurrency: to_currency,
    fromAmount: from_amount,
    toAmount: to_amount,
    user: _id
  })

  return `
🔄 *Swap Details:*
• Amount: ${swap.fromAmount} ${swap.fromCurrency}
• Expected Naira: ₦${Number(swap.toAmount) - 200}
• Rate: ${swap.quotedPrice} per ${coin.toUpperCase()}
• Processing Fee: ₦200
• Status: Ready for approval

💰 *You'll receive:* ₦${Number(swap.toAmount) - 200}

⏰ *Processing Time:* 1-2 minutes after approval
🏦 *Delivery:* Direct to your registered bank account

ACTION: APPROVE_SWAP_ACTION
PARAM: ${swap._id}
`;
}
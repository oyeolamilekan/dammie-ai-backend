import Bull from "bull"
import { opts } from "./redis.job"
import { QUEUE_NAMES } from "./queueNames.job";

/**
 * @function createWalletJob
 * @description Adds a job to the queue to create a new wallet for a user.
 * @param {any} data - The information needed to create the wallet, usually including user ID and crypto type.
 */
export const createWalletJob = async (data: any) => {
  const createWalletQueue = new Bull(QUEUE_NAMES.CREATE_WALLET, opts)
  await createWalletQueue.add(data)
}

/**
 * @function assignWalletAddress
 * @description Adds a job to the queue to assign a deposit address to a user's wallet.
 * @param {any} data - The address details to be assigned to the wallet.
 */
export const assignWalletAddress = async (data: any) => {
  const assignWalletAddressQueue = new Bull(QUEUE_NAMES.ASSIGN_WALLET_ADDRESS, opts)
  await assignWalletAddressQueue.add(data)
}

/**
 * @function depositConfirmation
 * @description Adds a job to confirm a new cryptocurrency deposit.
 * @param {any} data - The details of the deposit to be confirmed.
 */
export const depositConfirmation = async (data: any) => {
  const depositConfirmationQueue = new Bull(QUEUE_NAMES.DEPOSIT_CONFIRMATION, opts)
  await depositConfirmationQueue.add(data)
}

/**
 * @function creditDepositConfirmation
 * @description Adds a job to process a successful cryptocurrency deposit and credit the user's account.
 * @param {any} data - The details of the successful deposit.
 */
export const creditDepositConfirmation = async (data: any) => {
  const creditDepositConfirmationQueue = new Bull(QUEUE_NAMES.DEPOSIT_SUCCESSFUL, opts)
  await creditDepositConfirmationQueue.add(data)
}

/**
 * @function processSwap
 * @description Adds a job to start a cryptocurrency swap process.
 * @param {any} data - The details of the swap to be initiated.
 */
export const processSwap = async (data: any) => {
  const creditDepositConfirmationQueue = new Bull(QUEUE_NAMES.PENDING_SWAP, opts)
  await creditDepositConfirmationQueue.add(data)
}

/**
 * @function processSuccessSwap
 * @description Adds a job to handle a successful cryptocurrency swap.
 * @param {any} data - The details of the successful swap.
 */
export const processSuccessSwap = async (data: any) => {
  const creditDepositConfirmationQueue = new Bull(QUEUE_NAMES.SUCCESSFUL_SWAP, opts)
  await creditDepositConfirmationQueue.add(data)
}

/**
 * @function processFinalizeSwap
 * @description Adds a job to finalize a cryptocurrency swap.
 * @param {any} data - The details of the swap to be finalized.
 */
export const processFinalizeSwap = async (data: any) => {
  const creditDepositConfirmationQueue = new Bull(QUEUE_NAMES.FINALIZE_SWAP, opts)
  await creditDepositConfirmationQueue.add(data)
}
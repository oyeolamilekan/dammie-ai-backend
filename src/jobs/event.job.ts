import Bull from "bull"
import { opts } from "./redis.job"
import { QUEUE_NAMES } from "./queueNames.job";

export const createWalletJob = async (data: any) => {
  const createWalletQueue = new Bull(QUEUE_NAMES.CREATE_WALLET, opts)
  await createWalletQueue.add(data)
}

export const assignWalletAddress = async (data: any) => {
  const assignWalletAddressQueue = new Bull(QUEUE_NAMES.ASSIGN_WALLET_ADDRESS, opts)
  await assignWalletAddressQueue.add(data)
}

export const depositConfirmation = async (data: any) => {
  const depositConfirmationQueue = new Bull(QUEUE_NAMES.DEPOSIT_CONFIRMATION, opts)
  await depositConfirmationQueue.add(data)
}

export const creditDepositConfirmation = async (data: any) => {
  const creditDepositConfirmationQueue = new Bull(QUEUE_NAMES.DEPOSIT_SUCCESSFUL, opts)
  await creditDepositConfirmationQueue.add(data)
}

export const processSwap = async (data: any) => {
  const creditDepositConfirmationQueue = new Bull(QUEUE_NAMES.PENDING_SWAP, opts)
  await creditDepositConfirmationQueue.add(data)
}

export const processSuccessSwap = async (data: any) => {
  const creditDepositConfirmationQueue = new Bull(QUEUE_NAMES.SUCCESSFUL_SWAP, opts)
  await creditDepositConfirmationQueue.add(data)
}

export const processFinalizeSwap = async (data: any) => {
  const creditDepositConfirmationQueue = new Bull(QUEUE_NAMES.FINALIZE_SWAP, opts)
  await creditDepositConfirmationQueue.add(data)
}
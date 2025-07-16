/**
 * This file defines the names of the queues used in the application.
 * These queue names are used to identify different job queues for various background tasks.
 */
// Queue Names
export const QUEUE_NAMES = {
  CREATE_WALLET: "create-wallet-queue", // Queue for creating new user wallets.
  ASSIGN_WALLET_ADDRESS: "assign-wallet-address-queue", // Queue for assigning a unique address to a wallet.
  DEPOSIT_CONFIRMATION: "deposit-confirmation-queue", // Queue for confirming cryptocurrency deposits.
  DEPOSIT_SUCCESSFUL: "deposit-successful-queue", // Queue for handling successful deposit notifications.
  PENDING_SWAP: "pending-swap-queue", // Queue for managing cryptocurrency swaps that are awaiting processing.
  SUCCESSFUL_SWAP: "successful-swap-queue", // Queue for handling successful cryptocurrency swap transactions.
  FINALIZE_SWAP: "finalize-swap-queue" // Queue for finalizing cryptocurrency swap processes.
} as const;
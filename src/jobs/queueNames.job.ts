// Queue Names
export const QUEUE_NAMES = {
  CREATE_WALLET: "create-wallet-queue",
  ASSIGN_WALLET_ADDRESS: "assign-wallet-address-queue",
  DEPOSIT_CONFIRMATION: "deposit-confirmation-queue",
  DEPOSIT_SUCCESSFUL: "deposit-successful-queue",
  PENDING_SWAP: "pending-swap-queue",
  SUCCESSFUL_SWAP: "successful-swap-queue",
  FINALIZE_SWAP: "finalize-swap-queue"
} as const;
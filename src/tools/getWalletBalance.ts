import { getUserByTelegramId } from "../queries/user.query";
import { findOneWallet } from "../queries/wallet.query";

/**
 * @function getWalletBalance
 * @description Retrieves and formats the wallet balance for a specific cryptocurrency for a given user.
 * It fetches user data and their wallet details, then constructs a comprehensive message
 * including available, locked, and total balances, along with wallet status and last updated time.
 * @param {string} coin - The symbol of the cryptocurrency (e.g., "BTC", "ETH") whose balance is to be retrieved.
 * @param {object} user - An object containing user details, specifically `userId` (Telegram ID).
 * @param {string} user.userId - The Telegram ID of the user.
 * @returns {Promise<string>} A promise that resolves to a formatted string message
 *   with the wallet balance details or an error message if the user or wallet is not found.
 */
export const getWalletBalance = async (coin: string, user: any) => {
  const userData = await getUserByTelegramId(user.userId);

  if (!userData) {
    return '❌ User not found. Please ensure you are registered.';
  }

  const { _id } = userData;
  const wallet = await findOneWallet({
    user: _id,
    currency: coin.toLocaleLowerCase()
  });

  return `
💼 *${coin} Wallet Balance*

💰 Available: ${wallet?.balance} ${coin}
🔒 Locked: ${wallet?.lockedBalance} ${coin}
📊 Total: ${wallet!.balance + wallet!.lockedBalance} ${coin}

*Wallet Status:* Active ✅
*Last Updated:* ${new Date().toLocaleString()}

ACTION: NO_ACTION
`;
}
import { getUserByTelegramId } from "../queries/user.query";
import { findOneWallet } from "../queries/wallet.query";

/**
 * @function getWalletAddress
 * @description Retrieves and formats the deposit wallet address for a specific cryptocurrency
 * and network for a given user. It fetches user and wallet data, then constructs a message
 * with the wallet address, network, and important instructions for deposits.
 * @param {string} coin - The symbol of the cryptocurrency (e.g., "BTC", "ETH") for which the address is requested.
 * @param {string} network - The blockchain network (e.g., "BEP20", "ERC20", "TRC20") for the address.
 * @param {object} user - An object containing user details, specifically `userId` (Telegram ID).
 * @param {string} user.userId - The Telegram ID of the user.
 * @returns {Promise<string>} A promise that resolves to a formatted string message
 *   with the wallet deposit address or an error message if the user or wallet is not found.
 */
export const getWalletAddress = async (coin: string, network: string, user: any) => {
  const userData = await getUserByTelegramId(user.userId);

  if (!userData) {
    return '❌ User not found. Please ensure you are registered.';
  }

  const { _id } = userData;
  const wallet = await findOneWallet({
    user: _id,
    currency: coin.toLocaleLowerCase()
  });

  const selectedNetwork = network.toUpperCase();

  return `
Hi ${user.username || 'there'}! Here's your ${coin} deposit address for the ${selectedNetwork} network:

📍 *${coin} Wallet Address*

${wallet?.address.map((addr: any) => `
🌐 *Network:* ${addr.network}
📋 *Address:* \`${addr.address}\``).join('\n') || ''}

⚠️ *Important:*
• Only send ${coin} to this address
• Ensure you're using the ${selectedNetwork} network
• Double-check the address before sending
• Transactions are irreversible

*Copy the address by tapping on it*

ACTION: NO_ACTION
`;
}
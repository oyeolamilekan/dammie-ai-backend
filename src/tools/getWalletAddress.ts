import { getUserByTelegramId } from "../queries/user.query";
import { findOneWallet } from "../queries/wallet.query";

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
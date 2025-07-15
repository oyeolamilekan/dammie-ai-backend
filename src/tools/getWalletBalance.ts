import { getUserByTelegramId } from "../queries/user.query";
import { findOneWallet } from "../queries/wallet.query";

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
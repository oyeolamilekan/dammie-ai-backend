import { createSwap } from "../queries/swap.query";
import { getUserByTelegramId } from "../queries/user.query";
import { findOneWallet } from "../queries/wallet.query";
import { quidax } from "../services/quidax.service";

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

  const response = await quidax.createInstantSwap(userData.subUserId, {
    from_currency: coin.toLowerCase(),
    to_currency: 'ngn',
    from_amount: numAmount.toString()
  })

  console.log(response)

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
• Expected Naira: ₦${swap.toAmount}
• Rate: ${swap.quotedPrice} per ${coin}
• Processing Fee: ₦200
• Status: Ready for approval

💰 *You'll receive:* ₦${swap.toAmount}

⏰ *Processing Time:* 2-5 minutes after approval
🏦 *Delivery:* Direct to your registered bank account

ACTION: APPROVE_SWAP_ACTION
PARAM: ${swap._id}
`;
}
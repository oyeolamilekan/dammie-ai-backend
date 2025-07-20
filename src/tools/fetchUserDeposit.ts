import { getUserByTelegramId } from "../queries/user.query";
import { findAllDeposit } from "../queries/deposit.query";

/**
 * @interface FetchDepositsParams
 * @description Parameters for fetching user deposit transactions
 */
interface FetchDepositsParams {
  username?: string;
  userId: number;
  coin?: string;
  startDate?: string;
  endDate?: string;
}


/**
 * @function fetchUserDeposits
 * @description Fetches user deposit transactions with optional filtering
 * @param {object} params - Parameters object
 * @param {number} params.userId - Telegram ID of the user
 * @param {string} [params.coin] - Optional crypto symbol (BTC, ETH, etc.)
 * @param {Date} [params.startDate] - Optional start date filter
 * @param {Date} [params.endDate] - Optional end date filter
 * @returns {Promise<string>} Formatted deposit history message
 */
export const fetchUserDeposits = async ({ 
  userId, 
  coin, 
  startDate, 
  endDate 
}: FetchDepositsParams): Promise<string> => {
  // Get user data
  const userData = await getUserByTelegramId(userId.toString());
  if (!userData) {
    return '❌ User not found. Please ensure you are registered.';
  }

  // Build filter
  const filter: any = { user: userData._id };
  
  if (coin) {
    filter.currency = coin.toLowerCase();
  }
  
  if (startDate || endDate) {
    filter.createdAt = {};
    
    if (startDate) {
      // Set start of day (00:00:00.000) - MongoDB compatible
      const start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0);
      filter.createdAt.$gte = start;
    }
    
    if (endDate) {
      // Set end of day (23:59:59.999) - MongoDB compatible
      const end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  // Get deposits
  const deposits = await findAllDeposit(filter);
  
  if (!deposits || deposits.length === 0) {
    return '📥 No deposit transactions found.';
  }

  // Format message
  let message = '📥 *Your Deposit History:*\n\n';

  deposits.forEach((deposit: any) => {
    const statusEmoji = deposit.status === 'success' ? '✅' : 
                       deposit.status === 'pending' ? '🕐' : '❌';
    
    const date = new Date(deposit.createdAt).toLocaleDateString();
    
    message += `${statusEmoji} ${deposit.amount} ${deposit.currency.toUpperCase()}\n`;
    message += `Blockchain hash: ${deposit.txid}\n`;
    message += `${deposit.status} • ${date}\n\n`;
  });

  return message;
};
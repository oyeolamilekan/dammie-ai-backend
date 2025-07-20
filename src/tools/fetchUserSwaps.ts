import { getUserByTelegramId } from "../queries/user.query";
import { findAllSwap } from "../queries/swap.query";

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
 * @function fetchUserSwaps
 * @description Fetches user swap transactions with optional filtering
 * @param {object} params - Parameters object
 * @param {string} params.userId - Telegram ID of the user
 * @param {string} [params.coin] - Optional crypto symbol (BTC, ETH, etc.)
 * @param {Date} [params.startDate] - Optional start date filter
 * @param {Date} [params.endDate] - Optional end date filter
 * @returns {Promise<string>} Formatted swap history message
 */
export const fetchUserSwaps = async ({ 
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
    filter.fromCurrency = coin.toLowerCase();
  }
  
  if (startDate || endDate) {
    filter.createdAt = {};
    
    if (startDate) {
      // Set start of day (00:00:00.000)
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filter.createdAt.$gte = start;
    }
    
    if (endDate) {
      // Set end of day (23:59:59.999)
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  // Get swaps
  const swaps = await findAllSwap(filter);
  
  if (!swaps || swaps.length === 0) {
    return '🔄 No swap transactions found.';
  }

  // Format message
  let message = '🔄 *Your Swap History:*\n\n';

  swaps.forEach((swap: any) => {
    const statusEmoji = swap.status === 'success' ? '✅' : 
                       swap.status === 'pending' ? '🕐' : '❌';
    
    const date = new Date(swap.createdAt).toLocaleDateString();
    const nairaAmount = Number(swap.toAmount) - 200; // Subtract processing fee
    
    message += `${statusEmoji} ${swap.fromAmount} ${swap.fromCurrency.toUpperCase()} → ₦${nairaAmount}\n`;
    message += `${swap.status} • ${date}\n\n`;
  });

  return message;
};
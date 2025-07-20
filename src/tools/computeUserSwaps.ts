import { getUserByTelegramId } from "../queries/user.query";
import { findAllSwap } from "../queries/swap.query";

/**
 * @interface ComputeTotalSwapParams
 * @description Parameters for computing total swap amounts
 */
interface ComputeTotalSwapParams {
  username?: string;
  userId: number;
  coin?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * @interface SwapSummary
 * @description Summary of swap calculations
 */
interface SwapSummary {
  totalFromAmount: number;
  totalToAmount: number;
  totalNairaAmount: number; // After processing fee deduction
  transactionCount: number;
  fromCurrency: string;
  toCurrency: string;
  startDate?: string;
  endDate?: string;
}

/**
 * @function computeTotalSwap
 * @description Computes the total swap amounts for a user within a date range
 * @param {object} params - Parameters object
 * @param {number} params.userId - Telegram ID of the user
 * @param {string} [params.coin] - Optional crypto symbol for fromCurrency (BTC, ETH, etc.)
 * @param {string} [params.startDate] - Optional start date filter (ISO string)
 * @param {string} [params.endDate] - Optional end date filter (ISO string)
 * @returns {Promise<SwapSummary | null>} Swap summary or null if user not found
 */
export const computeTotalSwap = async ({ 
  userId, 
  coin, 
  startDate, 
  endDate 
}: ComputeTotalSwapParams): Promise<SwapSummary | null> => {
  // Get user data
  const userData = await getUserByTelegramId(userId.toString());
  if (!userData) {
    return null;
  }

  // Build filter
  const filter: any = { 
    user: userData._id,
    status: 'success' // Only count successful swaps
  };
  
  if (coin) {
    filter.fromCurrency = coin.toLowerCase();
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

  // Get swaps
  const swaps = await findAllSwap(filter);
  
  if (!swaps || swaps.length === 0) {
    return {
      totalFromAmount: 0,
      totalToAmount: 0,
      totalNairaAmount: 0,
      transactionCount: 0,
      fromCurrency: coin?.toUpperCase() || 'ALL',
      toCurrency: 'NGN',
      startDate,
      endDate
    };
  }

  // Calculate totals
  const totals = swaps.reduce(
    (acc: any, swap: any) => {
      const fromAmount = parseFloat(swap.fromAmount) || 0;
      const toAmount = parseFloat(swap.toAmount) || 0;
      const nairaAmount = Math.max(0, toAmount - 200); // Subtract processing fee, ensure non-negative

      return {
        totalFromAmount: acc.totalFromAmount + fromAmount,
        totalToAmount: acc.totalToAmount + toAmount,
        totalNairaAmount: acc.totalNairaAmount + nairaAmount
      };
    },
    {
      totalFromAmount: 0,
      totalToAmount: 0,
      totalNairaAmount: 0
    }
  );

  // Determine currencies
  const currencies = [...new Set(swaps.map((swap: any) => swap.fromCurrency?.toUpperCase()))];
  const toCurrencies = [...new Set(swaps.map((swap: any) => swap.toCurrency?.toUpperCase()))];

  return {
    ...totals,
    transactionCount: swaps.length,
    fromCurrency: coin?.toUpperCase() || (currencies.length === 1 ? currencies[0] : 'MIXED'),
    toCurrency: toCurrencies.length === 1 ? toCurrencies[0] : 'NGN',
    startDate,
    endDate
  };
};

/**
 * @function formatSwapSummary
 * @description Formats the swap summary into a readable message
 * @param {SwapSummary | null} summary - Swap summary object
 * @param {number} userId - User ID for context
 * @returns {string} Formatted summary message
 */
export const formatSwapSummary = (
  summary: SwapSummary | null, 
  userId: number
): string => {
  if (!summary) {
    return '❌ User not found. Please ensure you are registered.';
  }

  if (summary.totalFromAmount === 0) {
    return '🔄 No successful swap transactions found for the specified criteria.';
  }

  let message = '💱 *Swap Summary:*\n\n';
  
  message += `📊 Total Swapped: ${summary.totalFromAmount.toFixed(8)} ${summary.fromCurrency}\n`;
  message += `💰 Total Received (before fees): ₦${summary.totalToAmount.toLocaleString()}\n`;
  message += `💵 Total Net Amount: ₦${summary.totalNairaAmount.toLocaleString()}\n`;
  message += `📈 Transaction Count: ${summary.transactionCount}\n`;
  
  if (summary.transactionCount > 0) {
    const totalFees = summary.totalToAmount - summary.totalNairaAmount;
    message += `💸 Total Processing Fees: ₦${totalFees.toLocaleString()}\n`;
  }
  
  if (summary.startDate) {
    message += `📅 Start Date: ${new Date(summary.startDate).toLocaleDateString()}\n`;
  }
  
  if (summary.endDate) {
    message += `📅 End Date: ${new Date(summary.endDate).toLocaleDateString()}\n`;
  }

  return message;
};

/**
 * @function computeAndFormatTotalSwap
 * @description Convenience function that computes and formats swap summary
 * @param {ComputeTotalSwapParams} params - Parameters for computation
 * @returns {Promise<string>} Formatted swap summary message
 */
export const computeAndFormatTotalSwap = async (
  params: ComputeTotalSwapParams
): Promise<string> => {
  const summary = await computeTotalSwap(params);
  return formatSwapSummary(summary, params.userId);
};
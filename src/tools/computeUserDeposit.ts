import { getUserByTelegramId } from "../queries/user.query";
import { findAllDeposit } from "../queries/deposit.query";

/**
 * @interface ComputeTotalDepositParams
 * @description Parameters for computing total deposit amount
 */
interface ComputeTotalDepositParams {
  username?: string;
  userId: number;
  coin?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * @interface DepositSummary
 * @description Summary of deposit calculations
 */
interface DepositSummary {
  totalAmount: number;
  transactionCount: number;
  currency: string;
  startDate?: string;
  endDate?: string;
}

/**
 * @function computeTotalDeposit
 * @description Computes the total deposit amount for a user within a date range
 * @param {object} params - Parameters object
 * @param {number} params.userId - Telegram ID of the user
 * @param {string} [params.coin] - Optional crypto symbol (BTC, ETH, etc.)
 * @param {string} [params.startDate] - Optional start date filter (ISO string)
 * @param {string} [params.endDate] - Optional end date filter (ISO string)
 * @returns {Promise<DepositSummary | null>} Deposit summary or null if user not found
 */
export const computeTotalDeposit = async ({ 
  userId, 
  coin, 
  startDate, 
  endDate 
}: ComputeTotalDepositParams): Promise<DepositSummary | null> => {
  // Get user data
  const userData = await getUserByTelegramId(userId.toString());
  if (!userData) {
    return null;
  }

  // Build filter
  const filter: any = { 
    user: userData._id,
    status: 'success' // Only count successful deposits
  };
  
  if (coin) {
    filter.currency = coin.toLowerCase();
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

  // Get deposits
  const deposits = await findAllDeposit(filter);
  
  if (!deposits || deposits.length === 0) {
    return {
      totalAmount: 0,
      transactionCount: 0,
      currency: coin?.toUpperCase() || 'ALL',
      startDate,
      endDate
    };
  }

  // Calculate total amount
  const totalAmount = deposits.reduce((sum: number, deposit: any) => {
    return sum + (parseFloat(deposit.amount) || 0);
  }, 0);

  return {
    totalAmount,
    transactionCount: deposits.length,
    currency: coin?.toUpperCase() || deposits[0]?.currency?.toUpperCase() || 'MIXED',
    startDate,
    endDate
  };
};

/**
 * @function formatDepositSummary
 * @description Formats the deposit summary into a readable message
 * @param {DepositSummary | null} summary - Deposit summary object
 * @param {number} userId - User ID for context
 * @returns {string} Formatted summary message
 */
export const formatDepositSummary = (
  summary: DepositSummary | null
): string => {
  if (!summary) {
    return '❌ User not found. Please ensure you are registered.';
  }

  if (summary.totalAmount === 0) {
    return '📥 No successful deposit transactions found for the specified criteria.';
  }

  let message = '💰 *Deposit Summary:*\n\n';
  message += `📊 Total Amount: ${summary.totalAmount.toFixed(8)} ${summary.currency}\n`;
  message += `📈 Transaction Count: ${summary.transactionCount}\n`;
  
  if (summary.startDate) {
    message += `📅 Start Date: ${new Date(summary.startDate).toLocaleDateString()}\n`;
  }
  
  if (summary.endDate) {
    message += `📅 End Date: ${new Date(summary.endDate).toLocaleDateString()}\n`;
  }

  return message;
};

/**
 * @function computeAndFormatTotalDeposit
 * @description Convenience function that computes and formats deposit summary
 * @param {ComputeTotalDepositParams} params - Parameters for computation
 * @returns {Promise<string>} Formatted deposit summary message
 */
export const computeAndFormatTotalDeposit = async (
  params: ComputeTotalDepositParams
): Promise<string> => {
  const summary = await computeTotalDeposit(params);
  return formatDepositSummary(summary);
};
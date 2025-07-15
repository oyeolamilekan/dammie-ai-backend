import axios, { AxiosInstance } from "axios";
import CONFIG from "../config/config";
import Logging from "../library/logging.utils";

class QuidaxService {
  public request: AxiosInstance;

  constructor(apiKey: string) {
    Logging.info('QuidaxService initialized with API Key:', CONFIG.QUIDAX_API_URL);
    this.request = axios.create({
      baseURL: CONFIG.QUIDAX_API_URL,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })
  }

  // Central error handler for all network requests
  private handleNetworkError(error: any, operation: string) {
    if (error.response) {
      // Server responded with error status (4xx, 5xx)
      Logging.error(`${operation} failed - Server error:`, error.response.status, error.response.data);
      throw new Error(`Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
    } else if (error.request) {
      // Network error - request was made but no response
      Logging.error(`${operation} failed - Network error:`, error.message);
      throw new Error(`Network error: Unable to connect to Quidax API`);
    } else {
      // Other error (request setup, etc.)
      Logging.error(`${operation} failed - Error:`, error.message);
      throw new Error(`Request error: ${error.message}`);
    }
  }

  // Wrapper for all API calls with error handling
  private async makeRequest<T>(method: 'get' | 'post' | 'put' | 'delete', url: string, data?: any, operation?: string): Promise<T> {
    try {
      Logging.info(`${operation} initiating request - Network:`);
      const response = await this.request[method](url, data);
      return response.data.data;
    } catch (error) {
      this.handleNetworkError(error, operation || `${method.toUpperCase()} ${url}`);
      throw error; // This won't be reached due to throw in handleNetworkError
    }
  }

  // create sub user
  public createSubUser = async (data: Object): Promise<any> => {
    return this.makeRequest('post', 'users', data, 'Create sub user');
  }

  // fetch currency
  public fetchCurrency = async (userId: string, currency: string): Promise<any> => {
    return this.makeRequest('get', `users/${userId}/wallets/${currency}`, undefined, 'Fetch currency');
  }

  // create payment address
  public createPaymentAddress = async (userId: string, currency: string, network?: string) => {
    return this.makeRequest('post', `users/${userId}/wallets/${currency}/addresses${network ? `?network=${network}` : ''}`, undefined, 'Create payment address');
  }

  // create withdrawal
  public createWithdrawal = async (userId: string, body: Object): Promise<any> => {
    return this.makeRequest('post', `users/${userId}/withdraws/`, body, 'Create withdrawal');
  }

  // withdraw naira
  public createNgnWithdraw = async (accountNumber: string, bankCode: string, amount: string): Promise<any> => {
    const data = {
      "currency": "ngn",
      "amount": amount,
      "fund_uid": accountNumber,
      "fund_uid2": bankCode,
      "transaction_note": "Stay safe",
      "narration": "We love you."
    }
    return this.makeRequest('post', `users/me/withdraws`, data, 'Create NGN withdrawal');
  }

  // validate bank account
  public validateBankAccount = async (accountNumber: string, bankCode: string): Promise<any> => {
    const data = {
      "fund_uid": accountNumber,
      "fund_uid2": bankCode,
      "currency": "ngn"
    }
    return this.makeRequest('post', `banks/verify_account`, data, 'Validate bank account');
  }

  public createInstantSwap = async (userId: string, body: Object): Promise<any> => {
    return this.makeRequest('post', `users/${userId}/swap_quotation`, body, 'Create instant swap');
  }

  public refreshInstantSwap = async (userId: string, quotationId: string, body: Object): Promise<any> => {
    return this.makeRequest('post', `users/${userId}/swap_quotation/${quotationId}/refresh`, body, 'Refresh instant swap');
  }

  public confirmInstantSwap = async (userId: string, quotationId: string): Promise<any> => {
    return this.makeRequest('post', `users/${userId}/swap_quotation/${quotationId}/confirm`, undefined, 'Confirm instant swap');
  }
}

export const quidax = new QuidaxService(process.env.QUIDAX_API_KEY as string);
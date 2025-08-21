import CONFIG from "../config/config";

export const ACTIONS = {
  'ACTION: ADD_BANK_ACCOUNT': {
    buttonText: "🏦 Add Bank Account",
    url: `${CONFIG.FRONTEND_URL}/bank/`
  },
  'ACTION: APPROVE_SWAP_ACTION': {
    buttonText: "🏦 Approve Transaction", 
    url: `${CONFIG.FRONTEND_URL}/transaction/`
  }
};
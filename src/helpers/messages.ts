import CONFIG from "../config/config";

export const MESSAGES = {
  WELCOME: (username: string) => `
🚀 *Welcome to Dammie Crypto Bot!*

Hello ${username}, how far? I'm here to help you with crypto-to-Naira conversions! 💰

*Supported Cryptocurrencies:*
• Bitcoin (BTC)
• Tron (TRX)

Ready to start trading? Just type your request naturally, like:
• "What's my BTC balance?"
• "I want to swap 1TRX to Naira"

No wahala, I got you covered! 🇳🇬
  `,

  RATES: () => `
📈 *Current Exchange Rates*

BTC: ₦${CONFIG.CURRENT_RATES.BTC.toLocaleString()}
ETH: ₦${CONFIG.CURRENT_RATES.ETH.toLocaleString()}
USDT: ₦${CONFIG.CURRENT_RATES.USDT.toLocaleString()}
QDX: ₦${CONFIG.CURRENT_RATES.QDX.toLocaleString()}

*Rates are updated in real-time and subject to market fluctuations*
  `,

  HELP: () => `
❓ *How to Use Dammie Crypto Bot*

*Natural Language Commands:*
• "Check my BTC balance"
• "What's my USDT wallet address?"
• "I want to swap 100,000 naira to ethereum"
• "Give me a quote for 50,000 naira to BTC"

*Need Support?*
Email: support@appstate.co

*Security Tips:*
⚠️ Never share your private keys
⚠️ Always verify transaction details
⚠️ Double-check wallet addresses
  `,
  PENDING_DESPOSIT: (amount: string, currency: string, blockchain: string, hash: string) => `
🚀 Your deposit is on its way! ⏳
💎 Amount: ${amount} ${currency.toUpperCase()}
🌐 Blockchain: ${blockchain.toUpperCase()}
📝 Transaction ID: ${hash}
🔄 Currently awaiting network confirmations...
⏱️ This usually takes just a few minutes
🔔 We'll ping you the moment it's ready!
  `,
  ADDRESS_ASSIGNED: (address: string, currency: string) => `
🚀 Your wallet address has been assigned! ✅
💎 Address: ${address}
💎 Currency: ${currency.toUpperCase()}
You can now send your ${currency.toUpperCase()} to this address.
  `,
  SUCESS_DEPOSIT: (amount: string, currency: string, blockchain: string, hash: string) => `
🎉 Deposit Complete - You're All Set! ✅
💎 Amount Credited: ${amount} ${currency.toUpperCase()}
🌐 Blockchain: ${blockchain.toUpperCase()}
📝 Transaction ID: ${hash}
✨ Successfully confirmed and added to your balance
🚀 Your funds are now available for trading!

  `,
  RATE_LIMITED: "⚠️ Please slow down! You're sending messages too quickly. Try again in a minute.",
  ERROR: "😔 Sorry, I encountered an error. Please try again later or contact support.",
  RATE_LIMIT_ERROR: "⚠️ I'm receiving too many requests. Please wait a moment and try again.",
  INVALID_MESSAGE: "Please send a text message. I can help you with crypto transactions! 💰",
  UNKNOWN_REQUEST: "🤔 I'm not sure how to help with that. Try asking about crypto balances, wallet addresses, or swaps!",

  /**
   * @function SWAP_COMPLETED
   * @description Message for a successfully completed swap.
   * @param {string} amount - The amount of cryptocurrency swapped.
   * @param {string} currency - The currency symbol (e.g., BTC, ETH).
   */
  SWAP_COMPLETED: (amount: string, currency: string) => `
🎉 Swap Completed! Your ${amount} ${currency} swap is all done. The Naira has been sent to your bank. 🚀
`,

  /**
   * @function FAILED_SWAP
   * @description Message for a failed swap.
   * @param {string} amount - The amount of cryptocurrency that failed to swap.
   * @param {string} currency - The currency symbol (e.g., BTC, ETH).
   */
  FAILED_SWAP: (amount: string, currency: string) => `
❌ Your swap of ${amount} ${currency} has failed. The crypto has been returned to your wallet. Please try again or contact support. 😔
`,

  /**
   * @function BANK_ACCOUNT_UPDATED
   * @description Message for successfully updated bank account details.
   * @param {string} accountName - The name on the bank account.
   * @param {string} accountNumber - The bank account number.
   * @param {string} bankName - The name of the bank.
   */
  BANK_ACCOUNT_UPDATED: () => `
✅ Your bank account details have been successfully added!
`,
  ACCOUNT_CREATED: (username: string) => `
🎉 Account Created Successfully! ✅
Hello ${username}, how far? I'm here to help you with crypto-to-Naira conversions! 💰

*Supported Cryptocurrencies:*
• Bitcoin (BTC)
• Tron (TRX)

Ready to start trading? Just type your request naturally, like:
• "What's my BTC balance?"
• "I want to swap 1TRX to Naira"

No wahala, I got you covered! 🇳🇬
  `,
  SWAP_APPROVED: (amount: string, currency: string) => `
🎉 Swap Approved! ✅
Your swap of ${amount} ${currency} has been approved. And Transaction is being processed. 🚀
`
};
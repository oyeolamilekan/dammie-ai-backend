/**
 * @function addBankAccount
 * @description Generates a message instructing the user to add a bank account for crypto swaps.
 * This function creates a formatted message with required information and a call to action,
 * including a deep link for the Telegram web app to open the bank account form.
 * @param {object} user - An object containing user details, specifically `userId`.
 * @param {string} user.userId - The ID of the user, used for generating the deep link.
 * @returns {Promise<string>} A promise that resolves to a formatted string message
 *   with instructions and a button for adding a bank account.
 */
export const addBankAccount = async (user: any) => {
  return `
🏦 *Add Bank Account*

To receive Naira from your crypto swaps, you need to add a bank account.

📋 *Required Information:*
• Bank Name
• Account Number (10 digits)

⚠️ *Important:*
• The account name must match the name you used during registration
• Any mismatch will cause verification failure

📱 *Next Step:*
Click the button below to open the bank account form in Telegram and update your information.

ACTION: ADD_BANK_ACCOUNT
PARAM: ${user.userId}
`;
}

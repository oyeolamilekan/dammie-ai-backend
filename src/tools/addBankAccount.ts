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

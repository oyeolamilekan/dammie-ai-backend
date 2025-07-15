import asyncHandler from '../helpers/async-handler.helper';
import { Request, Response } from 'express';
import { getIntentByCompleteSignupId } from '../queries/intent.query';
import { createUser, getUserById, getUserByIntentId } from '../queries/user.query';
import { quidax } from '../services/quidax.service';
import { transformEmail } from '../utils';
import bcrypt from 'bcrypt';
import { createWalletJob, processSwap } from '../jobs/event.job';
import { NameMatcher } from '../helpers/nameMatcher';
import { createBank, findBank } from '../queries/bank.query';
import { findSwapById } from '../queries/swap.query';

// Constants
const SALT_ROUNDS = 10;
const NAME_MATCH_THRESHOLD = 'low';

// Response helpers
const createSuccessResponse = (message: string, data: any = null) => ({
  success: true,
  message,
  data
});

const createErrorResponse = (message: string, data: any = null) => ({
  success: false,
  message,
  data
});

// Validation helpers
const validateUserCreationInput = (email: string, firstName: string, lastName: string) => {
  if (!email || !firstName || !lastName) {
    return 'Email, first name, and last name are required';
  }
  return null;
};

const validateBankAccountInput = (bankCode: string, accountNumber: string) => {
  if (!bankCode || !accountNumber) {
    return 'Bank code and account number are required';
  }
  return null;
};

export const createUserController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, firstName, lastName, bvnNumber, pin } = req.body;

  // Validate intent existence
  const intent = await getIntentByCompleteSignupId(id);
  if (!intent) {
    return res.status(404).json(createErrorResponse('Intent not found'));
  }

  // Validate required fields
  const validationError = validateUserCreationInput(email, firstName, lastName);
  if (validationError) {
    return res.status(400).json(createErrorResponse(validationError));
  }

  // Check if user already exists
  const existingUser = await getUserByIntentId(intent._id as string);
  if (existingUser) {
    return res.status(400).json(createErrorResponse('User already exists'));
  }

  try {
    // Create sub-user in Quidax
    const quidaxResponse = await quidax.createSubUser({
      email: transformEmail(email),
      first_name: firstName,
      last_name: lastName
    });

    // Hash PIN for security
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPin = await bcrypt.hash(pin, salt);

    // Prepare user data
    const userData = {
      email,
      firstName,
      lastName,
      bvnNumber,
      hashedPin,
      intentId: intent.id,
      telegramId: intent.telegramId,
      chatId: intent.chatId,
      subUserId: quidaxResponse.id,
    };

    // Create user in database
    const user = await createUser(userData);

    // Create wallet job for the new user
    await createWalletJob({
      userId: user.id,
      subUserId: quidaxResponse.id,
      email: user.email
    });

    return res.status(201).json(createSuccessResponse('User successfully created', user));
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json(createErrorResponse('Failed to create user'));
  }
});

export const approveTransactionController = asyncHandler(async (req: Request, res: Response) => {
  const { swapId } = req.params;
  const { code } = req.body;

  // Validate swap existence
  const swap = await findSwapById(swapId);
  if (!swap) {
    return res.status(404).json(createErrorResponse('Swap does not exist'));
  }

  // Validate PIN code
  if (!code) {
    return res.status(400).json(createErrorResponse('PIN code is required'));
  }

  try {
    // Verify PIN
    const hashedPin = swap.user.hashedPin as string;
    const isPinValid = await bcrypt.compare(code, hashedPin);

    if (!isPinValid) {
      return res.status(400).json(createErrorResponse('Invalid PIN'));
    }

    // Process the swap
    await processSwap(swap);

    return res.status(200).json(createSuccessResponse('Transaction approved successfully'));
  } catch (error) {
    console.error('Error approving transaction:', error);
    return res.status(500).json(createErrorResponse('Failed to approve transaction'));
  }
});

export const addBankAccountController = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { bankCode, accountNumber } = req.body;

  // Validate user existence
  const user = await getUserById(userId);
  if (!user) {
    return res.status(404).json(createErrorResponse('User not found'));
  }

  // Validate input
  const validationError = validateBankAccountInput(bankCode, accountNumber);
  if (validationError) {
    return res.status(400).json(createErrorResponse(validationError));
  }

  try {
    // Check if bank account already exists
    const existingBankAccount = await findBank({ accountNumber, bankCode });
    if (existingBankAccount) {
      return res.status(400).json(createErrorResponse('Bank account already exists'));
    }

    // Validate bank account with Quidax
    const bankAccountData = await quidax.validateBankAccount(accountNumber, bankCode);
    const { account_name: accountName } = bankAccountData;

    // Verify account name matches user's profile
    const userFullName = `${user.firstName} ${user.lastName}`;
    const nameMatchResult = NameMatcher.compare(accountName, userFullName);

    if (nameMatchResult.match === NAME_MATCH_THRESHOLD) {
      return res.status(400).json(createErrorResponse('Account name does not match your profile name'));
    }

    // Create bank account record
    const bankAccountPayload = {
      user: user.id,
      accountNumber,
      accountName,
      bankCode,
    };

    const bankAccount = await createBank(bankAccountPayload);

    return res.status(200).json(createSuccessResponse('Bank account added successfully', bankAccount));
  } catch (error) {
    console.error('Error adding bank account:', error);
    return res.status(500).json(createErrorResponse('Failed to add bank account'));
  }
});
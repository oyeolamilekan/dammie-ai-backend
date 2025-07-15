import asyncHandler from '../helpers/async-handler.helper';
import { NextFunction, Request, Response } from "express";
import { 
  assignWalletAddress, 
  creditDepositConfirmation, 
  depositConfirmation, 
  processFinalizeSwap, 
  processSuccessSwap 
} from '../jobs/event.job';

export const cryptoWebhookController = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {
  const data = req.body;
  switch (data.event) {
    case 'wallet.address.generated':
      await assignWalletAddress(data);
      break;
    case 'deposit.transaction.confirmation':
      await depositConfirmation(data)
      break;
    case 'deposit.successful':
      await creditDepositConfirmation(data)
      break;
    case 'swap_transaction.completed':
      await processSuccessSwap(data)
      break;
    case 'swap_transaction.reversed':
      break;
    case 'swap_transaction.failed':
      break;
    case 'withdraw.successful':
      await processFinalizeSwap(data)
      break;
    default:
      break;
  }
  return res.status(200).json({})
})
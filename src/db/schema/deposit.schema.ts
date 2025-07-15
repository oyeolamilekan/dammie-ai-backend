import mongoose, { Schema, Types } from "mongoose";
import { IUser } from "./user.schema";
import { IWallet } from "./wallet.schema";
import CONFIG from "../../config/config";

export interface IDeposit {
  _id: Types.ObjectId;
  user: IUser;
  wallet: IWallet;
  despoitId: string;
  currency: string;
  txid: string;
  status: string;
  amount: number;
}

const DepositSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    wallet: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
    },
    despoitId: {
      type: String,
      required: true,
      unique: true
    },
    txid: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true,
      default: 'pending',
      enum: ['pending', 'failed', 'successful']
    },
    currency: {
      type: String,
      enum: CONFIG.SUPPORTED_CRYPTOS
    },
    amount: {
      type: Number,
      required: true
    }
  },
  {
    versionKey: false,
    timestamps: true,
    collection: 'deposits'
  }
)

export default mongoose.model<IDeposit>('Deposit', DepositSchema)

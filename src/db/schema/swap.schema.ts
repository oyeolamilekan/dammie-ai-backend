import mongoose, { Schema, Types } from "mongoose";
import { IUser } from "./user.schema";
import CONFIG from "../../config/config";

export interface ISwap extends mongoose.Document {
  _id: Types.ObjectId;
  user: IUser;
  quotationId: string;
  transactionId: string;
  fromCurrency: string;
  quotedPrice: string;
  toCurrency: string;
  fromAmount: string;
  withdrawId: string;
  toAmount: string;
  createdAt: Date;
  updatedAt: Date;
}


const SwapSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quotationId: {
      type: String,
      required: true
    },
    swapTransactionId: {
      type: String,
    },
    sweepId: {
      type: String,
    },
    sweepReference: {
      type: String,
    },
    fromCurrency: {
      type: String,
      required: true
    },
    quotedPrice: {
      type: String,
      required: true
    },
    toCurrency: {
      type: String,
      required: true
    },
    fromAmount: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: 'pending',
      enum: CONFIG.STATUS
    },
    withdrawId: {
      type: String
    },
    withdrawAmount: {
      type: Number,
    },
    swapStatus: {
      type: String,
      default: 'pending',
      enum: CONFIG.STATUS
    },
    sweepStatus: {
      type: String,
      default: 'pending',
      enum: CONFIG.STATUS
    },
    toAmount: {
      type: String,
      required: true,
    }
  },
  {
    versionKey: false,
    timestamps: true,
    collection: 'swaps'
  }
)

export default mongoose.model<ISwap>('Swap', SwapSchema)

// mermaid document
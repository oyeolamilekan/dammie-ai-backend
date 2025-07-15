import mongoose, { Schema, Types } from "mongoose";
import { IUser } from "./user.schema";

export interface IBank {
  _id: Types.ObjectId;
  user: IUser;
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankCode: string;
}

const BankSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
      unique: true
    },
    accountName: {
      type: String,
      required: true
    },
    bankCode: {
      type: String,
      required: true,
    }
  },
  {
    versionKey: false,
    timestamps: true,
    collection: 'banks'
  }
)

export default mongoose.model<IBank>('Bank', BankSchema)

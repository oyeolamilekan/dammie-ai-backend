import mongoose, { Schema, Types } from "mongoose";
import CONFIG from "../../config/config";
import { IUser } from "./user.schema"

interface WalletAddress {
  network: string;
  destinationTag?: string;
  address: string;
}

const WalletAddressSchema = new Schema<WalletAddress>({
  network: String,
  destinationTag: String,
  address: String
});

export interface IWallet {
  _id: Types.ObjectId;
  walletId: string;
  user: IUser;
  currency: string;
  address: WalletAddress[];
  balance: number;
  lockedBalance: number;
  isCrypto: boolean;
}

const WalletSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    walletId: {
      type: String,
    },
    inProgress: {
      default: false,
      type: Boolean
    },
    currency: {
      type: String,
      enum: CONFIG.SUPPORTED_CRYPTOS
    },
    balance: {
      type: Number,
      default: 0.00
    },
    lockedBalance: {
      type: Number,
      default: 0.00
    },
    isCrypto: {
      type: Boolean,
      default: true
    },
    address: [WalletAddressSchema]
  },
  {
    versionKey: false,
    timestamps: true,
    collection: 'wallets'
  }
)

export default mongoose.model<IWallet>('Wallet', WalletSchema)

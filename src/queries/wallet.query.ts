import { Types } from "mongoose";
import Wallet, { IWallet } from "../db/schema/wallet.schema";

interface FindWalletsOptions {
  limit?: number;
  skip?: number;
  sort?: Record<string, 1 | -1>;
  populate?: boolean;
}

type WalletCondition = Partial<Pick<IWallet, 'user' | 'currency' | 'balance' | 'isCrypto' | 'walletId'>> & {
  [key: string]: any;
};

// CREATE
export const createWallet = async (data: Partial<IWallet>) => {
  const wallet = await Wallet.create(data);
  return wallet
};


// READ
export const findWalletById = async (id: string) => {
  const wallet = await Wallet.findById(id).populate('user');
  return wallet;
};

export const findWallets = async (
  condition: WalletCondition = {},
  options: FindWalletsOptions = {}
) => {
  const { limit, skip, sort = { createdAt: -1 }, populate = true } = options;

  let query = Wallet.find(condition);

  if (populate) query = query.populate('user');
  if (sort) query = query.sort(sort);
  if (skip) query = query.skip(skip);
  if (limit) query = query.limit(limit);

  const wallets = await query;
  return wallets;
};

export const findOneWallet = async (condition: any) => {
  const wallet = await Wallet.findOne(condition).populate('user');
  return wallet
}

// UPDATE
export const updateWallet = async (id: string, data: Partial<IWallet>) => {
  const wallet = await Wallet.findByIdAndUpdate(id, data, { new: true }).populate('user');
  return wallet;

};

export const updateWalletBalance = async (id: string, balance: number) => {
  return updateWallet(id, { balance });
};

export const findAndUpdateWallet = async (condition: any, data: any) => {
  const wallet = await Wallet.findOneAndUpdate(condition, data)
  return wallet
}
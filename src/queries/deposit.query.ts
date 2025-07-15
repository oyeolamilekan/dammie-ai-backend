import Deposit from "../db/schema/deposit.schema";

export const createDeposit = async (data: any) => {
  const deposit = await Deposit.create(data);
  return deposit;
}

export const findDeposit = async (condition: any) => {
  const userModel = await Deposit.findOne(condition)
  return userModel
}

export const findAllDeposit = async (condition: any, page: number = 1) => {
  const userModel = Deposit.find(condition).sort("-createdAt");
  return userModel
}

export const findAndUpdateDeposit = async (condition: any, data: any) => {
  const deposit = await Deposit.findOneAndUpdate(condition, data)
  return deposit
}
import Bank from "../db/schema/bank.schema";

export const createBank = async (data: any) => {
  const bank = await Bank.create(data);
  return bank;
}

export const findBank = async (condition: any) => {
  const bank = await Bank.findOne(condition)
  return bank
}

export const findAllBank = async (condition: any, page: number = 1) => {
  const bank = Bank.find(condition).sort("-createdAt");
  return bank
}

export const findAndUpdateBank = async (condition: any, data: any) => {
  const bank = await Bank.findOneAndUpdate(condition, data)
  return bank
}
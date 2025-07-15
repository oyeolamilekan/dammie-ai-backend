import Swap from "../db/schema/swap.schema";

export const createSwap = async (data: any) => {
  console.log(data)
  const swap = await Swap.create(data);
  return swap;
}

export const findSwapById = async (swapId: string) => {
  const swap = await Swap.findById(swapId).populate("user")
  return swap
}

export const findSwap = async (condition: any) => {
  const swap = await Swap.findOne(condition).populate("user")
  return swap
}

export const findAllSwap = async (condition: any, page: number = 1) => {
  const swap = Swap.find(condition).sort("-createdAt");
  return swap
}

export const findAndUpdateSwap = async (condition: any, data: any) => {
  const swap = await Swap.findOneAndUpdate(condition, data).populate("user")
  return swap
}
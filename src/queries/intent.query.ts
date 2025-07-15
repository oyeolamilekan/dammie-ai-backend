import Intent, { IIntent, INewIntent } from "../db/schema/intent.schema";

// CREATE
export const createIntent = async (newIntent: INewIntent): Promise<IIntent> => {
  const intent = new Intent(newIntent);
  return await intent.save();
};

// READ - Get all intents
export const getAllIntents = async (): Promise<IIntent[]> => {
  return await Intent.find();
};

// READ - Get intent by ID
export const getIntentById = async (id: string): Promise<IIntent | null> => {
  return await Intent.findById(id);
};

// READ - Get intent by telegram ID
export const getIntentByTelegramId = async (telegramId: string): Promise<IIntent | null> => {
  return await Intent.findOne({ telegramId });
};

// READ - Get intent by chat ID
export const getIntentByChatId = async (chatId: string): Promise<IIntent | null> => {
  return await Intent.findOne({ chatId });
};

// READ - Get intent by complete signup ID
export const getIntentByCompleteSignupId = async (completeSignupId: string): Promise<IIntent | null> => {
  return await Intent.findOne({ completeSignupId });
};

// READ - Get intent by any condition
export const getIntentBy = async (condition: any): Promise<IIntent | null> => {
  return await Intent.findOne(condition);
};

// UPDATE - Update intent by ID
export const updateIntent = async (id: string, updates: Partial<INewIntent>): Promise<IIntent | null> => {
  return await Intent.findByIdAndUpdate(
    id,
    { 
      ...updates,
      updatedAt: new Date()
    },
    { new: true } // Return updated document
  );
};

// DELETE - Delete intent by ID
export const deleteIntent = async (id: string): Promise<IIntent | null> => {
  return await Intent.findByIdAndDelete(id);
};

// FIND OR CREATE - Find intent by telegram ID or create new
export const findOrCreateIntent = async (newIntent: INewIntent): Promise<IIntent> => {
  const existing = await getIntentByTelegramId(newIntent.telegramId);
  
  if (existing) {
    return existing;
  }

  return await createIntent(newIntent);
};

// UTILITY - Get completed intents only
export const getCompletedIntents = async (): Promise<IIntent[]> => {
  return await Intent.find({ isCompleted: 'true' });
};

// UTILITY - Get incomplete intents only
export const getIncompleteIntents = async (): Promise<IIntent[]> => {
  return await Intent.find({ isCompleted: 'false' });
};

// Update multiple intents
export const updateManyIntents = async (
  filter: any, 
  updates: Partial<INewIntent>
): Promise<{ modifiedCount: number }> => {
  const result = await Intent.updateMany(filter, {
    ...updates,
    updatedAt: new Date()
  });
  return { modifiedCount: result.modifiedCount };
};

// Delete multiple intents
export const deleteManyIntents = async (filter: any): Promise<{ deletedCount: number }> => {
  const result = await Intent.deleteMany(filter);
  return { deletedCount: result.deletedCount };
};

// Count intents
export const countIntents = async (filter: any = {}): Promise<number> => {
  return await Intent.countDocuments(filter);
};

// Paginated results
export const getIntentsPaginated = async (
  page: number = 1, 
  limit: number = 10,
  filter: any = {},
  sort: any = { createdAt: -1 }
): Promise<{
  intents: IIntent[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const skip = (page - 1) * limit;
  
  const [intents, total] = await Promise.all([
    Intent.find(filter).sort(sort).skip(skip).limit(limit),
    Intent.countDocuments(filter)
  ]);

  return {
    intents,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

// Check if intent exists
export const intentExists = async (condition: any): Promise<boolean> => {
  const count = await Intent.countDocuments(condition);
  return count > 0;
};

// Get intents created within date range
export const getIntentsByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<IIntent[]> => {
  return await Intent.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  });
};

// Find and update or create (upsert)
export const upsertIntent = async (
  filter: any,
  updates: Partial<INewIntent>
): Promise<IIntent> => {
  return await Intent.findOneAndUpdate(
    filter,
    { 
      ...updates,
      updatedAt: new Date()
    },
    { 
      new: true, 
      upsert: true 
    }
  );
};
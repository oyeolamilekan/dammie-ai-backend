import User, { INewUser, IPopulatedUser, IUser } from "../db/schema/user.schema";

// CREATE
export const createUser = async (newUser: INewUser): Promise<IUser> => {
  const user = await User.create(newUser);
  return user;
};

// READ - Get all users
export const getAllUsers = async (): Promise<IUser[]> => {
  return await User.find();
};

// READ - Get user by ID
export const getUserById = async (id: string): Promise<IUser | null> => {
  return await User.findById(id);
};

// READ - Get user by email
export const getUserByEmail = async (email: string): Promise<IUser | null> => {
  return await User.findOne({ email });
};

// READ - Get user by telegram ID
export const getUserByTelegramId = async (telegramId: string): Promise<IUser | null> => {
  return await User.findOne({ telegramId });
};

// READ - Get user by sub user ID
export const getUserBySubUserId = async (subUserId: string): Promise<IUser | null> => {
  return await User.findOne({ subUserId });
};

// READ - Get user by chat ID
export const getUserByChatId = async (chatId: string): Promise<IUser | null> => {
  return await User.findOne({ chatId });
};

// READ - Get user by intent ID
export const getUserByIntentId = async (intentId: string): Promise<IUser | null> => {
  return await User.findOne({ intentId });
};

// READ - Get user by any condition
export const getUserBy = async (condition: any): Promise<IUser | null> => {
  return await User.findOne(condition);
};

// UPDATE - Update user by ID
export const updateUser = async (id: string, updates: Partial<INewUser>): Promise<IUser | null> => {
  return await User.findByIdAndUpdate(
    id,
    { 
      ...updates,
      updatedAt: new Date()
    },
    { new: true }
  );
};

// DELETE - Delete user by ID
export const deleteUser = async (id: string): Promise<IUser | null> => {
  return await User.findByIdAndDelete(id);
};

// FIND OR CREATE - Find user by telegram ID or create new
export const findOrCreateUser = async (newUser: INewUser): Promise<IUser> => {
  const existing = await getUserByTelegramId(newUser.telegramId);
  
  if (existing) {
    return existing;
  }

  return await createUser(newUser);
};

// UTILITY - Get active users only
export const getActiveUsers = async (): Promise<IUser[]> => {
  return await User.find({ isActive: 'true' });
};

// UTILITY - Get inactive users only
export const getInactiveUsers = async (): Promise<IUser[]> => {
  return await User.find({ isActive: 'false' });
};

// Update multiple users
export const updateManyUsers = async (
  filter: any, 
  updates: Partial<INewUser>
): Promise<{ modifiedCount: number }> => {
  const result = await User.updateMany(filter, {
    ...updates,
    updatedAt: new Date()
  });
  return { modifiedCount: result.modifiedCount };
};

// Delete multiple users
export const deleteManyUsers = async (filter: any): Promise<{ deletedCount: number }> => {
  const result = await User.deleteMany(filter);
  return { deletedCount: result.deletedCount };
};

// Count users
export const countUsers = async (filter: any = {}): Promise<number> => {
  return await User.countDocuments(filter);
};

// Paginated results
export const getUsersPaginated = async (
  page: number = 1, 
  limit: number = 10,
  filter: any = {},
  sort: any = { createdAt: -1 },
  populate: boolean = false
): Promise<{
  users: IUser[] | IPopulatedUser[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const skip = (page - 1) * limit;
  
  let query = User.find(filter).sort(sort).skip(skip).limit(limit);
  
  if (populate) {
    query = query.populate('intentId');
  }
  
  const [users, total] = await Promise.all([
    query,
    User.countDocuments(filter)
  ]);

  return {
    users,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

// Check if user exists
export const userExists = async (condition: any): Promise<boolean> => {
  const count = await User.countDocuments(condition);
  return count > 0;
};

// Get users created within date range
export const getUsersByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<IUser[]> => {
  return await User.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  });
};

// Find and update or create (upsert)
export const upsertUser = async (
  filter: any,
  updates: Partial<INewUser>
): Promise<IUser> => {
  return await User.findOneAndUpdate(
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

// Get users by multiple telegram IDs
export const getUsersByTelegramIds = async (telegramIds: string[]): Promise<IUser[]> => {
  return await User.find({
    telegramId: { $in: telegramIds }
  });
};

// Get users by multiple emails
export const getUsersByEmails = async (emails: string[]): Promise<IUser[]> => {
  return await User.find({
    email: { $in: emails }
  });
};

// Search users by name (case-insensitive)
export const searchUsersByName = async (searchTerm: string): Promise<IUser[]> => {
  const regex = new RegExp(searchTerm, 'i');
  return await User.find({
    $or: [
      { firstName: regex },
      { lastName: regex }
    ]
  });
};

// Get user stats
export const getUserStats = async () => {
  const [total, active, inactive] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: 'true' }),
    User.countDocuments({ isActive: 'false' })
  ]);

  return {
    total,
    active,
    inactive
  };
};

// Activate/Deactivate user
export const toggleUserStatus = async (id: string): Promise<IUser | null> => {
  const user = await User.findById(id);
  if (!user) return null;

  const newStatus = user.isActive === true ? false : true;
  return await updateUser(id, { isActive: newStatus });
};
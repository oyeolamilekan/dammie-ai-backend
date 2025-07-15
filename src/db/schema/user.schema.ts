import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    maxlength: 250
  },
  firstName: {
    type: String,
    required: true,
    maxlength: 250
  },
  lastName: {
    type: String,
    required: true,
    maxlength: 250
  },
  bvnNumber: {
    type: String,
    required: true,
    maxlength: 250
  },
  hashedPin: {
    type: String,
    required: true,
    maxlength: 250
  },
  telegramId: {
    type: String,
    required: true,
    unique: true
  },
  subUserId: {
    type: String,
    required: true,
    unique: true
  },
  intentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Intent', // Reference to the Intent model
    required: true
  },
  chatId: {
    type: String,
    required: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true
  }
}, {
  timestamps: true, // Creates createdAt and updatedAt automatically
  collection: 'users'
});

// Create the model
const User = mongoose.model('User', userSchema);

export default User;

// Type definitions (if using TypeScript)
export interface IUser extends mongoose.Document {
  email: string;
  firstName: string;
  lastName: string;
  telegramId: string;
  subUserId: string;
  intentId: mongoose.Types.ObjectId;
  chatId: string;
  hashedPin: string,
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// For creating new users
export interface INewUser {
  email: string;
  firstName: string;
  lastName: string;
  telegramId: string;
  subUserId: string;
  hashedPin: string,
  intentId: mongoose.Types.ObjectId;
  chatId: string;
  isActive?: boolean;
}

// Populated user type (when intent is populated)
export interface IPopulatedUser extends Omit<IUser, 'intentId'> {
  intentId: {
    _id: mongoose.Types.ObjectId;
    telegramId: string;
    chatId: string;
    completeSignupId: string;
    isCompleted: string;
    hashedPin: string,
    createdAt: Date;
    updatedAt: Date;
  };
}
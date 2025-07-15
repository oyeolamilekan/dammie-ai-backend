import mongoose from 'mongoose';

const intentSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    required: true,
    maxlength: 15
  },
  chatId: {
    type: String,
    required: true,
    maxlength: 250
  },
  completeSignupId: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString() 
  },
  isCompleted: {
    type: String,
    required: true,
    default: 'false'
  }
}, {
  timestamps: true, // This creates createdAt and updatedAt automatically
  collection: 'intents'
});

// Create the model
const Intent = mongoose.model('Intent', intentSchema);

export default Intent;

// Type definitions (if using TypeScript)
export interface IIntent extends mongoose.Document {
  telegramId: string;
  chatId: string;
  completeSignupId: string;
  isCompleted: string;
  createdAt: Date;
  updatedAt: Date;
}

// For creating new intents
export interface INewIntent {
  telegramId: string;
  chatId: string;
  completeSignupId?: string;
  isCompleted?: string;
}
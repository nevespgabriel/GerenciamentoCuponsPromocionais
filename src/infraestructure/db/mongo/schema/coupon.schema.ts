import mongoose from 'mongoose';

export const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true, // Assuming IDs are unique
    minlenght: 3
  },
  discountPercent: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  expirationDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'valid', 'invalid'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set the createdAt field if not provided
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Automatically set the updatedAt field if not provided
  },
});

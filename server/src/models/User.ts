import { Schema, model } from 'mongoose';

interface IUser {
  email: string;
  password?: string; // Optional for OAuth or simple auth if we expand later
  full_name?: string;
  google_id?: string; // Google OAuth ID
  role: 'user' | 'admin';
  created_at: Date;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Can be null if using magic links or OAuth, but we'll use password based on plan
  full_name: { type: String },
  google_id: { type: String, unique: true, sparse: true }, // Sparse index allows null values
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  created_at: { type: Date, default: Date.now }
});

export const User = model<IUser>('User', userSchema);

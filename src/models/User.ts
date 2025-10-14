import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user' | 'hoster';
  createdAt: number;
  isActive: boolean;
  // any other fields...
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  createdAt: { type: Number, default: Date.now },
  isActive: { type: Boolean, default: true }
});

export default mongoose.model<IUser>('User', UserSchema);

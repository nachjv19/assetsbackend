import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  sku: string;
  name: string;
  brand: string;
  quantity: number;
  price: number;
  isActive: boolean;
  category?: string;
  imageUrl?: string;
  createdAt: number;
}

const ProductSchema: Schema = new Schema({
  sku: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  brand: { type: String },
  quantity: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  category: { type: String },
  imageUrl: { type: String },
  createdAt: { type: Number, default: Date.now }
});

export default mongoose.model<IProduct>('Product', ProductSchema);

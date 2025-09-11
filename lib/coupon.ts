import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  expirationDate: Date;
  maxUses: number;
  usedCount: number; // To track how many times it has been used
  applicableTo: 'all' | 'products' | 'categories';
  applicableItems?: string[]; // Array of product IDs or category slugs
  minPurchaseAmount?: number; // Optional: minimum purchase amount for the coupon to be valid
}

const CouponSchema: Schema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountType: { type: String, required: true, enum: ['percentage', 'fixed'] },
  value: { type: Number, required: true },
  expirationDate: { type: Date, required: true },
  maxUses: { type: Number, required: true, default: 1 },
  usedCount: { type: Number, required: true, default: 0 },
  applicableTo: { type: String, required: true, enum: ['all', 'products', 'categories'], default: 'all' },
  applicableItems: { type: [String], default: [] },
  minPurchaseAmount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);

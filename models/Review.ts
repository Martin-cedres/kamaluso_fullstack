import mongoose, { Schema, model, models, Document, Model } from 'mongoose';

// Interface para el documento de Review
export interface IReview extends Document {
  productId: mongoose.Schema.Types.ObjectId;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  imageUrls: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

const ReviewSchema = new Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  userId: { type: String, required: true }, // ID del usuario de NextAuth
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  imageUrls: [{ type: String }], // Array de URLs de imágenes en S3
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

// Añadir el tipo explícito al modelo para resolver la ambigüedad de TypeScript
const Review: Model<IReview> = models.Review || model<IReview>('Review', ReviewSchema);

export default Review;
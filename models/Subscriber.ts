import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscriber extends Document {
  email: string;
  name?: string;
  phone?: string;
  tags?: string[];
  isWholesaler?: boolean;
  subscribedAt: Date;
}

const SubscriberSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  phone: { type: String },
  tags: [{ type: String }],
  isWholesaler: { type: Boolean, default: false },
  subscribedAt: { type: Date, default: Date.now },
});

const Subscriber = mongoose.models.Subscriber || mongoose.model<ISubscriber>('Subscriber', SubscriberSchema);

export default Subscriber;

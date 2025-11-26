import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IRealResult extends Document {
    title: string;
    description?: string;
    mockupImage: string;
    realImage: string;
    product?: mongoose.Types.ObjectId; // Reference to a product (optional)
    date: Date;
    active: boolean;
}

const realResultSchema: Schema<IRealResult> = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        mockupImage: { type: String, required: true },
        realImage: { type: String, required: true },
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        date: { type: Date, default: Date.now },
        active: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

const RealResult: Model<IRealResult> =
    mongoose.models.RealResult || mongoose.model<IRealResult>('RealResult', realResultSchema);

export default RealResult;

import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISeoStrategy extends Document {
    topic: string;
    targetKeywords: string[];
    suggestedTitle: string;
    rationale: string;
    relatedProducts: mongoose.Types.ObjectId[];
    suggestedPosts: string[]; // Títulos de artículos de blog sugeridos
    status: 'proposed' | 'approved' | 'rejected' | 'generated';
    createdAt: Date;
    updatedAt: Date;
}

const seoStrategySchema: Schema<ISeoStrategy> = new Schema(
    {
        topic: { type: String, required: true },
        targetKeywords: [{ type: String }],
        suggestedTitle: { type: String },
        rationale: { type: String },
        relatedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
        suggestedPosts: [{ type: String }],
        status: {
            type: String,
            enum: ['proposed', 'approved', 'rejected', 'generated'],
            default: 'proposed',
        },
    },
    {
        timestamps: true,
    }
);

// Prevenir recompilación en hot-reload
const SeoStrategy: Model<ISeoStrategy> =
    mongoose.models.SeoStrategy || mongoose.model<ISeoStrategy>('SeoStrategy', seoStrategySchema);

export default SeoStrategy;

import mongoose, { Schema, Document } from 'mongoose';

export interface ISocialPost extends Document {
    productId: mongoose.Types.ObjectId;
    productName: string;
    platform: 'facebook' | 'instagram';

    // Contenido
    caption: string;
    hashtags: string[];
    imageUrl: string;

    // Estado
    status: 'draft' | 'scheduled' | 'published' | 'failed';
    scheduledAt?: Date;
    publishedAt?: Date;
    publishedUrl?: string;
    errorMessage?: string;

    // Analytics
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;

    // Metadata
    prompt: string;
    generatedWith: string;

    createdAt: Date;
    updatedAt: Date;
}

const SocialPostSchema = new Schema<ISocialPost>(
    {
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
            index: true
        },
        productName: {
            type: String,
            required: true
        },
        platform: {
            type: String,
            enum: ['facebook', 'instagram'],
            required: true,
            index: true
        },
        caption: {
            type: String,
            required: true
        },
        hashtags: {
            type: [String],
            default: []
        },
        imageUrl: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['draft', 'scheduled', 'published', 'failed'],
            default: 'draft',
            index: true
        },
        scheduledAt: {
            type: Date,
            index: true
        },
        publishedAt: {
            type: Date
        },
        publishedUrl: {
            type: String
        },
        errorMessage: {
            type: String
        },
        views: {
            type: Number,
            default: 0
        },
        likes: {
            type: Number,
            default: 0
        },
        comments: {
            type: Number,
            default: 0
        },
        shares: {
            type: Number,
            default: 0
        },
        prompt: {
            type: String,
            required: true
        },
        generatedWith: {
            type: String,
            required: true,
            default: 'gemini-2.5-pro'
        }
    },
    {
        timestamps: true
    }
);

// Índices compuestos para consultas comunes
SocialPostSchema.index({ platform: 1, status: 1 });
SocialPostSchema.index({ productId: 1, platform: 1 });
SocialPostSchema.index({ scheduledAt: 1, status: 1 });

export default mongoose.models.SocialPost || mongoose.model<ISocialPost>('SocialPost', SocialPostSchema);

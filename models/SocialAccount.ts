import mongoose, { Schema, Document } from 'mongoose';

export interface ISocialAccount extends Document {
    platform: 'facebook' | 'instagram';
    accountName: string;
    accountId: string; // Page ID o Instagram Business Account ID
    accessToken: string; // TODO: Encriptar en producción
    refreshToken?: string;
    tokenExpiresAt?: Date;
    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const SocialAccountSchema = new Schema<ISocialAccount>(
    {
        platform: {
            type: String,
            enum: ['facebook', 'instagram'],
            required: true,
            index: true
        },
        accountName: {
            type: String,
            required: true
        },
        accountId: {
            type: String,
            required: true,
            unique: true
        },
        accessToken: {
            type: String,
            required: true
            // TODO: Usar crypto para encriptar en producción
        },
        refreshToken: {
            type: String
        },
        tokenExpiresAt: {
            type: Date
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true
        }
    },
    {
        timestamps: true
    }
);

// Índice único por plataforma
SocialAccountSchema.index({ platform: 1, accountId: 1 }, { unique: true });

export default mongoose.models.SocialAccount || mongoose.model<ISocialAccount>('SocialAccount', SocialAccountSchema);

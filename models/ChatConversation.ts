import { Schema, model, models, Model } from 'mongoose';

const MessageSchema = new Schema({
    role: { type: String, required: true, enum: ['user', 'model', 'system'] },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const ChatConversationSchema = new Schema({
    messages: [MessageSchema],
    startedAt: { type: Date, default: Date.now },
    lastMessageAt: { type: Date, default: Date.now },
    deviceInfo: { type: String }, // User Agent or similar
    status: { type: String, default: 'active', enum: ['active', 'closed'] },
    // Analytics & SEO Metadata
    analytics: {
        intent: { type: String, enum: ['compra', 'duda_producto', 'envios', 'reclamo', 'otro', 'indefinido'] },
        category: { type: String }, // Granular topic, e.g., "agendas", "precios"
        sentiment: { type: String, enum: ['positivo', 'neutro', 'negativo'] },
        productContext: { type: String }, // Slug of product if applicable
        converted: { type: Boolean, default: false } // If they clicked a conversion link
    },
    metadata: { type: Object } // Future proofing
}, {
    timestamps: true,
});

export interface IMessage {
    role: 'user' | 'model' | 'system';
    content: string;
    timestamp: Date;
}

export interface IChatConversation {
    messages: IMessage[];
    startedAt: Date;
    lastMessageAt: Date;
    deviceInfo?: string;
    status: 'active' | 'closed';
    analytics?: {
        intent?: 'compra' | 'duda_producto' | 'envios' | 'reclamo' | 'otro' | 'indefinido';
        category?: string;
        sentiment?: 'positivo' | 'neutro' | 'negativo';
        productContext?: string;
        converted?: boolean;
    };
    metadata?: Record<string, any>;
    createdAt?: Date;
    updatedAt?: Date;
}

export const ChatConversation = (models.ChatConversation as Model<IChatConversation>) || model<IChatConversation>('ChatConversation', ChatConversationSchema);

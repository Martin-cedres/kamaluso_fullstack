import mongoose, { Document, Schema } from 'mongoose';

export interface IEventPage extends Document {
    title: string;
    slug: string;
    eventType: string;
    eventDate: {
        month: number;
        day: number;
    };
    content: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    heroImage?: string;
    selectedProducts: mongoose.Types.ObjectId[];
    autoRefresh: boolean;
    status: 'published' | 'draft';
    createdAt: Date;
    updatedAt: Date;
}

const EventPageSchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        eventType: {
            type: String,
            required: true,
            enum: [
                'Día de la Madre',
                'Día del Padre',
                'Día del Niño',
                'Día del Maestro',
                'Navidad',
                'Reyes',
                'San Valentín',
                'Vuelta a Clases',
                'Black Friday',
                'Cyber Monday',
                'Otro'
            ],
        },
        eventDate: {
            month: {
                type: Number,
                required: true,
                min: 1,
                max: 12,
            },
            day: {
                type: Number,
                required: true,
                min: 1,
                max: 31,
            },
        },
        content: {
            type: String,
            required: false,
            default: '',
        },
        seoTitle: {
            type: String,
            trim: true,
        },
        seoDescription: {
            type: String,
            trim: true,
        },
        seoKeywords: {
            type: String,
            trim: true,
        },
        heroImage: {
            type: String,
            trim: true,
        },
        selectedProducts: [{
            type: Schema.Types.ObjectId,
            ref: 'Product',
        }],
        autoRefresh: {
            type: Boolean,
            default: true,
        },
        status: {
            type: String,
            enum: ['published', 'draft'],
            default: 'draft',
        },
    },
    {
        timestamps: true,
    }
);

// Index para búsquedas rápidas
EventPageSchema.index({ status: 1 });
EventPageSchema.index({ eventType: 1 });

// Prevenir recompilación en hot-reload
const EventPage: mongoose.Model<IEventPage> = mongoose.models.EventPage || mongoose.model<IEventPage>('EventPage', EventPageSchema);

export default EventPage;

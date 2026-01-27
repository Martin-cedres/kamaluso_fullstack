import mongoose, { Schema, model, models } from 'mongoose';

const QuoteSchema = new Schema({
    quoteNumber: {
        type: String,
        required: true,
        unique: true,
    },
    customer: {
        name: { type: String },
        email: { type: String },
        phone: { type: String },
        company: { type: String },
    },
    items: [{
        productName: { type: String },
        productLink: { type: String }, // URL opcional al producto en la web
        imageUrl: { type: String }, // URL de la imagen del producto
        description: { type: String },
        quantity: { type: Number },
        unitPrice: { type: Number },
        subtotal: { type: Number },
        customizations: [{ type: String }],
    }],
    subtotal: { type: Number },
    discount: { type: Number, default: 0 },
    discountType: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' }, // Tipo de descuento
    discountDescription: { type: String }, // Descripción del descuento (opcional)
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number },
    status: {
        type: String,
        enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'],
        default: 'draft',
    },
    validUntil: { type: Date, required: true },
    notes: { type: String }, // Notas internas
    terms: { type: String }, // Términos y condiciones específicos
    hideTotal: { type: Boolean, default: false }, // Si es true, no muestra el total general
    sentAt: { type: Date },
    acceptedAt: { type: Date },
    createdBy: { type: String }, // Email del admin que lo creó
}, {
    timestamps: true,
});

export const Quote = (models.Quote || model('Quote', QuoteSchema)) as any;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Quote = void 0;
const mongoose_1 = require("mongoose");
const QuoteSchema = new mongoose_1.Schema({
    quoteNumber: {
        type: String,
        required: true,
        unique: true,
    },
    customer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String },
        company: { type: String },
    },
    items: [{
            productName: { type: String, required: true },
            productLink: { type: String }, // URL opcional al producto en la web
            imageUrl: { type: String }, // URL de la imagen del producto
            description: { type: String },
            quantity: { type: Number, required: true },
            unitPrice: { type: Number, required: true },
            subtotal: { type: Number, required: true },
            customizations: [{ type: String }],
        }],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    discountType: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' }, // Tipo de descuento
    discountDescription: { type: String }, // Descripción del descuento (opcional)
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
        type: String,
        enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'],
        default: 'draft',
    },
    validUntil: { type: Date, required: true },
    notes: { type: String }, // Notas internas
    terms: { type: String }, // Términos y condiciones específicos
    sentAt: { type: Date },
    acceptedAt: { type: Date },
    createdBy: { type: String }, // Email del admin que lo creó
}, {
    timestamps: true,
});
exports.Quote = (mongoose_1.models.Quote || (0, mongoose_1.model)('Quote', QuoteSchema));

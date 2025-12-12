"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const productSchema = new mongoose_1.Schema({
    nombre: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    claveDeGrupo: { type: String, trim: true, index: true },
    descripcion: { type: String, required: true },
    descripcionBreve: { type: String },
    puntosClave: [{ type: String }],
    descripcionExtensa: { type: String },
    faqs: [{ question: { type: String }, answer: { type: String } }], // Nuevo campo para FAQs
    useCases: [{ type: String }], // Nuevo campo para Casos de Uso
    basePrice: { type: Number, required: true },
    categoria: { type: String },
    subCategoria: [{ type: String }],
    seoTitle: { type: String },
    seoDescription: { type: String },
    seoKeywords: [{ type: String }],
    alt: { type: String },
    notes: { type: String },
    status: { type: String, default: 'activo' }, // Status del producto (activo/inactivo)
    destacado: { type: Boolean, default: false },
    imageUrl: { type: String, required: true },
    images: [{ type: String }],
    order: { type: Number, default: 0 },
    coverDesignGroupNames: [{ type: String }],
    customizationGroups: [
        {
            name: String,
            displayTitle: String,
            displayOrder: Number, // Nuevo campo para el orden
            type: String,
            required: Boolean,
            options: [
                {
                    name: String,
                    priceModifier: Number,
                    image: String,
                },
            ],
            dependsOn: {
                groupName: String,
                optionName: String,
            },
        },
    ],
    // Campos para el flujo de revisión de la IA
    proposedContent: { type: String },
    contentStatus: {
        type: String,
        required: true,
        enum: ['published', 'pending_review'],
        default: 'published',
    },
    // RAG: Vector Embedding
    embedding: { type: [Number], select: false }, // select: false para no cargarlo siempre por defecto
}, {
    timestamps: true, // Handles createdAt and updatedAt
});
const Product = mongoose_1.default.models.Product || mongoose_1.default.model('Product', productSchema);
exports.default = Product;

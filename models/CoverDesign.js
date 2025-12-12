"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CoverDesignSchema = new mongoose_1.Schema({
    code: {
        type: String,
        required: [true, 'El código del diseño de tapa es obligatorio.'],
        unique: true,
        trim: true,
        uppercase: true,
    },
    name: {
        type: String,
        trim: true,
    },
    imageUrl: {
        type: String,
        required: [true, 'La URL de la imagen del diseño de tapa es obligatoria.'],
    },
    priceModifier: {
        type: Number,
        default: 0,
    },
    groups: {
        type: [String],
        default: [],
    },
}, {
    timestamps: true,
});
// Use a helper to get the model, ensuring it's only defined once
const CoverDesign = mongoose_1.models.CoverDesign || (0, mongoose_1.model)('CoverDesign', CoverDesignSchema);
exports.default = CoverDesign;

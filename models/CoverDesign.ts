import mongoose, { Schema, model, models, Document, Model } from 'mongoose';

export interface ICoverDesign extends Document {
  code: string;
  name?: string;
  imageUrl: string;
  priceModifier?: number;
  groups: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CoverDesignSchema = new Schema<ICoverDesign>({
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
const CoverDesign: Model<ICoverDesign> = models.CoverDesign || model<ICoverDesign>('CoverDesign', CoverDesignSchema);

export default CoverDesign;

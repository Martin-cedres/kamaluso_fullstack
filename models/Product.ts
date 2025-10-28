import mongoose, { Document, Schema, Model } from 'mongoose'

export interface ICustomizationOption {
  _id?: string;
  name: string;
  priceModifier: number;
  image?: string;
}

export interface ICustomizationGroup {
  name: string;
  type: 'radio' | 'checkbox' | 'text';
  options: ICustomizationOption[];
  dependsOn?: {
    groupName: string;
    optionName: string;
  };
}

export interface IProduct extends Document {
  _id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  basePrice: number;
  categoria?: string;
  subCategoria?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  alt?: string;
  notes?: string;
  status: string;
  destacado: boolean;
  imageUrl: string;
  images?: string[];
  averageRating?: number;
  numReviews?: number;
  claveDeGrupo?: string;
  customizationGroups?: ICustomizationGroup[]; // Para opciones estáticas (Tipo de Tapa, etc.)
  coverDesignGroupNames?: string[]; // Para galerías de diseños dinámicas
  order?: number;
}

const productSchema: Schema<IProduct> = new Schema(
  {
    nombre: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    claveDeGrupo: { type: String, trim: true, index: true },
    descripcion: { type: String, required: true },
    basePrice: { type: Number, required: true },
    categoria: { type: String },
    subCategoria: [{ type: String }],
    seoTitle: { type: String },
    seoDescription: { type: String },
    seoKeywords: [{ type: String }],
    alt: { type: String },
    notes: { type: String },
    status: { type: String, default: 'activo' },
    destacado: { type: Boolean, default: false },
    imageUrl: { type: String, required: true },
    images: [{ type: String }],
    order: { type: Number, default: 0 },
    coverDesignGroupNames: [{ type: String }],
    customizationGroups: [
      {
        name: String,
        type: String,
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
  },
  {
    timestamps: true, // Handles createdAt and updatedAt
  },
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema)

export default Product

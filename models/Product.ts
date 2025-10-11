import mongoose, { Document, Schema, Model } from 'mongoose'

export interface ICustomizationOption {
  _id?: string; // Añadido para identificar unívocamente la opción
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
  precioFlex?: number; // Campo legado, opcional
  precioDura?: number; // Campo legado, opcional
  categoria?: string; // Ahora opcional
  subCategoria?: string[];
  tapa?: string; // Campo legado, opcional
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  alt?: string;
  notes?: string;
  status: string;
  destacado: boolean;
  soloDestacado?: boolean; // Nuevo campo
  imageUrl: string;
  images?: string[];
  averageRating?: number;
  numReviews?: number;
  claveDeGrupo?: string;
  customizationGroups?: ICustomizationGroup[];
}

const productSchema: Schema<IProduct> = new Schema(
  {
    nombre: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    claveDeGrupo: { type: String, trim: true, index: true },
    descripcion: { type: String, required: true },
    basePrice: { type: Number, required: true },
    precioFlex: { type: Number }, // Campo legado
    precioDura: { type: Number }, // Campo legado
    categoria: { type: String }, // Ahora opcional
    subCategoria: [{ type: String }],
    tapa: { type: String }, // Campo legado
    seoTitle: { type: String },
    seoDescription: { type: String },
    seoKeywords: [{ type: String }],
    alt: { type: String },
    notes: { type: String },
    status: { type: String, default: 'activo' },
    destacado: { type: Boolean, default: false },
    soloDestacado: { type: Boolean, default: false }, // Nuevo campo
    imageUrl: { type: String, required: true },
    images: [{ type: String }],
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

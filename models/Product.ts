import mongoose, { Document, Schema, Model } from 'mongoose'

export interface IProduct extends Document {
  _id: string;
  nombre: string;
  slug: string
  descripcion: string
  precio: number
  precioFlex?: number
  precioDura?: number
  categoria: string
  subCategoria?: string[]
  tapa?: string
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  alt?: string
  notes?: string
  status: string
  destacado: boolean
  imageUrl: string
  images?: string[];
  averageRating?: number;
  numReviews?: number;
}

const productSchema: Schema<IProduct> = new Schema(
  {
    nombre: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    descripcion: { type: String, required: true },
    precio: { type: Number, required: true },
    precioFlex: { type: Number, default: 0 },
    precioDura: { type: Number, default: 0 },
    categoria: { type: String, required: true },
    subCategoria: [{ type: String }],
    tapa: { type: String },
    seoTitle: { type: String },
    seoDescription: { type: String },
    seoKeywords: [{ type: String }],
    alt: { type: String },
    notes: { type: String },
    status: { type: String, default: 'activo' },
    destacado: { type: Boolean, default: false },
    imageUrl: { type: String, required: true },
    images: [{ type: String }],
  },
  {
    timestamps: true, // Handles createdAt and updatedAt
  },
)

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema)

export default Product

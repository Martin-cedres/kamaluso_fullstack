import mongoose, { Document, Schema, Model } from 'mongoose'

export interface ICustomizationOption {
  _id?: string;
  name: string;
  priceModifier: number;
  image?: string;
}

export interface ICustomizationGroup {
  name: string;
  displayTitle?: string;
  displayOrder?: number; // Nuevo campo para el orden
  type: 'radio' | 'checkbox' | 'text' | 'cover-design';
  options: ICustomizationOption[];
  required?: boolean;
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
  descripcionBreve?: string;
  puntosClave?: string[];
  descripcionExtensa?: string;
  faqs?: { question: string; answer: string; }[]; // Nuevo campo para FAQs
  useCases?: string[]; // Nuevo campo para Casos de Uso
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

  // Campos para el flujo de revisión de la IA
  proposedContent?: string; // Staging para descripcionExtensa
  contentStatus: 'published' | 'pending_review';
  embedding?: number[];
}

const productSchema: Schema<IProduct> = new Schema(
  {
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
  },
  {
    timestamps: true, // Handles createdAt and updatedAt
  },
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema)

export default Product

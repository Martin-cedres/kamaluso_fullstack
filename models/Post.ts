import mongoose, { Document, Schema, Model } from 'mongoose'

export interface IPost extends Document {
  title: string
  slug: string
  content: string
  excerpt?: string
  subtitle?: string
  coverImage?: string
  tags?: string[]
  seoTitle?: string
  seoDescription?: string
  // Campos para el flujo de revisión de la IA
  proposedContent?: string; // Contenido sugerido por la IA, pendiente de aprobación
  status: 'published' | 'pending_review'; // Estado del contenido
  createdAt: Date; // Añadido para que TS lo reconozca
  updatedAt: Date; // Añadido para que TS lo reconozca
}

const postSchema: Schema<IPost> = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String },
    subtitle: { type: String },
    coverImage: { type: String },
    tags: [{ type: String }],
    seoTitle: { type: String },
    seoDescription: { type: String },
    // Campos para el flujo de revisión de la IA
    proposedContent: { type: String },
    status: {
      type: String,
      required: true,
      enum: ['published', 'pending_review'],
      default: 'published',
    },
  },
  {
    timestamps: true, // This will add createdAt and updatedAt fields
  },
)

// To prevent model recompilation on hot-reloads
const Post: Model<IPost> =
  mongoose.models?.Post || mongoose.model<IPost>('Post', postSchema)

export default Post

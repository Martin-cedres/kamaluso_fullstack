import mongoose, { Document, Schema, Model } from 'mongoose';

// Interfaz para la Página Pilar
export interface IPillarPage extends Document {
  title: string;          // Título principal de la página pilar
  slug: string;           // URL amigable
  content: string;        // Contenido extenso de la página pilar
  topic: string;          // El tema central del cluster (ej: "Agendas Personalizadas")
  
  // SEO Fields
  seoTitle?: string;
  seoDescription?: string;

  // Relaciones con el Cluster
  clusterPosts: mongoose.Types.ObjectId[];    // Array de IDs de Artículos de Blog
  clusterProducts: mongoose.Types.ObjectId[]; // Array de IDs de Productos
  
  // Campos para el flujo de revisión de la IA
  proposedContent?: string; // Contenido sugerido por la IA, pendiente de aprobación
  status: 'published' | 'pending_review'; // Estado del contenido
}

const pillarPageSchema: Schema<IPillarPage> = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    topic: { type: String, required: true },
    
    seoTitle: { type: String },
    seoDescription: { type: String },

    // Definimos las relaciones con los otros modelos
    clusterPosts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    clusterProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],

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
    timestamps: true, // Añade createdAt y updatedAt
  }
);

// Prevenir la recompilación del modelo en hot-reloads de Next.js
const PillarPage: Model<IPillarPage> =
  mongoose.models.PillarPage || mongoose.model<IPillarPage>('PillarPage', pillarPageSchema);

export default PillarPage;

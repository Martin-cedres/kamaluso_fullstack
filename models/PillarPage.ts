import mongoose, { Document, Schema, Model } from 'mongoose';

// Interfaz para los datos de la Página Pilar (Data Transfer Object para el frontend)
export interface IPillarPageDTO {
  _id: string;            // El ID siempre será una cadena en el DTO
  title: string;          // Título principal de la página pilar
  slug: string;           // URL amigable
  content: string;        // Contenido extenso de la página pilar
  topic: string;          // El tema central del cluster (ej: "Agendas Personalizadas")
  
  // SEO Fields
  seoTitle?: string;
  seoDescription?: string;

  // Relaciones con el Cluster (referencias como string para el frontend)
  clusterPosts?: string[];    // Array de IDs de Artículos de Blog (como string)
  clusterProducts?: string[]; // Array de IDs de Productos (como string)
  
  // Campos para el flujo de revisión de la IA
  proposedContent?: string; // Contenido sugerido por la IA, pendiente de aprobación
  status: 'published' | 'pending_review'; // Estado del contenido
  createdAt: string;
  updatedAt: string;
}

// Interfaz para la Página Pilar (con métodos de Mongoose)
export interface IPillarPage extends Document {
  title: string;          // Título principal de la página pilar
  slug: string;           // URL amigable
  content: string;        // Contenido extenso de la página pilar
  topic: string;          // El tema central del cluster (ej: "Agendas Personalizadas")
  
  // SEO Fields
  seoTitle?: string;
  seoDescription?: string;

  // Relaciones con el Cluster (referencias como ObjectId para Mongoose)
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

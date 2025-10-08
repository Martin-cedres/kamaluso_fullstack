import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICategory extends Document {
  nombre: string;
  slug: string;
  descripcion: string;
  imagen?: string;
  keywords?: string[];
  parent?: mongoose.Schema.Types.ObjectId;
}

const categorySchema: Schema<ICategory> = new Schema(
  {
    nombre: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    descripcion: { type: String, required: true },
    imagen: { type: String },
    keywords: [{ type: String }],
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  },
  {
    timestamps: true,
  }
);

const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', categorySchema);

export default Category;

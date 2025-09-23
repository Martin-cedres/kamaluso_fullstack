import mongoose, { Document, Schema, Model } from 'mongoose'

export interface IPost extends Document {
  title: string
  slug: string
  content: string
  excerpt?: string
}

const postSchema: Schema<IPost> = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String },
  },
  {
    timestamps: true, // This will add createdAt and updatedAt fields
  },
)

// To prevent model recompilation on hot-reloads
const Post: Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>('Post', postSchema)

export default Post

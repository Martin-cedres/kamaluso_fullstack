import type { NextApiRequest, NextApiResponse } from 'next'
import connectDB from '../../../lib/mongoose'
import Post from '../../../models/Post'
import { requireAuth } from '../../../lib/auth'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  await connectDB()

  try {
    const { title, slug, content, excerpt } = req.body

    if (!title || !slug || !content) {
      return res
        .status(400)
        .json({ error: 'Title, slug, and content are required' })
    }

    const postDoc = {
      title,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 150),
    }

    const newPost = await Post.create(postDoc)

    res
      .status(201)
      .json({ ok: true, message: 'Post created successfully', id: newPost._id })
  } catch (error: any) {
    console.error('CREATE POST ERROR:', error)
    // Handle potential duplicate key error for slug
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Slug already exists.' })
    }
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

// Protecting the endpoint with authentication
export default function (req: NextApiRequest, res: NextApiResponse) {
  requireAuth(req, res, () => handler(req, res))
}

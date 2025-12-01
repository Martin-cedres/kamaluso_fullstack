import type { NextApiRequest, NextApiResponse } from 'next'
import mongoose from 'mongoose'
import connectDB from '../../../lib/mongoose'
import Post from '../../../models/Post'
import { withAuth } from '../../../lib/auth' // Importación corregida

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  await connectDB()

  try {
    const { slug } = req.query

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'Post slug is required' })
    }

    const deletedPost = await Post.findOneAndDelete({ slug })

    if (!deletedPost) {
      return res.status(404).json({ error: 'Post not found' })
    }

    res.status(200).json({ ok: true, message: 'Post deleted successfully' })
  } catch (error) {
    console.error('DELETE POST ERROR:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

// Exportación corregida
export default withAuth(handler)
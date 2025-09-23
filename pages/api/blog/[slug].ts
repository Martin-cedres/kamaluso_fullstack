import type { NextApiRequest, NextApiResponse } from 'next'
import connectDB from '../../../lib/mongoose'
import Post from '../../../models/Post'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectDB()
  const { slug } = req.query

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ message: 'Slug is required' })
  }

  switch (req.method) {
    case 'GET':
      try {
        const post = await Post.findOne({ slug })
        if (!post) {
          return res.status(404).json({ message: 'Post not found' })
        }
        res.status(200).json(post)
      } catch (error) {
        console.error('Error fetching post:', error)
        res.status(500).json({ message: 'Internal Server Error' })
      }
      break

    // In case you want to add PUT and DELETE here in the future,
    // as discussed before. For now, only GET is implemented as per original file.

    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).json({ message: `Method ${req.method} Not Allowed` })
      break
  }
}

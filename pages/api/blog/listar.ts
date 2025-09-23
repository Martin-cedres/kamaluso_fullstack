import type { NextApiRequest, NextApiResponse } from 'next'
import connectDB from '../../../lib/mongoose'
import Post from '../../../models/Post'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    try {
      await connectDB()
      const posts = await Post.find({}).sort({ createdAt: -1 })
      res.status(200).json(posts)
    } catch (error) {
      console.error('Error fetching posts:', error)
      res.status(500).json({ message: 'Internal Server Error' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }
}

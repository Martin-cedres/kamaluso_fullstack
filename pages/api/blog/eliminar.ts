import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import connectDB from '../../../lib/mongoose';
import Post from '../../../models/Post';
import { requireAuth } from '../../../lib/auth';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  await connectDB();

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid Post ID' });
    }

    const deletedPost = await Post.findByIdAndDelete(id);

    if (!deletedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json({ ok: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('DELETE POST ERROR:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default function (req: NextApiRequest, res: NextApiResponse) {
  requireAuth(req, res, () => handler(req, res));
}

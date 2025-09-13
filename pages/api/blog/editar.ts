import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import connectDB from '../../../lib/mongoose';
import Post from '../../../models/Post';
import { requireAuth } from '../../../lib/auth';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  await connectDB();

  try {
    const { id, title, slug, content, excerpt } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid Post ID' });
    }

    const updateDoc: any = {};
    if (title) updateDoc.title = title;
    if (slug) updateDoc.slug = slug;
    if (content) updateDoc.content = content;
    if (excerpt) updateDoc.excerpt = excerpt;

    if (Object.keys(updateDoc).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const updatedPost = await Post.findByIdAndUpdate(id, updateDoc, { new: true });

    if (!updatedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json({ ok: true, message: 'Post updated successfully' });
  } catch (error: any) {
    console.error('EDIT POST ERROR:', error);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Slug already exists.' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default function (req: NextApiRequest, res: NextApiResponse) {
  requireAuth(req, res, () => handler(req, res));
}

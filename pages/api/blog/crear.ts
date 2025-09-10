import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { requireAuth } from '../../../lib/auth';

// Basic handler, no file uploads for now
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { title, slug, content, excerpt } = req.body;

    if (!title || !slug || !content) {
      return res.status(400).json({ error: 'Title, slug, and content are required' });
    }

    const postDoc = {
      title,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 150),
      createdAt: new Date(),
    };

    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection('posts').insertOne(postDoc);

    res.status(201).json({ ok: true, message: 'Post created successfully', id: result.insertedId });
  } catch (error) {
    console.error('CREATE POST ERROR:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Protecting the endpoint with authentication
export default function (req: NextApiRequest, res: NextApiResponse) {
  requireAuth(req, res, () => handler(req, res));
}

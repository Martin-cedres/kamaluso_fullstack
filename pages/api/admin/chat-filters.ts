import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/mongoose';
import { ChatConversation } from '../../../models/ChatConversation';
import Category from '../../../models/Category';
import Product from '../../../models/Product';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    await connectDB();

    // Fetch distinct non-null intents
    const intents = await ChatConversation.distinct('analytics.intent');

    // Fetch distinct non-null categories from conversations
    const categoriesInUse = await ChatConversation.distinct('analytics.category');

    // Fetch all products for filtering
    const products = await Product.find({}, 'nombre slug').sort({ nombre: 1 }).lean();


    res.status(200).json({
      intents: intents.filter(i => i), // remove null/undefined
      categories: categoriesInUse.filter(c => c), // remove null/undefined
      products,
    });
  } catch (error) {
    console.error('Error fetching chat filters:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

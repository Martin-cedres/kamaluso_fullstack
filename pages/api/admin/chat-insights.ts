import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/mongoose';
import { ChatConversation } from '../../../models/ChatConversation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    await connectDB();

    const { intent, category, startDate, endDate, product } = req.query;

    const matchStage: any = {};

    if (intent) {
      matchStage['analytics.intent'] = intent;
    }
    if (category) {
      matchStage['analytics.category'] = category;
    }
    if (product) {
      matchStage['analytics.productContext'] = product;
    }
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) {
        matchStage.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999); // Include the whole day
        matchStage.createdAt.$lte = end;
      }
    }

    const aggregationResult = await ChatConversation.aggregate([
      {
        $match: matchStage,
      },
      {
        $facet: {
          // --- Facet 1: Calculate KPIs ---
          kpis: [
            {
              $match: {
                $or: [
                  { 'analytics.intent': { $ne: null } },
                  { 'analytics.category': { $ne: null } },
                  { 'analytics.productContext': { $ne: null } }
                ]
              }
            },
            {
              $facet: {
                totalConversations: [
                  { $count: 'count' }
                ],
                topIntents: [
                  { $group: { _id: '$analytics.intent', count: { $sum: 1 } } },
                  { $sort: { count: -1 } },
                  { $limit: 5 },
                  { $project: { _id: 0, intent: '$_id', count: 1 } }
                ],
                topProducts: [
                  { $group: { _id: '$analytics.productContext', count: { $sum: 1 } } },
                  { $sort: { count: -1 } },
                  { $limit: 5 },
                  { $project: { _id: 0, product: '$_id', count: 1 } }
                ],
                topCategories: [
                  { $group: { _id: '$analytics.category', count: { $sum: 1 } } },
                  { $sort: { count: -1 } },
                  { $limit: 5 },
                  { $project: { _id: 0, category: '$_id', count: 1 } }
                ]
              }
            }
          ],
          // --- Facet 2: Get Conversation List ---
          conversations: [
            { $sort: { createdAt: -1 } },
            { $limit: 200 },
            {
              $lookup: {
                from: 'products',
                localField: 'analytics.productContext',
                foreignField: 'slug',
                as: 'relatedProductInfo',
              },
            },
            {
              $project: {
                _id: 1,
                fecha: '$createdAt',
                intencion: '$analytics.intent',
                categoria: '$analytics.category',
                mensajeUsuario: { $arrayElemAt: ['$messages.content', 0] }, // Primer mensaje del usuario
                productoRelacionado: {
                  $let: {
                    vars: { product: { $arrayElemAt: ['$relatedProductInfo', 0] } },
                    in: {
                      nombre: '$$product.nombre',
                      slug: '$$product.slug',
                    },
                  },
                },
              },
            },
          ],
        },
      },
      {
        $project: {
          totalConversations: { $arrayElemAt: ['$kpis.totalConversations.count', 0] },
          topIntents: { $arrayElemAt: ['$kpis.topIntents', 0] },
          topProducts: { $arrayElemAt: ['$kpis.topProducts', 0] },
          topCategories: { $arrayElemAt: ['$kpis.topCategories', 0] },
          conversations: '$conversations',
    ]);

    const result = aggregationResult[0] || { kpis: { totalConversations: 0, mostFrequentIntent: 'N/A', mostRequestedProduct: 'N/A' }, conversations: [] };
    
    // Fallback for KPIs if no conversations are found
    if(!result.kpis) {
      result.kpis = { totalConversations: 0, mostFrequentIntent: 'N/A', mostRequestedProduct: 'N/A' };
    }


    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching chat insights:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

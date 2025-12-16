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

              // --- KPIs ---

              totalConversations: [

                { $match: { 'analytics.intent': { $exists: true, $ne: null } } },

                { $count: 'count' }

              ],

              topIntents: [

                { $match: { 'analytics.intent': { $exists: true, $ne: null } } },

                { $group: { _id: '$analytics.intent', count: { $sum: 1 } } },

                { $sort: { count: -1 } },

                { $limit: 5 },

                { $project: { _id: 0, intent: '$_id', count: 1 } }

              ],

              topProducts: [

                { $match: { 'analytics.productContext': { $exists: true, $ne: null } } },

                { $group: { _id: '$analytics.productContext', count: { $sum: 1 } } },

                { $sort: { count: -1 } },

                { $limit: 5 },

                { $project: { _id: 0, product: '$_id', count: 1 } }

              ],

              topCategories: [

                { $match: { 'analytics.category': { $exists: true, $ne: null } } },

                { $group: { _id: '$analytics.category', count: { $sum: 1 } } },

                { $sort: { count: -1 } },

                { $limit: 5 },

                { $project: { _id: 0, category: '$_id', count: 1 } }

              ],

              // --- Conversation List ---

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

                    // Corrección: Asegúrate de que 'messages' existe y tiene elementos antes de acceder.

                    mensajeUsuario: { $ifNull: [{ $arrayElemAt: ['$messages.content', 0] }, ''] }, 

                    productoRelacionado: {

                      $let: {

                        vars: { product: { $arrayElemAt: ['$relatedProductInfo', 0] } },

                        in: {

                          nombre: '$product.nombre',

                          slug: '$product.slug',

                        },

                      },

                    },

                    // Añadido: pasar todos los mensajes para el modal

                    conversation: '$messages' 

                  },

                },

              ],

            },

          },

          {

            // Proyecta el resultado final en un formato limpio

            $project: {

              totalConversations: { $ifNull: [{ $arrayElemAt: ['$totalConversations.count', 0] }, 0] },

              topIntents: '$topIntents',

              topProducts: '$topProducts',

              topCategories: '$topCategories',

              conversations: '$conversations',

            }

          }

        ]);

    

        // El resultado de la agregación es un array con un solo documento (o vacío)

        const result = aggregationResult[0] || { 

          totalConversations: 0,

          topIntents: [],

          topProducts: [],

          topCategories: [],

          conversations: [] 

        };

    

        res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching chat insights:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

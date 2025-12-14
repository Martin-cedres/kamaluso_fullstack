import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { ChatConversation } from '../../../models/ChatConversation'; // Assuming the model is here

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const client = await clientPromise;
        const db = client.db(); // Use the default database specified in the connection string

        // Ensure the collection exists before querying
        const collections = await db.listCollections({ name: 'chatconversations' }).toArray();
        if (collections.length === 0) {
            return res.status(200).json({
                conversionRate: { rate: 0, totalWithIntent: 0, totalConverted: 0 },
                intentsWithoutProduct: { count: 0 },
                abandonmentByIntent: [],
            });
        }
        
        const chatConversations = db.collection('chatconversations');

        // KPI 1: General Conversion Rate
        const totalWithIntent = await chatConversations.countDocuments({
            "analytics.intent": { $exists: true, $ne: 'indefinido' }
        });
        const totalConverted = await chatConversations.countDocuments({
            "analytics.converted": true
        });
        const conversionRate = totalWithIntent > 0 ? (totalConverted / totalWithIntent) * 100 : 0;

        // KPI 2: Intents without a found product
        const intentsWithoutProduct = await chatConversations.countDocuments({
            "analytics.intent": { $in: ['compra', 'duda_producto'] },
            "analytics.productContext": { $exists: false }
        });

        // KPI 3: Abandonment Rate by Intent
        const abandonmentByIntent = await chatConversations.aggregate([
            {
                $match: {
                    "analytics.intent": { $exists: true, $ne: 'indefinido' }
                }
            },
            {
                $group: {
                    _id: "$analytics.intent",
                    totalConversations: { $sum: 1 },
                    totalConversions: {
                        $sum: { $cond: [{ $eq: ["$analytics.converted", true] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    intent: "$_id",
                    totalConversations: 1,
                    totalConversions: 1,
                    abandonmentRate: {
                        $cond: [
                            { $eq: ["$totalConversations", 0] },
                            0,
                            {
                                $multiply: [
                                    { $divide: [{ $subtract: ["$totalConversations", "$totalConversions"] }, "$totalConversations"] },
                                    100
                                ]
                            }
                        ]
                    }
                }
            },
            {
                $sort: {
                    abandonmentRate: -1
                }
            }
        ]).toArray();

        res.status(200).json({
            conversionRate: {
                rate: parseFloat(conversionRate.toFixed(2)),
                totalWithIntent,
                totalConverted,
            },
            intentsWithoutProduct: {
                count: intentsWithoutProduct,
            },
            abandonmentByIntent,
        });

    } catch (error) {
        console.error('Error fetching KPI data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

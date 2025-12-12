import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/mongoose';
import { ChatConversation } from '../../../../models/ChatConversation';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);
        if (!session) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        await connectDB();

        const conversations = await ChatConversation.find({})
            .sort({ lastMessageAt: -1 })
            .limit(50); // Limit to last 50 for now

        return res.status(200).json(conversations);

    } catch (error: any) {
        console.error('Error fetching chat history:', error);
        return res.status(500).json({ message: 'Error fetching history', error: error.message });
    }
}

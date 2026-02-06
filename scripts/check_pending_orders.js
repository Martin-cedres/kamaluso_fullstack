
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkRecentOrders() {
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI is missing in .env.local');
        return;
    }

    const client = new MongoClient(process.env.MONGODB_URI);

    try {
        await client.connect();
        const db = client.db();

        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const orders = await db.collection('orders')
            .find({
                createdAt: { $gte: threeDaysAgo }
            })
            .sort({ createdAt: -1 })
            .toArray();

        console.log(`Found ${orders.length} orders from the last 3 days:`);
        orders.forEach(order => {
            console.log('------------------------------------------------');
            console.log(`ID: ${order._id}`);
            console.log(`Date: ${order.createdAt}`);
            console.log(`Status: ${order.status}`);
            console.log(`Name: ${order.name}`);
            console.log(`Email: ${order.email}`);
            console.log(`Total: ${order.total}`);
            console.log(`Payment Method: ${order.paymentMethod}`);
            if (order.externalReference) {
                console.log(`External Reference: ${order.externalReference}`);
            }
        });

    } catch (error) {
        console.error('Error fetching orders:', error);
    } finally {
        await client.close();
    }
}

checkRecentOrders();

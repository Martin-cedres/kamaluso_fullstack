
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function listLastOrders() {
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI is missing');
        return;
    }

    const client = new MongoClient(process.env.MONGODB_URI);

    try {
        await client.connect();
        const db = client.db();

        const orders = await db.collection('orders')
            .find({})
            .sort({ _id: -1 })
            .limit(10)
            .toArray();

        console.log(`Found ${orders.length} orders (showing last 10):`);
        orders.forEach(order => {
            console.log('------------------------------------------------');
            console.log(`ID: ${order._id}`);
            console.log(`Date: ${order.createdAt}`);
            console.log(`Status: ${order.status}`);
            console.log(`Name: ${order.name}`);
            console.log(`Total: ${order.total}`);
            console.log(`Payment: ${order.paymentMethod}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

listLastOrders();

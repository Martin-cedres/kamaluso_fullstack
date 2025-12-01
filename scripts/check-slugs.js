require('dotenv').config({ path: './.env.local' });
const mongoose = require('mongoose');

async function checkSlugs() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection;

        // Get sample posts
        const posts = await db.collection('posts').find({}).limit(10).project({ title: 1, slug: 1 }).toArray();

        // Get sample pillar pages
        const pillars = await db.collection('pillarpages').find({}).limit(10).project({ title: 1, slug: 1, topic: 1 }).toArray();

        // Get sample event pages
        const events = await db.collection('eventpages').find({}).limit(10).project({ title: 1, slug: 1, eventType: 1 }).toArray();

        console.log('\n=== POSTS (Blog) ===');
        console.log('Total:', await db.collection('posts').countDocuments());
        if (posts.length > 0) {
            posts.forEach(p => console.log(`  "${p.title}" -> ${p.slug}`));
        } else {
            console.log('  No hay posts aún');
        }

        console.log('\n=== PILLAR PAGES ===');
        console.log('Total:', await db.collection('pillarpages').countDocuments());
        if (pillars.length > 0) {
            pillars.forEach(p => console.log(`  "${p.title}" (${p.topic}) -> ${p.slug}`));
        } else {
            console.log('  No hay pillar pages aún');
        }

        console.log('\n=== EVENT PAGES ===');
        console.log('Total:', await db.collection('eventpages').countDocuments());
        if (events.length > 0) {
            events.forEach(e => console.log(`  "${e.title}" (${e.eventType}) -> ${e.slug}`));
        } else {
            console.log('  No hay event pages aún');
        }

        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkSlugs();

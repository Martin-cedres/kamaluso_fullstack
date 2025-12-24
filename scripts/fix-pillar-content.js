const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function fixPillars() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const pillars = await db.collection('pillarpages').find({}).toArray();
    for (const p of pillars) {
        const updatedContent = p.content.replace(/pgina/g, 'pagina');
        if (updatedContent !== p.content) {
            console.log(`Updating Pillar Content: ${p.title}`);
            await db.collection('pillarpages').updateOne(
                { _id: p._id },
                { $set: { content: updatedContent } }
            );
        }
    }

    console.log('Pillar content update complete.');
    await mongoose.disconnect();
}

fixPillars().catch(console.error);

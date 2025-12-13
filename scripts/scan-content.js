
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Define minimal schemas
const PostSchema = new mongoose.Schema({
    title: String,
    slug: String,
    content: String,
    excerpt: String,
}, { strict: false });

const PillarPageSchema = new mongoose.Schema({
    title: String,
    slug: String,
    mainContent: String,
    introduction: String,
}, { strict: false });

const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);
const PillarPage = mongoose.models.PillarPage || mongoose.model('PillarPage', PillarPageSchema);

async function scanContent() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);

        const output = {
            posts: [],
            pillars: []
        };

        const regex = /flex/i;

        // Scan Posts
        const posts = await Post.find({
            $or: [
                { content: regex },
                { title: regex },
                { excerpt: regex }
            ]
        });

        console.log(`Found ${posts.length} posts with 'flex'.`);
        output.posts = posts.map(p => ({
            id: p._id,
            type: 'Post',
            title: p.title,
            slug: p.slug,
            excerpt: p.excerpt,
            // Only taking a snippet for display, real replacement needs full content
            snippet: p.content ? p.content.substring(0, 200) + '...' : ''
        }));

        // Scan Pillars
        const pillars = await PillarPage.find({
            $or: [
                { mainContent: regex },
                { title: regex },
                { introduction: regex }
            ]
        });

        console.log(`Found ${pillars.length} pillar pages with 'flex'.`);
        output.pillars = pillars.map(p => ({
            id: p._id,
            type: 'PillarPage',
            title: p.title,
            slug: p.slug,
            snippet: p.mainContent ? p.mainContent.substring(0, 200) + '...' : ''
        }));

        fs.writeFileSync(path.join(__dirname, '../content-scan.json'), JSON.stringify(output, null, 2));
        console.log('Scan complete. Results saved to content-scan.json');

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

scanContent();

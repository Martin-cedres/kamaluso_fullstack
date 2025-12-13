
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function fetchPosts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const Post = mongoose.models.Post || mongoose.model('Post', new mongoose.Schema({ title: String, slug: String, content: String }, { strict: false }));

        const slugs = [
            'tapa-dura-vs-tapa-flexible-como-elegir-la-agenda-ideal-segun-tu-estilo-de-vida-y-rutina',
            'tapa-dura-vs-tapa-flexible-la-guia-definitiva-para-elegir-tu-proxima-agenda'
        ];

        const posts = await Post.find({ slug: { $in: slugs } });
        console.log(JSON.stringify(posts, null, 2));

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

fetchPosts();

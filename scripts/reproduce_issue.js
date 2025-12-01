require('dotenv').config({ path: './.env.local' });
const mongoose = require('mongoose');
// const EventPage = require('./models/EventPage').default; // Removed to avoid TS import error

async function reproduce() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get a valid product ID
        const product = await mongoose.connection.collection('products').findOne({});
        if (!product) {
            console.log('No products found');
            return;
        }
        console.log('Using product ID:', product._id);

        const testData = {
            title: "Test Event Page " + Date.now(),
            slug: "test-event-page-" + Date.now(),
            eventType: "Día de la Madre",
            eventDate: { month: 5, day: 10 },
            content: "<p>Test content</p>",
            seoTitle: "Test SEO Title",
            seoDescription: "Test SEO Description",
            seoKeywords: "test, keywords",
            selectedProducts: [product._id.toString()], // Simulate string ID from frontend
            status: "draft",
            autoRefresh: true
        };

        console.log('Attempting to create EventPage with data:', JSON.stringify(testData, null, 2));

        // We need to define the schema/model here if we can't import it easily due to TS/JS mix
        // But let's try to import first. If it fails, I'll define it inline.

        // Note: The model file is in TS. running this with node might fail if I don't use ts-node or compile it.
        // So I will define the schema inline to match the one in the file.

        const Schema = mongoose.Schema;
        const EventPageSchema = new Schema(
            {
                title: { type: String, required: true, trim: true },
                slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
                eventType: {
                    type: String,
                    required: true,
                    enum: ['Día de la Madre', 'Día del Padre', 'Día del Niño', 'Día del Maestro', 'Navidad', 'Reyes', 'San Valentín', 'Vuelta a Clases', 'Black Friday', 'Cyber Monday', 'Otro']
                },
                eventDate: {
                    month: { type: Number, required: true, min: 1, max: 12 },
                    day: { type: Number, required: true, min: 1, max: 31 },
                },
                content: { type: String, required: false, default: '' },
                seoTitle: { type: String, trim: true },
                seoDescription: { type: String, trim: true },
                seoKeywords: { type: String, trim: true },
                heroImage: { type: String, trim: true },
                selectedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
                autoRefresh: { type: Boolean, default: true },
                status: { type: String, enum: ['published', 'draft'], default: 'draft' },
            },
            { timestamps: true }
        );

        // Use a different model name to avoid conflicts if it's already registered
        const TestEventPage = mongoose.models.TestEventPage || mongoose.model('TestEventPage', EventPageSchema);

        const newPage = await TestEventPage.create(testData);
        console.log('Successfully created EventPage:', newPage._id);

        // Clean up
        await TestEventPage.deleteOne({ _id: newPage._id });
        console.log('Cleaned up test data');

    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        await mongoose.disconnect();
    }
}

reproduce();

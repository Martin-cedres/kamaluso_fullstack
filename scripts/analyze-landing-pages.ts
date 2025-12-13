import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import connectDB from '../lib/mongoose';
import PillarPage from '../models/PillarPage';
import EventPage from '../models/EventPage';

async function analyzeLandingPages() {
    try {
        await connectDB();

        console.log('\n📄 PILLAR PAGES EXISTENTES:\n');
        const pillarPages = await PillarPage.find({}).select('title slug topic status');

        if (pillarPages.length === 0) {
            console.log('   ❌ No hay pillar pages creadas aún');
        } else {
            pillarPages.forEach((page, i) => {
                console.log(`${i + 1}. ${page.title}`);
                console.log(`   URL: /pillar/${page.slug}`);
                console.log(`   Topic: ${page.topic}`);
                console.log(`   Status: ${page.status}`);
                console.log('');
            });
        }

        console.log('\n🎉 EVENT PAGES EXISTENTES:\n');
        const eventPages = await EventPage.find({}).select('title slug eventType');

        if (eventPages.length === 0) {
            console.log('   ❌ No hay event pages creadas aún');
        } else {
            eventPages.forEach((page, i) => {
                console.log(`${i + 1}. ${page.title}`);
                console.log(`   URL: /eventos/${page.slug}`);
                console.log(`   Tipo: ${page.eventType}`);
                console.log('');
            });
        }

        console.log('\n✨ ANÁLISIS Y RECOMENDACIONES:\n');
        console.log(`Total Pillar Pages: ${pillarPages.length}`);
        console.log(`Total Event Pages: ${eventPages.length}`);
        console.log(`Total Landing Pages: ${pillarPages.length + eventPages.length}`);

    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

analyzeLandingPages()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

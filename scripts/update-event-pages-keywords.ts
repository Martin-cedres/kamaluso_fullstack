import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import connectDB from '../lib/mongoose';
import EventPage from '../models/EventPage';

async function updateEventPages() {
    try {
        await connectDB();

        console.log('\n🎉 ACTUALIZANDO EVENT PAGES POR SLUG EXACTO\n');

        const exactUpdates = [
            {
                slug: 'regalos-corporativos-personalizados-de-fin-de-ano-en-uruguay',
                keywords: [
                    'regalos corporativos fin de año',
                    'regalos empresariales diciembre',
                    'regalos corporativos navidad uruguay',
                    'agendas 2026 regalo empresas',
                    'regalos fin año clientes uruguay',
                    'merchandising fin de año',
                    'regalos corporativos originales diciembre',
                    'qué regalar empleados fin de año',
                    'ideas regalos corporativos navidad',
                    'comprar regalos empresariales diciembre uruguay',
                    'regalos corporativos diciembre 2025',
                    'regalos empresariales navidad 2025',
                ]
            },
            {
                slug: 'regalos-de-reyes-personalizados-para-ninos-y-adultos',
                keywords: [
                    'regalos de reyes',
                    'regalos personalizados reyes',
                    'regalos reyes niños personalizados uruguay',
                    'libretas personalizadas reyes',
                    'cuadernos personalizados nombre niños',
                    'regalos reyes adultos originales',
                    'agendas personalizadas regalo reyes',
                    'ideas regalos reyes originales uruguay',
                    'qué regalar reyes adultos',
                    'regalos reyes personalizados montevideo',
                ]
            },
            {
                slug: 'regalos-de-navidad-personalizados-ideas-unicas-y-originales-en-uruguay',
                keywords: [
                    'regalos navidad personalizados',
                    'regalos navidad uruguay',
                    'agendas 2026 regalo navidad',
                    'libretas personalizadas navidad',
                    'regalos navidad originales uruguay',
                    'ideas regalos navidad personalizados',
                    'regalos navidad para familia',
                    'regalos navidad amigos originales',
                    'regalos navidad profesionales',
                    'comprar regalos navidad personalizados uruguay',
                    'donde comprar regalos navidad montevideo',
                    'regalos navidad online uruguay',
                    'regalos navidad 2025 uruguay',
                ]
            }
        ];

        let updated = 0;

        for (const { slug, keywords } of exactUpdates) {
            const eventPage = await EventPage.findOne({ slug });

            if (eventPage) {
                console.log(`✅ Encontrada: ${eventPage.title}`);
                console.log(`   Agregando ${keywords.length} keywords`);

                if (!eventPage.seoKeywords || eventPage.seoKeywords.trim() === '') {
                    eventPage.seoKeywords = keywords.join(', ');
                } else {
                    const existing = eventPage.seoKeywords.split(',').map(k => k.trim()).filter(k => k);
                    const combined = [...new Set([...existing, ...keywords])];
                    eventPage.seoKeywords = combined.join(', ');
                }

                await eventPage.save();
                updated++;
                console.log(`   💾 Guardado\n`);
            } else {
                console.log(`   ❌ No encontrada: ${slug}\n`);
            }
        }

        console.log(`\n✨ RESUMEN:`);
        console.log(`   Event Pages actualizadas: ${updated}/3`);
        console.log(`\n🎯 ESTADO FINAL COMPLETO:`);
        console.log(`   ✅ 4/4 Pillar Pages optimizadas`);
        console.log(`   ✅ ${updated}/3 Event Pages optimizadas`);
        console.log(`   📊 Total: ${4 + updated}/7 landing pages`);

    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

updateEventPages()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

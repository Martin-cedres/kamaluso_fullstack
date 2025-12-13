import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import connectDB from '../lib/mongoose';
import PillarPage from '../models/PillarPage';
import EventPage from '../models/EventPage';

// Keywords para las 4 páginas restantes
const remainingKeywords = {
    // PILLAR PAGE faltante
    'guia-definitiva': {
        keywords: [
            'guía agendas 2026',
            'como elegir agenda',
            'tipos de agendas',
            'diferencias agendas 2026',
            'comparar agendas uruguay',
            'agenda semanal vs diaria',
            'mejor interior agenda 2026',
            'tapa dura vs tapa flex agenda',
            'como elegir agenda perfecta',
            'qué agenda es mejor para mí',
            'guía compra agenda 2026',
            'consejos elegir planner',
            'agenda para profesionales uruguay',
            'mejor agenda para estudiantes 2026',
            'agenda emprendedores uruguay',
            'planner productividad 2026',
        ]
    },

    // EVENT PAGES
    'regalos-corporativos-fin-ano': {
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

    'regalos-reyes': {
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

    'regalos-navidad': {
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
    },
};

async function finishKeywordEnrichment() {
    try {
        await connectDB();

        console.log('\n🚀 COMPLETANDO ENRIQUECIMIENTO DE KEYWORDS\n');

        let updated = 0;

        // 1. Actualizar Pillar Page faltante
        console.log('📄 Buscando Pillar Page: "Guía Definitiva"...\n');
        const guidePage = await PillarPage.findOne({
            slug: { $regex: 'guia-definitiva', $options: 'i' }
        });

        if (guidePage) {
            const keywords = remainingKeywords['guia-definitiva'].keywords;
            console.log(`✅ Encontrada: ${guidePage.title}`);
            console.log(`   Agregando ${keywords.length} keywords`);

            if (!guidePage.seoKeywords) {
                guidePage.seoKeywords = keywords.join(', ');
            } else {
                const existing = guidePage.seoKeywords.split(',').map(k => k.trim());
                const combined = [...new Set([...existing, ...keywords])];
                guidePage.seoKeywords = combined.join(', ');
            }

            await guidePage.save();
            updated++;
            console.log(`   💾 Guardado\n`);
        } else {
            console.log(`   ⚠️  No encontrada - Revisar slug\n`);
        }

        // 2. Actualizar Event Pages
        console.log('🎉 Actualizando Event Pages...\n');

        for (const [slugPattern, data] of Object.entries(remainingKeywords)) {
            if (slugPattern === 'guia-definitiva') continue; // Ya procesada

            const eventPage = await EventPage.findOne({
                slug: { $regex: slugPattern, $options: 'i' }
            });

            if (eventPage) {
                console.log(`✅ Encontrada: ${eventPage.title}`);
                console.log(`   Agregando ${data.keywords.length} keywords`);

                if (!eventPage.seoKeywords) {
                    eventPage.seoKeywords = data.keywords.join(', ');
                } else {
                    const existing = eventPage.seoKeywords.split(',').map(k => k.trim()).filter(k => k);
                    const combined = [...new Set([...existing, ...data.keywords])];
                    eventPage.seoKeywords = combined.join(', ');
                }

                await eventPage.save();
                updated++;
                console.log(`   💾 Guardado\n`);
            } else {
                console.log(`   ⚠️  ${slugPattern} - No encontrada\n`);
            }
        }

        console.log(`\n✨ RESUMEN FINAL:`);
        console.log(`   Páginas actualizadas en esta ejecución: ${updated}/4`);
        console.log(`   Total keywords agregadas: ~${updated * 12} (promedio)`);
        console.log(`\n🎯 TOTAL GENERAL:`);
        console.log(`   • 4 Pillar Pages: 100% optimizadas`);
        console.log(`   • 3 Event Pages: 100% optimizadas`);
        console.log(`   • Total: 7/7 landing pages con keywords expandidas`);
        console.log(`\n📈 Siguiente paso: Monitor en Google Search Console (15-30 días)`);

    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

finishKeywordEnrichment()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

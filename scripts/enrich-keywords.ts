import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import connectDB from '../lib/mongoose';
import PillarPage from '../models/PillarPage';
import EventPage from '../models/EventPage';

// KEYWORDS ESTRATÉGICAS POR PÁGINA
const keywordsByPage = {
    // PILLAR PAGES
    'regalos-empresariales-2026': [
        // Core (mantener existentes)
        'regalos empresariales 2026',
        'agendas personalizadas empresas',
        'regalos corporativos uruguay',

        // Long-tail específicas
        'regalos empresariales fin de año uruguay',
        'agendas corporativas personalizadas con logo',
        'libretas empresariales personalizadas montevideo',
        'merchandising corporativo uruguay',
        'regalos para clientes empresas uruguay',
        'agendas 2026 para empresas',
        'regalos corporativos originales uruguay',
        'papelería corporativa personalizada',

        // Intención de compra
        'comprar regalos empresariales uruguay',
        'precio agendas corporativas personalizadas',
        'cotizar regalos empresariales',
        'donde comprar regalos corporativos montevideo',

        // Preguntas (AI-friendly)
        'qué regalar a clientes fin de año',
        'mejores regalos empresariales uruguay',
        'ideas regalos corporativos originales',
        'cuánto cuesta agenda personalizada para empresa',
    ],

    'agenda-docente': [
        // Core
        'agenda docente uruguay',
        'agenda para maestros',
        'planner docente perpetuo',

        // Long-tail
        'agenda docente primaria uruguay',
        'agenda escolar para maestros 2026',
        'planner docente personalizado',
        'agenda para profesores uruguay',
        'organizador para docentes',
        'agenda perpetua maestros primaria',

        // Intención
        'comprar agenda docente uruguay',
        'mejor agenda para maestros',
        'donde comprar planner docente montevideo',
        'precio agenda docente personalizada',

        // Temporal
        'agenda docente 2026',
        'agenda escolar 2026 uruguay',

        // Preguntas
        'qué agenda usar como docente',
        'mejor organizador para maestros',
        'agenda perpetua o anual docente',
    ],

    'agendas-2026-uruguay': [
        // Core
        'agendas 2026',
        'agendas uruguay',
        'planners 2026',

        // Long-tail específicas
        'agendas 2026 personalizadas uruguay',
        'comprar agenda 2026 montevideo',
        'mejor agenda semanal 2026',
        'agenda horizontal semana vista uruguay',
        'agendas tapa dura 2026',
        'planners personalizados con logo',
        'agenda profesional 2026 uruguay',
        'agenda ejecutiva personalizada',

        // Tipos de interior
        'agenda semanal horizontal 2026',
        'agenda diaria 2026 uruguay',
        'agenda dos días por página',
        'planner semana vista',

        // Intención
        'donde comprar agendas 2026 uruguay',
        'precio agenda personalizada 2026',
        'agendas 2026 online uruguay',
        'mejores agendas 2026',

        // Preguntas
        'cuál es la mejor agenda 2026',
        'qué agenda comprar para 2026',
        'agenda tapa dura o flex',
    ],

    'guia-agendas-2026': [
        // Core
        'guía agendas 2026',
        'como elegir agenda',
        'tipos de agendas',

        // Long-tail
        'diferencias agendas 2026',
        'comparar agendas uruguay',
        'agenda semanal vs diaria',
        'mejor interior agenda 2026',
        'tapa dura vs tapa flex agenda',

        // Intención informacional
        'como elegir agenda perfecta',
        'qué agenda es mejor para mí',
        'guía compra agenda 2026',
        'consejos elegir planner',

        // Específicas
        'agenda para profesionales uruguay',
        'mejor agenda para estudiantes 2026',
        'agenda emprendedores uruguay',
        'planner productividad 2026',
    ],

    // EVENT PAGES
    'regalos-corporativos-fin-ano': [
        // Core
        'regalos corporativos fin de año',
        'regalos empresariales diciembre',

        // Long-tail
        'regalos corporativos navidad uruguay',
        'agendas 2026 regalo empresas',
        'regalos fin año clientes uruguay',
        'merchandising fin de año',
        'regalos corporativos originales diciembre',

        // Intención
        'qué regalar empleados fin de año',
        'ideas regalos corporativos navidad',
        'comprar regalos empresariales diciembre uruguay',

        // Temporal
        'regalos corporativos diciembre 2025',
        'regalos empresariales navidad 2025',
    ],

    'regalos-reyes': [
        // Core
        'regalos de reyes',
        'regalos personalizados reyes',

        // Long-tail niños
        'regalos reyes niños personalizados uruguay',
        'libretas personalizadas reyes',
        'cuadernos personalizados nombre niños',

        // Long-tail adultos
        'regalos reyes adultos originales',
        'agendas personalizadas regalo reyes',

        // Intención
        'ideas regalos reyes originales uruguay',
        'qué regalar reyes adultos',
        'regalos reyes personalizados montevideo',
    ],

    'regalos-navidad': [
        // Core
        'regalos navidad personalizados',
        'regalos navidad uruguay',

        // Long-tail
        'agendas 2026 regalo navidad',
        'libretas personalizadas navidad',
        'regalos navidad originales uruguay',
        'ideas regalos navidad personalizados',

        // Familiar/Personal
        'regalos navidad para familia',
        'regalos navidad amigos originales',
        'regalos navidad profesionales',

        // Intención
        'comprar regalos navidad personalizados uruguay',
        'donde comprar regalos navidad montevideo',
        'regalos navidad online uruguay',

        // Temporal
        'regalos navidad 2025 uruguay',
    ],
};

async function enrichKeywords() {
    try {
        await connectDB();

        console.log('\n🚀 INICIANDO ENRIQUECIMIENTO DE KEYWORDS\n');

        let updated = 0;

        // Actualizar Pillar Pages
        for (const [slugPattern, keywords] of Object.entries(keywordsByPage)) {
            // Buscar por slug parcial
            const pillarPage = await PillarPage.findOne({
                slug: { $regex: slugPattern, $options: 'i' }
            });

            if (pillarPage) {
                console.log(`✅ Actualizando Pillar: ${pillarPage.title}`);
                console.log(`   Agregando ${keywords.length} keywords`);

                // Agregar seoKeywords si no existe
                if (!pillarPage.seoKeywords) {
                    pillarPage.seoKeywords = keywords.join(', ');
                } else {
                    // Combinar existentes con nuevas
                    const existing = pillarPage.seoKeywords.split(',').map(k => k.trim());
                    const combined = [...new Set([...existing, ...keywords])];
                    pillarPage.seoKeywords = combined.join(', ');
                }

                await pillarPage.save();
                updated++;
                console.log(`   💾 Guardado\n`);
            }

            // Buscar en Event Pages también
            const eventPage = await EventPage.findOne({
                slug: { $regex: slugPattern, $options: 'i' }
            });

            if (eventPage) {
                console.log(`✅ Actualizando Event Page: ${eventPage.title}`);
                console.log(`   Agregando ${keywords.length} keywords`);

                if (!eventPage.seoKeywords) {
                    eventPage.seoKeywords = keywords.join(', ');
                } else {
                    const existing = eventPage.seoKeywords.split(',').map(k => k.trim());
                    const combined = [...new Set([...existing, ...keywords])];
                    eventPage.seoKeywords = combined.join(', ');
                }

                await eventPage.save();
                updated++;
                console.log(`   💾 Guardado\n`);
            }
        }

        console.log(`\n✨ RESUMEN:`);
        console.log(`   Páginas actualizadas: ${updated}`);
        console.log(`   Keywords agregadas por página: ${Object.values(keywordsByPage)[0].length} (promedio)`);
        console.log(`\n🎯 Siguiente paso: Verificar en Google Search Console en 2-3 semanas`);

    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

enrichKeywords()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

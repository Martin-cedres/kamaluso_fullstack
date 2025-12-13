const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

// Modelos a probar en orden de preferencia
const MODELS_TO_TEST = [
    'gemini-2.0-flash-exp',
    'gemini-exp-1206',
    'gemini-2.0-flash-thinking-exp-1219',
    'gemini-2.5-pro',
    'gemini-2.5-pro-exp',
    'gemini-2.5-flash',
    'gemini-1.5-pro',
    'gemini-1.5-flash'
];

async function testModel(apiKey, modelName) {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent('Di hola en una palabra');
        const response = await result.response;
        const text = response.text();

        return { success: true, text };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            statusCode: error.status || error.statusCode
        };
    }
}

async function main() {
    const proKeys = (process.env.GEMINI_PRO_API_KEYS || '').split(',').filter(k => k.trim());
    const flashKeys = (process.env.GEMINI_FLASH_API_KEYS || '').split(',').filter(k => k.trim());

    console.log('🔍 DIAGNÓSTICO DE ACCESO A MODELOS GEMINI\n');
    console.log(`📌 Claves PRO configuradas: ${proKeys.length}`);
    console.log(`📌 Claves FLASH configuradas: ${flashKeys.length}\n`);

    if (proKeys.length === 0 && flashKeys.length === 0) {
        console.error('❌ No hay claves configuradas en .env.local');
        console.log('\n💡 Agrega tus claves así:');
        console.log('GEMINI_PRO_API_KEYS=tu_clave_1,tu_clave_2');
        console.log('GEMINI_FLASH_API_KEYS=tu_clave_3,tu_clave_4');
        return;
    }

    // Probar claves PRO
    if (proKeys.length > 0) {
        console.log('═══════════════════════════════════════');
        console.log('🔑 PROBANDO CLAVES PRO');
        console.log('═══════════════════════════════════════\n');

        for (let i = 0; i < proKeys.length; i++) {
            const key = proKeys[i].trim();
            const maskedKey = key.substring(0, 10) + '...' + key.substring(key.length - 4);
            console.log(`\n🔐 Clave PRO[${i}]: ${maskedKey}\n`);

            for (const modelName of MODELS_TO_TEST) {
                process.stdout.write(`   Probando ${modelName}... `);
                const result = await testModel(key, modelName);

                if (result.success) {
                    console.log(`✅ FUNCIONA (respuesta: "${result.text}")`);
                } else {
                    if (result.error.includes('API key not valid') || result.error.includes('API_KEY_INVALID')) {
                        console.log(`❌ CLAVE INVÁLIDA`);
                        break; // Si la clave es inválida, no seguir probando modelos
                    } else if (result.error.includes('models/') || result.error.includes('not found') || result.statusCode === 404) {
                        console.log(`⚠️ Modelo no disponible`);
                    } else if (result.error.includes('quota') || result.error.includes('limit')) {
                        console.log(`⚠️ Límite de cuota alcanzado`);
                    } else {
                        console.log(`❌ Error: ${result.error}`);
                    }
                }
            }
        }
    }

    // Probar claves FLASH
    if (flashKeys.length > 0) {
        console.log('\n\n═══════════════════════════════════════');
        console.log('🔑 PROBANDO CLAVES FLASH');
        console.log('═══════════════════════════════════════\n');

        for (let i = 0; i < flashKeys.length; i++) {
            const key = flashKeys[i].trim();
            const maskedKey = key.substring(0, 10) + '...' + key.substring(key.length - 4);
            console.log(`\n🔐 Clave FLASH[${i}]: ${maskedKey}\n`);

            for (const modelName of MODELS_TO_TEST) {
                process.stdout.write(`   Probando ${modelName}... `);
                const result = await testModel(key, modelName);

                if (result.success) {
                    console.log(`✅ FUNCIONA (respuesta: "${result.text}")`);
                } else {
                    if (result.error.includes('API key not valid') || result.error.includes('API_KEY_INVALID')) {
                        console.log(`❌ CLAVE INVÁLIDA`);
                        break;
                    } else if (result.error.includes('models/') || result.error.includes('not found') || result.statusCode === 404) {
                        console.log(`⚠️ Modelo no disponible`);
                    } else if (result.error.includes('quota') || result.error.includes('limit')) {
                        console.log(`⚠️ Límite de cuota alcanzado`);
                    } else {
                        console.log(`❌ Error: ${result.error}`);
                    }
                }
            }
        }
    }

    console.log('\n\n═══════════════════════════════════════');
    console.log('📋 RECOMENDACIONES');
    console.log('═══════════════════════════════════════\n');
    console.log('1. Si ves "Modelo no disponible" para gemini-2.5-pro:');
    console.log('   → Usa gemini-2.0-flash-exp o gemini-exp-1206 (más nuevos y disponibles)');
    console.log('   → O actualiza a una cuenta de pago de Google AI Studio\n');
    console.log('2. Si ves "Límite de cuota alcanzado":');
    console.log('   → Espera o agrega más claves API\n');
    console.log('3. Actualiza lib/gemini-client.ts línea 10 con los modelos que funcionaron.');
}

main().catch(console.error);

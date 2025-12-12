import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const proApiKeys: string[] = (process.env.GEMINI_PRO_API_KEYS || "").split(",").filter(k => k.trim());
const MODEL_NAME = "gemini-2.5-pro"; // Nombre exacto usado en el cliente

async function testKeys() {
    console.log("🔍 Iniciando prueba de claves Gemini Pro...");
    console.log(`🔑 Claves encontradas: ${proApiKeys.length}`);
    console.log(`🤖 Modelo a probar: ${MODEL_NAME}`);

    if (proApiKeys.length === 0) {
        console.error("❌ No se encontraron claves en GEMINI_PRO_API_KEYS.");
        return;
    }

    for (let i = 0; i < proApiKeys.length; i++) {
        const key = proApiKeys[i];
        const maskedKey = key.substring(0, 5) + "..." + key.substring(key.length - 5);
        console.log(`\n------------------------------------------------`);
        console.log(`Testing Key [${i + 1}/${proApiKeys.length}]: ${maskedKey}`);

        try {
            const genAI = new GoogleGenerativeAI(key);
            const model = genAI.getGenerativeModel({ model: MODEL_NAME });

            console.log("  ⏳ Enviando prompt de prueba...");
            const result = await model.generateContent("Hola, esto es una prueba de conexión.");
            const response = result.response;
            const text = response.text();

            console.log(`  ✅ ÉXITO! Respuesta recibida: "${text.substring(0, 50)}..."`);
        } catch (error: any) {
            console.error(`  ❌ ERROR:`, error.message);

            if (error.message.includes("404")) {
                console.error("     -> El modelo no fue encontrado. Puede que 'gemini-2.5-pro' no esté disponible para esta clave o región.");
            } else if (error.message.includes("403")) {
                console.error("     -> Permiso denegado. La clave puede ser inválida o no tener acceso a este modelo.");
            } else if (error.message.includes("429")) {
                console.error("     -> Quota exceeded. Se ha superado el límite de uso.");
            }
        }
    }
    console.log("\n------------------------------------------------");
    console.log("🏁 Prueba finalizada.");
}

testKeys();

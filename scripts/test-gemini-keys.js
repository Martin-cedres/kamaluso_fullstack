"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const generative_ai_1 = require("@google/generative-ai");
const dotenv = __importStar(require("dotenv"));
// Cargar variables de entorno
dotenv.config({ path: '.env.local' });
const proApiKeys = (process.env.GEMINI_PRO_API_KEYS || "").split(",").filter(k => k.trim());
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
            const genAI = new generative_ai_1.GoogleGenerativeAI(key);
            const model = genAI.getGenerativeModel({ model: MODEL_NAME });
            console.log("  ⏳ Enviando prompt de prueba...");
            const result = await model.generateContent("Hola, esto es una prueba de conexión.");
            const response = result.response;
            const text = response.text();
            console.log(`  ✅ ÉXITO! Respuesta recibida: "${text.substring(0, 50)}..."`);
        }
        catch (error) {
            console.error(`  ❌ ERROR:`, error.message);
            if (error.message.includes("404")) {
                console.error("     -> El modelo no fue encontrado. Puede que 'gemini-2.5-pro' no esté disponible para esta clave o región.");
            }
            else if (error.message.includes("403")) {
                console.error("     -> Permiso denegado. La clave puede ser inválida o no tener acceso a este modelo.");
            }
            else if (error.message.includes("429")) {
                console.error("     -> Quota exceeded. Se ha superado el límite de uso.");
            }
        }
    }
    console.log("\n------------------------------------------------");
    console.log("🏁 Prueba finalizada.");
}
testKeys();

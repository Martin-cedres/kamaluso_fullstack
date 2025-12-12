"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateContentSmart = generateContentSmart;
exports.getEmbedding = getEmbedding;
const generative_ai_1 = require("@google/generative-ai");
// --- CONFIGURACIÓN DE CLAVES Y MODELOS ---
// Leer claves desde variables de entorno. Espera listas separadas por comas.
const proApiKeys = (process.env.GEMINI_PRO_API_KEYS || "").split(",").filter(k => k.trim());
const flashApiKeys = (process.env.GEMINI_FLASH_API_KEYS || "").split(",").filter(k => k.trim());
// Prioridad de modelos a utilizar. Los modelos Pro más recientes son multimodales.
const PRO_MODELS = ["gemini-2.5-pro"];
const FLASH_MODEL = "gemini-2.5-flash"; // Flash también es multimodal
// --- GESTIÓN DE ESTADO ---
// Trackers para la rotación de claves
let currentProKeyIndex = 0;
let currentFlashKeyIndex = 0;
// Caché para los clientes de GoogleGenerativeAI
const proClients = new Array(proApiKeys.length).fill(null);
const flashClients = new Array(flashApiKeys.length).fill(null);
/**
 * Obtiene un cliente de IA generativa para una clave y tipo específicos, usando caché.
 */
function getClient(type, index) {
    const keys = type === 'pro' ? proApiKeys : flashApiKeys;
    const clients = type === 'pro' ? proClients : flashClients;
    if (index >= keys.length) {
        throw new Error(`Índice de clave (${index}) fuera de rango para el tipo '${type}'.`);
    }
    if (!clients[index]) {
        clients[index] = new generative_ai_1.GoogleGenerativeAI(keys[index]);
    }
    return clients[index];
}
/**
 * Intenta ejecutar una petición a un modelo de Gemini y maneja los errores de cuota.
 * Acepta prompts de texto o multimodales (texto + partes de imagen).
 */
async function tryGenerate(modelName, prompt, type, keyIndex) {
    var _a;
    try {
        const client = getClient(type, keyIndex);
        const model = client.getGenerativeModel({
            model: modelName,
            safetySettings: [
                {
                    category: generative_ai_1.HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: generative_ai_1.HarmBlockThreshold.BLOCK_NONE,
                },
                {
                    category: generative_ai_1.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: generative_ai_1.HarmBlockThreshold.BLOCK_NONE,
                },
                {
                    category: generative_ai_1.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: generative_ai_1.HarmBlockThreshold.BLOCK_NONE,
                },
                {
                    category: generative_ai_1.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: generative_ai_1.HarmBlockThreshold.BLOCK_NONE,
                },
            ],
        });
        console.log(`🚀 Intentando generar con modelo: ${modelName} (Clave ${type.toUpperCase()}[${keyIndex}])`);
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log(`✅ Éxito con modelo: ${modelName} (Clave ${type.toUpperCase()}[${keyIndex}])`);
        return text;
    }
    catch (error) {
        const msg = ((_a = error.message) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || "";
        // Identificar si el error es por cuota/límite para decidir si rotar la clave
        if (msg.includes("quota") || msg.includes("limit") || msg.includes("exceeded") || msg.includes("api key not valid")) {
            console.warn(`⚠️ Error de cuota/límite con ${modelName} (Clave ${type.toUpperCase()}[${keyIndex}]). Rotando...`);
            return null; // Indica que se debe intentar con la siguiente clave
        }
        // Si el error es diferente (ej. contenido bloqueado), lo lanzamos para no seguir intentando
        console.error(`❌ Error no recuperable con ${modelName} (Clave ${type.toUpperCase()}[${keyIndex}]):`, error.message);
        throw error;
    }
}
/**
 * Genera contenido utilizando una estrategia de fallback y rotación de claves.
 * Acepta prompts de texto o multimodales.
 * 1. Itera sobre los modelos PRO, probando todas las claves PRO para cada uno.
 * 2. Si todos los modelos y claves PRO fallan, pasa al modelo FLASH.
 * 3. Itera sobre todas las claves FLASH con el modelo FLASH.
 * 4. Si todo falla, lanza un error.
 */
async function generateContentSmart(prompt) {
    // --- FASE 1: Intentar con Modelos y Claves PRO ---
    if (proApiKeys.length > 0) {
        for (const modelName of PRO_MODELS) {
            for (let i = 0; i < proApiKeys.length; i++) {
                const result = await tryGenerate(modelName, prompt, 'pro', currentProKeyIndex);
                if (result !== null) {
                    return result; // Éxito, devolvemos el resultado
                }
                // Rotar clave PRO para el siguiente intento
                currentProKeyIndex = (currentProKeyIndex + 1) % proApiKeys.length;
            }
        }
    }
    else {
        console.log("ℹ️ No hay claves PRO configuradas. Saltando a claves FLASH.");
    }
    // --- FASE 2: Fallback a Modelos y Claves FLASH ---
    if (flashApiKeys.length > 0) {
        for (let i = 0; i < flashApiKeys.length; i++) {
            const result = await tryGenerate(FLASH_MODEL, prompt, 'flash', currentFlashKeyIndex);
            if (result !== null) {
                return result; // Éxito, devolvemos el resultado
            }
            // Rotar clave FLASH para el siguiente intento
            currentFlashKeyIndex = (currentFlashKeyIndex + 1) % flashApiKeys.length;
        }
    }
    else {
        console.log("ℹ️ No hay claves FLASH configuradas.");
    }
    // --- FASE 3: Fracaso total ---
    throw new Error("🚨 Fracaso total: Todas las claves y modelos disponibles fallaron.");
}
/**
 * Genera un embedding vectorial para un texto dado.
 * Utiliza el modelo 'text-embedding-004'.
 */
async function getEmbedding(text) {
    // Usamos la primera clave Flash disponible (son más rápidas/baratas para embeddings)
    // O iteramos si falla.
    const modelName = "text-embedding-004";
    for (let i = 0; i < flashApiKeys.length; i++) {
        try {
            const client = getClient('flash', i);
            const model = client.getGenerativeModel({ model: modelName });
            const result = await model.embedContent(text);
            return result.embedding.values;
        }
        catch (error) {
            console.warn(`⚠️ Error generando embedding con clave FLASH[${i}]:`, error.message);
            // Continuar con la siguiente clave
        }
    }
    // Si fallan las Flash, intentamos con Pro (aunque es raro usarlas para esto)
    for (let i = 0; i < proApiKeys.length; i++) {
        try {
            const client = getClient('pro', i);
            const model = client.getGenerativeModel({ model: modelName });
            const result = await model.embedContent(text);
            return result.embedding.values;
        }
        catch (error) {
            console.warn(`⚠️ Error generando embedding con clave PRO[${i}]:`, error.message);
        }
    }
    throw new Error("🚨 No se pudo generar el embedding con ninguna clave disponible.");
}

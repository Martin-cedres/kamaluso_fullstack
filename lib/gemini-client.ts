import { GoogleGenerativeAI, GenerativeModel, Part, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// --- CONFIGURACIÓN DE CLAVES Y MODELOS ---

// Leer claves desde variables de entorno. Espera listas separadas por comas.
const proApiKeys: string[] = (process.env.GEMINI_PRO_API_KEYS || "").split(",").filter(k => k.trim());
const flashApiKeys: string[] = (process.env.GEMINI_FLASH_API_KEYS || "").split(",").filter(k => k.trim());

// Prioridad de modelos a utilizar. IMPORTANTE: Solo gemini-2.5-flash está disponible sin cuenta de pago.
// Si actualizas a Google AI Studio de pago o Vertex AI, podrás usar gemini-2.5-pro.
const PRO_MODELS = ["gemini-2.5-flash"]; // Ajustado a lo que realmente está disponible
const FLASH_MODEL = "gemini-2.5-flash"; // Flash también es multimodal

// --- GESTIÓN DE ESTADO ---

// Trackers para la rotación de claves
let currentProKeyIndex = 0;
let currentFlashKeyIndex = 0;

// Caché para los clientes de GoogleGenerativeAI
const proClients: (GoogleGenerativeAI | null)[] = new Array(proApiKeys.length).fill(null);
const flashClients: (GoogleGenerativeAI | null)[] = new Array(flashApiKeys.length).fill(null);

/**
 * Obtiene un cliente de IA generativa para una clave y tipo específicos, usando caché.
 */
function getClient(type: 'pro' | 'flash', index: number): GoogleGenerativeAI {
  const keys = type === 'pro' ? proApiKeys : flashApiKeys;
  const clients = type === 'pro' ? proClients : flashClients;

  if (index >= keys.length) {
    throw new Error(`Índice de clave (${index}) fuera de rango para el tipo '${type}'.`);
  }

  if (!clients[index]) {
    clients[index] = new GoogleGenerativeAI(keys[index]);
  }
  return clients[index]!;
}

/**
 * Intenta ejecutar una petición a un modelo de Gemini y maneja los errores de cuota.
 * Acepta prompts de texto o multimodales (texto + partes de imagen).
 */
async function tryGenerate(modelName: string, prompt: string | (string | Part)[], type: 'pro' | 'flash', keyIndex: number): Promise<string | null> {
  try {
    const client = getClient(type, keyIndex);
    const model: GenerativeModel = client.getGenerativeModel({
      model: modelName,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });

    console.log(`🚀 Intentando generar con modelo: ${modelName} (Clave ${type.toUpperCase()}[${keyIndex}])`);

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    console.log(`✅ Éxito con modelo: ${modelName} (Clave ${type.toUpperCase()}[${keyIndex}])`);
    return text;

  } catch (error: any) {
    const msg = error.message?.toLowerCase() || "";

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
export async function generateContentSmart(prompt: string | (string | Part)[]): Promise<string> {
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
  } else {
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
  } else {
    console.log("ℹ️ No hay claves FLASH configuradas.");
  }

  // --- FASE 3: Fracaso total ---
  throw new Error("🚨 Fracaso total: Todas las claves y modelos disponibles fallaron.");
}

/**
 * Genera un embedding vectorial para un texto dado.
 * Utiliza el modelo 'text-embedding-004'.
 */
export async function getEmbedding(text: string): Promise<number[]> {
  // Usamos la primera clave Flash disponible (son más rápidas/baratas para embeddings)
  // O iteramos si falla.
  const modelName = "text-embedding-004";

  for (let i = 0; i < flashApiKeys.length; i++) {
    try {
      const client = getClient('flash', i);
      const model = client.getGenerativeModel({ model: modelName });

      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error: any) {
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
    } catch (error: any) {
      console.warn(`⚠️ Error generando embedding con clave PRO[${i}]:`, error.message);
    }
  }

  throw new Error("🚨 No se pudo generar el embedding con ninguna clave disponible.");
}

/**
 * Clasifica la intención de un mensaje de usuario utilizando un modelo rápido (Flash).
 * Devuelve un objeto JSON con la clasificación.
 */
export async function classifyMessageIntent(message: string): Promise<{ intent: string; category: string; sentiment: string }> {
  const prompt = `
    Analiza el siguiente mensaje de un cliente de una papelería personalizada (e-commerce).
    Mensaje: "${message}"
    
    Clasifica en JSON puro (sin markdown) con estos campos:
    - intent: "compra" (quiere comprar/precio), "duda_producto" (características), "envios" (tiempos/costos), "reclamo" (problema), "otro".
    - category: Tema principal en 1 palabra (ej: agendas, libretas, diseño, pago, horaraio).
    - sentiment: "positivo", "neutro", "negativo".
  `;

  try {
    // Usamos FLASH directo porque es rápido y barato para esta tarea simple
    // Iteramos sobre las claves flash disponibles
    for (let i = 0; i < flashApiKeys.length; i++) {
      const result = await tryGenerate(FLASH_MODEL, prompt, 'flash', i);
      if (result) {
        // Limpiar markdown si la IA lo pone (```json ... ```)
        const cleanJson = result.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
      }
    }
    // Fallback silencioso si falla
    return { intent: 'indefinido', category: 'general', sentiment: 'neutro' };
  } catch (error) {
    console.error("Error clasificando intención:", error);
    return { intent: 'indefinido', category: 'general', sentiment: 'neutro' };
  }
}

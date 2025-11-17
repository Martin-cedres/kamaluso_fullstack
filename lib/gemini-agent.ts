// gemini-agent.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const KEYS = [
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean);

let currentIndex = 0;
let client = new GoogleGenerativeAI(KEYS[currentIndex]);

function switchKey() {
  currentIndex = (currentIndex + 1) % KEYS.length;
  client = new GoogleGenerativeAI(KEYS[currentIndex]);
  console.log(`⚡ Cambiando a API Key del agente (#${currentIndex + 1})`);
}

export async function generateWithFallback(modelName: string, prompt: string) {
  try {
    const model = client.getGenerativeModel({ model: modelName });
    return await model.generateContent(prompt);
  } catch (error: any) {
    const msg = error.message || "";

    if (msg.includes("quota") || msg.includes("limit") || msg.includes("exceeded")) {
      console.warn("⚠️ El agente agotó la cuota. Rotando clave…");

      switchKey();

      const retryModel = client.getGenerativeModel({ model: modelName });
      return await retryModel.generateContent(prompt);
    }

    throw error;
  }
}

// gemini-client.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

export const geminiClient = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);
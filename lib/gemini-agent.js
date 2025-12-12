"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWithFallback = generateWithFallback;
// lib/gemini-agent.ts
const gemini_client_1 = require("./gemini-client");
/**
 * Genera contenido de texto utilizando el cliente inteligente de Gemini.
 * Esta función actúa como un wrapper simple, delegando toda la lógica de
 * selección de modelo, rotación de claves y fallback al `generateContentSmart`.
 *
 * @param prompt El prompt de texto para enviar al modelo de IA.
 * @returns Una promesa que se resuelve con el texto generado.
 */
async function generateWithFallback(prompt) {
    try {
        // Delegar directamente al cliente inteligente. Él se encargará de todo.
        const result = await (0, gemini_client_1.generateContentSmart)(prompt);
        return result;
    }
    catch (error) {
        // Si el cliente inteligente falla después de todos los intentos,
        // captura el error final y lo propaga o maneja según sea necesario.
        console.error("🚨 El agente de Gemini no pudo generar contenido después de múltiples intentos:", error.message);
        // Propagar el error para que el llamador pueda manejarlo.
        throw error;
    }
}

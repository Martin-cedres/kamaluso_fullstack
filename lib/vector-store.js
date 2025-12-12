"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findSimilarProducts = findSimilarProducts;
const gemini_client_1 = require("./gemini-client");
const Product_1 = __importDefault(require("../models/Product"));
const mongoose_1 = __importDefault(require("./mongoose"));
/**
 * Calcula la similitud coseno entre dos vectores.
 */
function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0)
        return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
/**
 * Encuentra productos similares a una consulta de texto utilizando búsqueda vectorial en memoria.
 * NOTA: Para catálogos muy grandes, usar una base de datos vectorial real (Pinecone, MongoDB Atlas Search, etc.).
 * Para < 1000 productos, esto es muy rápido y gratis.
 */
async function findSimilarProducts(query, limit = 5) {
    await (0, mongoose_1.default)();
    // 1. Generar embedding de la consulta
    const queryEmbedding = await (0, gemini_client_1.getEmbedding)(query);
    // 2. Obtener todos los productos con embeddings
    // Seleccionamos explícitamente el campo 'embedding' que está oculto por defecto
    const products = await Product_1.default.find({
        embedding: { $exists: true, $ne: [] },
        status: 'activo' // Solo productos activos
    }).select('+embedding name description price slug category keyPoints');
    if (!products || products.length === 0) {
        console.warn("⚠️ No se encontraron productos con embeddings.");
        return [];
    }
    // 3. Calcular similitud con cada producto
    const results = products.map((product) => {
        const similarity = cosineSimilarity(queryEmbedding, product.embedding);
        return { product, score: similarity };
    });
    // 4. Ordenar por similitud descendente y tomar los top N
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
}

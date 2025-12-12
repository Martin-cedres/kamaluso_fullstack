import { getEmbedding } from './gemini-client';
import Product, { IProduct } from '../models/Product';
import connectDB from './mongoose';

// Definición de tipo para el resultado de búsqueda
interface SearchResult {
    product: IProduct;
    score: number;
}

/**
 * Calcula la similitud coseno entre dos vectores.
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Encuentra productos similares a una consulta de texto utilizando búsqueda vectorial en memoria.
 * NOTA: Para catálogos muy grandes, usar una base de datos vectorial real (Pinecone, MongoDB Atlas Search, etc.).
 * Para < 1000 productos, esto es muy rápido y gratis.
 */
export async function findSimilarProducts(query: string, limit: number = 5): Promise<SearchResult[]> {
    await connectDB();

    // 1. Generar embedding de la consulta
    const queryEmbedding = await getEmbedding(query);

    // 2. Obtener todos los productos con embeddings
    // Seleccionamos explícitamente el campo 'embedding' que está oculto por defecto
    const products = await Product.find({
        embedding: { $exists: true, $ne: [] },
        status: 'activo' // Solo productos activos
    }).select('+embedding name description price slug category keyPoints');

    if (!products || products.length === 0) {
        console.warn("⚠️ No se encontraron productos con embeddings.");
        return [];
    }

    // 3. Calcular similitud con cada producto
    const results: SearchResult[] = products.map((product) => {
        const similarity = cosineSimilarity(queryEmbedding, product.embedding!);
        return { product, score: similarity };
    });

    // 4. Ordenar por similitud descendente y tomar los top N
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, limit);
}

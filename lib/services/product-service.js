"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProductsForContext = getAllProductsForContext;
const mongoose_1 = __importDefault(require("../mongoose"));
const Product_1 = __importDefault(require("../../models/Product"));
/**
 * Obtiene un resumen de todos los productos para alimentar el contexto del chatbot.
 * Filtra solo la información relevante para minimizar tokens.
 */
async function getAllProductsForContext() {
    await (0, mongoose_1.default)();
    // Asegurarse de que Categories esté cargado si es necesario para populate, 
    // aunque aquí solo necesitamos el nombre de la categoría si está disponible.
    // Consultar productos activos. 
    // Nota: El campo 'categoria' es un string, no un ObjectId, por lo que no usamos populate.
    const products = await Product_1.default.find({ status: 'activo' })
        .select('nombre basePrice descripcion descripcionExtensa categoria slug puntosClave')
        .lean();
    return products.map(p => ({
        name: p.nombre,
        price: p.basePrice,
        category: String(p.categoria || 'General'),
        description: String(p.descripcion || ''),
        longDescription: String(p.descripcionExtensa || ''),
        keyPoints: p.puntosClave || [],
        slug: p.slug,
        inStock: true
    }));
}

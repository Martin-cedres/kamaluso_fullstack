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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv = __importStar(require("dotenv"));
const gemini_client_1 = require("../lib/gemini-client");
const Product_1 = __importDefault(require("../models/Product"));
const mongoose_2 = __importDefault(require("../lib/mongoose"));
// Cargar variables de entorno
dotenv.config({ path: '.env.local' });
async function generateEmbeddings() {
    console.log("🚀 Iniciando generación de embeddings...");
    try {
        await (0, mongoose_2.default)();
        console.log("✅ Conectado a MongoDB");
        // Usamos lean() para obtener objetos planos y evitar problemas de casting al leer
        const products = await Product_1.default.find({}).lean();
        console.log(`📦 Encontrados ${products.length} productos.`);
        let updatedCount = 0;
        let errorCount = 0;
        for (const product of products) {
            console.log(`Processing: ${product.nombre}...`);
            // Fix descripción si es array
            let descripcion = product.descripcion;
            if (Array.isArray(descripcion)) {
                descripcion = descripcion.join(' ');
            }
            // Construir el texto representativo del producto para el embedding
            // Incluimos nombre, categoría, descripción y puntos clave
            const textToEmbed = `
                Nombre: ${product.nombre}
                Categoría: ${product.categoria || ''}
                Descripción: ${descripcion || ''}
                Puntos Clave: ${(product.puntosClave || []).join(', ')}
                Usos: ${(product.useCases || []).join(', ')}
            `.trim();
            try {
                const embedding = await (0, gemini_client_1.getEmbedding)(textToEmbed);
                // Usamos updateOne para guardar solo lo necesario y corregir la descripción
                await Product_1.default.updateOne({ _id: product._id }, {
                    embedding: embedding,
                    descripcion: descripcion
                });
                updatedCount++;
                // Pequeña pausa para evitar rate limits agresivos
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            catch (err) {
                console.error(`❌ Error generando embedding para ${product.nombre}:`, err.message);
                errorCount++;
            }
        }
        console.log("------------------------------------------------");
        console.log(`✅ Proceso finalizado.`);
        console.log(`✨ Actualizados: ${updatedCount}`);
        console.log(`❌ Errores: ${errorCount}`);
    }
    catch (error) {
        console.error("🔥 Error fatal en el script:", error);
    }
    finally {
        await mongoose_1.default.disconnect();
        process.exit();
    }
}
generateEmbeddings();

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { getEmbedding } from '../lib/gemini-client';
import Product from '../models/Product';
import connectDB from '../lib/mongoose';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

async function generateEmbeddings() {
    console.log("🚀 Iniciando generación de embeddings...");

    try {
        await connectDB();
        console.log("✅ Conectado a MongoDB");

        // Usamos lean() para obtener objetos planos y evitar problemas de casting al leer
        const products = await Product.find({}).lean();
        console.log(`📦 Encontrados ${products.length} productos.`);

        let updatedCount = 0;
        let errorCount = 0;

        for (const product of products) {
            console.log(`Processing: ${product.nombre}...`);

            // Fix descripción si es array
            let descripcion = product.descripcion;
            if (Array.isArray(descripcion)) {
                descripcion = (descripcion as any).join(' ');
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
                const embedding = await getEmbedding(textToEmbed);

                // Usamos updateOne para guardar solo lo necesario y corregir la descripción
                await Product.updateOne(
                    { _id: product._id },
                    {
                        embedding: embedding,
                        descripcion: descripcion
                    }
                );

                updatedCount++;
                // Pequeña pausa para evitar rate limits agresivos
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (err: any) {
                console.error(`❌ Error generando embedding para ${product.nombre}:`, err.message);
                errorCount++;
            }
        }

        console.log("------------------------------------------------");
        console.log(`✅ Proceso finalizado.`);
        console.log(`✨ Actualizados: ${updatedCount}`);
        console.log(`❌ Errores: ${errorCount}`);

    } catch (error) {
        console.error("🔥 Error fatal en el script:", error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

generateEmbeddings();

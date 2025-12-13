
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI no está definida en .env.local');
    process.exit(1);
}

// Definir esquemas mínimos necesarios
const CategorySchema = new mongoose.Schema({
    nombre: String,
    slug: String,
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
}, { strict: false });

const ProductSchema = new mongoose.Schema({
    nombre: String,
    slug: String,
    categoria: String, // Guardamos el slug de la categoria aqui en algunos casos
    subCategoria: [String],
    status: String,
}, { strict: false });

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function migrate() {
    try {
        console.log('🚀 Iniciando script de migración...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // 1. Identificar IDs de Categorías Principales Antiguas
        const tapaDura = await Category.findOne({ slug: 'tapa-dura' });
        const tapaFlex = await Category.findOne({ slug: 'tapa-flex' });

        if (!tapaDura) console.warn('⚠️ No se encontró la categoría "Tapa Dura"');
        if (!tapaFlex) console.warn('⚠️ No se encontró la categoría "Tapa Flex"');

        const redirects = [];

        // 2. Procesar Tapa Flex (ELIMINAR)
        if (tapaFlex) {
            console.log('--------------------------------------------------');
            console.log('🗑️  Procesando eliminación de "Tapa Flex"...');

            // Buscar productos asociados a Tapa Flex (ya sea por ID de categoria o slug)
            // Asumimos que la relación en Product.ts es por slug en 'categoria' o validamos lógica
            // En Product.ts vi "categoria: { type: String }" que parece ser el SLUG. 

            const flexProducts = await Product.find({
                $or: [
                    { categoria: 'tapa-flex' },
                    { categoria: tapaFlex._id.toString() } // Por si acaso
                ]
            });

            console.log(`Found ${flexProducts.length} productos Tapa Flex para eliminar.`);

            for (const p of flexProducts) {
                redirects.push({
                    source: `/productos/${p.slug}`,
                    destination: '/', // Redirect to home or generic products page by default
                    permanent: true,
                });
                // DELETE
                await Product.deleteOne({ _id: p._id });
                console.log(`   - Eliminado: ${p.nombre} (${p.slug})`);
            }

            // Buscar subcategorías de Tapa Flex (si existieran) y eliminarlas también?
            // O moverlas? El requerimiento es eliminar Tapa Flex y su contenido.
            const flexSubcats = await Category.find({ parent: tapaFlex._id });
            for (const cat of flexSubcats) {
                redirects.push({
                    source: `/productos/${cat.slug}`,
                    destination: '/',
                    permanent: true,
                });
                await Category.deleteOne({ _id: cat._id });
                console.log(`   - Subcategoría Eliminada: ${cat.nombre}`);
            }

            // Redirect para la categoría principal
            redirects.push({
                source: '/productos/tapa-flex',
                destination: '/',
                permanent: true,
            });

            // Eliminar Tapa Flex Root
            await Category.deleteOne({ _id: tapaFlex._id });
            console.log('✅ Categoría raíz "Tapa Flex" eliminada.');
        }

        // 3. Procesar Tapa Dura (PROMOVER SUBCATEGORÍAS)
        if (tapaDura) {
            console.log('--------------------------------------------------');
            console.log('🔼 Procesando "Tapa Dura" - Promoviendo subcategorías...');

            const duraSubcats = await Category.find({ parent: tapaDura._id });
            console.log(`Found ${duraSubcats.length} subcategorías en Tapa Dura.`);

            for (const cat of duraSubcats) {
                // Update parent to null
                cat.parent = null;
                // We might want to clear "tapa-dura" from keywords if useful
                await cat.save();
                console.log(`   - Promovida a principal: ${cat.nombre}`);
            }

            // Redirect para la antigua raiz
            redirects.push({
                source: '/productos/tapa-dura',
                destination: '/', // O redirigir a un listado general
                permanent: true,
            });

            // Eliminar Tapa Dura Root (ya no contiene hijos lógicos)
            await Category.deleteOne({ _id: tapaDura._id });
            console.log('✅ Categoría raíz "Tapa Dura" eliminada (ya vacía de hijos directos).');
        }

        // 4. Guardar Redirects
        console.log('--------------------------------------------------');
        const redirectsPath = path.join(__dirname, '../redirects-generated.json');
        fs.writeFileSync(redirectsPath, JSON.stringify(redirects, null, 2));
        console.log(`💾 Guardada lista de ${redirects.length} redirecciones en redirects-generated.json`);

        console.log('✅ Migración completada con éxito.');

    } catch (error) {
        console.error('❌ Error fatal durante la migración:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Conexión cerrada.');
    }
}

migrate();

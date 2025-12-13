const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function fixProductCategories() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

        console.log('═══════════════════════════════════════');
        console.log('ACTUALIZANDO CATEGORÍAS DE PRODUCTOS');
        console.log('═══════════════════════════════════════\n');

        // Update products where categoria is "tapa-dura" or "tapa-flex"
        const productsToUpdate = await Product.find({
            categoria: { $in: ['tapa-dura', 'tapa-flex'] }
        });

        console.log(`Encontrados ${productsToUpdate.length} productos con categorías obsoletas.\n`);

        let updatedCount = 0;

        for (const product of productsToUpdate) {
            // The correct category is in subCategoria[0]
            const newCategory = product.subCategoria && product.subCategoria[0]
                ? product.subCategoria[0]
                : null;

            if (newCategory) {
                console.log(`Actualizando: ${product.nombre}`);
                console.log(`  Categoria antigua: ${product.categoria}`);
                console.log(`  Categoria nueva: ${newCategory}`);
                console.log(`  SubCategoria: [] (vacío)\n`);

                await Product.updateOne(
                    { _id: product._id },
                    {
                        $set: {
                            categoria: newCategory,
                            subCategoria: []
                        }
                    }
                );

                updatedCount++;
            } else {
                console.log(`⚠️ Producto sin subCategoria: ${product.nombre} - Se requiere revisión manual\n`);
            }
        }

        console.log(`\n✅ Actualizados ${updatedCount} productos correctamente.`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

fixProductCategories();

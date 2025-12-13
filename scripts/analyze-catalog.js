const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function analyzeProductCatalog() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

        const products = await Product.find({ status: 'activo' }).lean();

        console.log('═══════════════════════════════════════');
        console.log('ANÁLISIS DEL CATÁLOGO DE PRODUCTOS');
        console.log('═══════════════════════════════════════\n');

        console.log(`Total de productos activos: ${products.length}\n`);

        // Agrupar por palabras clave en el nombre
        const tipos = {};
        const categorias = {};

        products.forEach(p => {
            const nombre = p.nombre.toLowerCase();

            // Detectar tipos de productos
            if (nombre.includes('agenda')) {
                tipos['Agendas'] = (tipos['Agendas'] || 0) + 1;
            }
            if (nombre.includes('libreta') || nombre.includes('cuaderno')) {
                tipos['Libretas/Cuadernos'] = (tipos['Libretas/Cuadernos'] || 0) + 1;
            }
            if (nombre.includes('planner')) {
                tipos['Planners'] = (tipos['Planners'] || 0) + 1;
            }
            if (nombre.includes('recetario')) {
                tipos['Recetarios'] = (tipos['Recetarios'] || 0) + 1;
            }
            if (nombre.includes('docente') || nombre.includes('maestr')) {
                tipos['Agendas Docentes'] = (tipos['Agendas Docentes'] || 0) + 1;
            }

            // Agrupar por categoría actual
            if (p.categoria) {
                categorias[p.categoria] = (categorias[p.categoria] || 0) + 1;
            }
        });

        console.log('DISTRIBUCIÓN POR TIPO DE PRODUCTO:');
        console.log('───────────────────────────────────────');
        Object.entries(tipos).forEach(([tipo, count]) => {
            const porcentaje = ((count / products.length) * 100).toFixed(1);
            console.log(`${tipo.padEnd(25)} ${count} productos (${porcentaje}%)`);
        });

        console.log('\n\nDISTRIBUCIÓN POR CATEGORÍA:');
        console.log('───────────────────────────────────────');
        Object.entries(categorias).forEach(([cat, count]) => {
            const porcentaje = ((count / products.length) * 100).toFixed(1);
            console.log(`${cat.padEnd(25)} ${count} productos (${porcentaje}%)`);
        });

        console.log('\n\nLISTADO COMPLETO DE PRODUCTOS:');
        console.log('───────────────────────────────────────');
        products.forEach((p, i) => {
            console.log(`${(i + 1).toString().padStart(2)}. ${p.nombre}`);
            console.log(`    Categoría: ${p.categoria || 'sin categoría'}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

analyzeProductCatalog();

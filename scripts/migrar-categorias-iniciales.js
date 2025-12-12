"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("../lib/mongoose"));
const Category_1 = __importDefault(require("../models/Category"));
const initialCategories = [
    {
        nombre: 'Agendas Personalizadas',
        slug: 'agendas-personalizadas',
        descripcion: 'Agendas personalizadas para organizar tu día a día con tu estilo único.',
        imagen: '/categorias/agendas.png', // Opcional: puedes añadir una imagen por defecto
        keywords: ['agendas', 'agenda personalizada', 'organizador', 'diseño único'],
    },
    {
        nombre: 'Cuadernos y Libretas Personalizadas',
        slug: 'cuadernos-y-libretas-personalizadas',
        descripcion: 'Cuadernos y libretas personalizadas para plasmar tus ideas con tu toque especial.',
        imagen: '/categorias/libretas-y-cuadernos.png', // Opcional
        keywords: ['libretas', 'cuadernos', 'libreta personalizada', 'cuaderno personalizado', 'papelería'],
    },
];
async function migrateCategories() {
    await (0, mongoose_1.default)();
    console.log('Conectado a la base de datos.');
    for (const catData of initialCategories) {
        try {
            const existingCategory = await Category_1.default.findOne({ slug: catData.slug });
            if (existingCategory) {
                console.log(`Categoría '${catData.nombre}' ya existe. Saltando.`);
            }
            else {
                const newCategory = new Category_1.default(catData);
                await newCategory.save();
                console.log(`Categoría '${catData.nombre}' creada con éxito.`);
            }
        }
        catch (error) {
            console.error(`Error al procesar la categoría '${catData.nombre}':`, error.message);
        }
    }
    console.log('Migración de categorías iniciales completada.');
    process.exit();
}
migrateCategories();

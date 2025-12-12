"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '.env.local' });
const mongoose_1 = __importDefault(require("mongoose"));
const Product_1 = __importDefault(require("../models/Product"));
const mongoose_2 = __importDefault(require("../lib/mongoose"));
async function inicializarCampos() {
    console.log('Iniciando script para inicializar campos faltantes...');
    await (0, mongoose_2.default)();
    try {
        // Encuentra productos donde el campo `customizationGroups` no existe
        const productosAInicializar = await Product_1.default.find({
            customizationGroups: { $exists: false }
        });
        if (productosAInicializar.length === 0) {
            console.log('No se encontraron productos que necesiten inicialización. Nada que hacer.');
            return;
        }
        console.log(`Se encontraron ${productosAInicializar.length} productos para inicializar.`);
        for (const producto of productosAInicializar) {
            console.log(`- Inicializando campo en: "${producto.nombre}" (ID: ${producto._id})`);
            try {
                producto.customizationGroups = [];
                await producto.save();
                console.log(`  => ÉXITO: Campo inicializado en "${producto.nombre}".`);
            }
            catch (error) {
                console.error(`  !! ERROR al inicializar "${producto.nombre}":`, error.message);
            }
        }
    }
    catch (error) {
        console.error('Ocurrió un error fatal durante el script:', error);
    }
    finally {
        await mongoose_1.default.connection.close();
        console.log('Conexión a la base de datos cerrada.');
    }
}
inicializarCampos().catch(console.error);

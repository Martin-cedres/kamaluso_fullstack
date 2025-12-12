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
async function repararDatos() {
    console.log('Iniciando script de reparación de datos para `customizationGroups`...');
    await (0, mongoose_2.default)();
    console.log('Conexión a la base de datos establecida.');
    try {
        // Un producto está corrupto si el campo `customizationGroups` es un string en lugar de un array
        const productosCorruptos = await Product_1.default.find({
            customizationGroups: { $type: 'string' }
        });
        if (productosCorruptos.length === 0) {
            console.log('No se encontraron productos con datos corruptos. Nada que hacer.');
            return;
        }
        console.log(`Se encontraron ${productosCorruptos.length} productos para reparar.`);
        for (const producto of productosCorruptos) {
            console.log(`- Intentando reparar: "${producto.nombre}" (ID: ${producto._id})`);
            try {
                const valorProblematico = producto.customizationGroups;
                if (typeof valorProblematico !== 'string') {
                    console.log('  -> El campo no es un string, omitiendo.');
                    continue;
                }
                // Intentamos parsear el string, asumiendo que es un JSON válido
                const datosParseados = JSON.parse(valorProblematico);
                if (Array.isArray(datosParseados)) {
                    producto.customizationGroups = datosParseados;
                    await producto.save();
                    console.log(`  => ÉXITO: "${producto.nombre}" ha sido reparado.`);
                }
                else {
                    throw new Error('El contenido del string no es un array JSON.');
                }
            }
            catch (error) {
                console.error(`  !! ERROR al reparar "${producto.nombre}":`, error.message);
            }
        }
    }
    catch (error) {
        console.error('Ocurrió un error fatal durante el script de reparación:', error);
    }
    finally {
        await mongoose_1.default.connection.close();
        console.log('Conexión a la base de datos cerrada.');
    }
}
repararDatos().catch(console.error);

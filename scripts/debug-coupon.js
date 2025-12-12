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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: 'C:\\Users\\LENOVO\\Desktop\\kamaluso_fullstack\\.env.local' });
async function debugCoupon() {
    const connectDB = (await Promise.resolve().then(() => __importStar(require('../lib/mongoose')))).default;
    const Coupon = (await Promise.resolve().then(() => __importStar(require('../models/Coupon')))).default;
    const Product = (await Promise.resolve().then(() => __importStar(require('../models/Product')))).default;
    await connectDB();
    const couponCode = 'BIENVENIDA-56U8W';
    const productSlug = 'agenda-semanal-en-columnas-tapa-flex-personalizada-2026-kamaluso';
    console.log(`Buscando cupón: ${couponCode}`);
    const coupon = await Coupon.findOne({ code: couponCode });
    console.log(`Buscando producto: ${productSlug}`);
    const product = await Product.findOne({ slug: productSlug });
    console.log('\n--- Detalles del Cupón ---');
    if (coupon) {
        console.log(JSON.stringify(coupon, null, 2));
    }
    else {
        console.log('Cupón no encontrado.');
    }
    console.log('\n--- Detalles del Producto ---');
    if (product) {
        console.log(JSON.stringify(product, null, 2));
    }
    else {
        console.log('Producto no encontrado.');
    }
    process.exit(0);
}
debugCoupon().catch(err => {
    console.error(err);
    process.exit(1);
});

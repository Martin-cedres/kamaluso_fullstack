"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.faqsData = void 0;
const shipping_1 = require("./shipping");
exports.faqsData = [
    {
        question: '¿Cuánto tiempo demora la producción de un pedido?',
        answer: "El tiempo de producción es de " + shipping_1.shippingInfo.productionTime + " más el tiempo de envío de la agencia. " + shipping_1.shippingInfo.details.production + " Siempre te daremos una fecha estimada al confirmar tu pedido.",
    },
    {
        question: '¿Puedo enviar mi propio logo o diseño?',
        answer: '¡Por supuesto! Nos encanta trabajar con tus ideas. Puedes enviarnos tu logo o diseño en formato vectorial (AI, EPS, SVG) o en alta resolución (PNG, JPG). Nuestro equipo de diseño lo revisará y te preparará una muestra digital antes de producir.',
    },
    {
        question: '¿Qué métodos de pago aceptan?',
        answer: 'Aceptamos pagos a través de Mercado Pago (tarjetas de crédito y débito), transferencias bancarias (BROU) y giros (Abitab, Red Pagos). Encontrarás todas las opciones al finalizar tu compra.',
    },
    {
        question: '¿Hacen envíos a todo Uruguay?',
        answer: "Sí, realizamos envíos a cada rincón de Uruguay a través de las principales agencias de transporte (" + shipping_1.shippingInfo.agencies.join(', ') + "). El costo del envío corre por cuenta del comprador y se abona al recibir el paquete.",
    },
    {
        question: '¿Cuál es el pedido mínimo para regalos empresariales?',
        answer: 'El pedido mínimo para acceder a precios mayoristas y personalización corporativa varía según el producto. Contáctanos a través de nuestra sección de Regalos Empresariales para que podamos darte una cotización a medida.',
    },
];

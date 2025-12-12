import React, { useState } from 'react';
import { shippingInfo } from '../lib/data/shipping';

interface FAQ {
    question: string;
    answer: string;
}

interface EventFAQProps {
    eventType: string;
    eventDate?: string;
}

const EventFAQ = ({ eventType, eventDate }: EventFAQProps) => {
    const faqs: FAQ[] = [
        {
            question: "¿Llega a tiempo para " + eventType + "?",
            answer: "¡Sí! Nuestros envíos demoran " + shippingInfo.productionTime + " más el tiempo de envío de la agencia. Si comprás ahora" + (eventDate ? " (antes del " + eventDate + ")" : "") + ", garantizamos la entrega antes de " + eventType + ". Los pedidos urgentes pueden coordinarse por WhatsApp.",
        },
        {
            question: '¿Puedo personalizar mi regalo?',
            answer: '¡Por supuesto! Todos nuestros productos pueden personalizarse con nombres, fechas, logos o tu propio diseño. Trabajamos con vos para crear exactamente lo que tenés en mente. El diseño está incluido en el precio.',
        },
        {
            question: '¿Cómo funciona el envío?',
            answer: "Realizamos envíos a todo Uruguay a través de " + shippingInfo.agencies.join(' o ') + ". El tiempo estimado es de " + shippingInfo.productionTime + " más el tiempo de la agencia. Podés hacer seguimiento de tu pedido en todo momento.",
        },
        {
            question: '¿Qué pasa si no me gusta el producto?',
            answer: 'Tenés 100% de garantía de satisfacción. Si el producto no cumple tus expectativas, te devolvemos tu dinero. Así de simple. Queremos que estés completamente feliz con tu compra.',
        },
    ];

    // Schema.org markup para SEO
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };

    return (
        <>
            {/* Schema.org JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            <section className="max-w-3xl mx-auto py-12 px-4">
                <h3 className="text-2xl md:text-3xl font-bold text-center mb-3 text-gray-900">
                    Preguntas Frecuentes
                </h3>
                <p className="text-center text-gray-600 mb-8">
                    Todo lo que necesitás saber sobre tu compra
                </p>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <details
                            key={index}
                            className="bg-white rounded-lg p-5 shadow-md hover:shadow-lg transition-shadow border border-gray-100"
                        >
                            <summary className="font-semibold text-gray-900 cursor-pointer flex items-center justify-between">
                                <span>{faq.question}</span>
                                <svg
                                    className="w-5 h-5 text-purple-600 transition-transform duration-200"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </summary>
                            <p className="mt-3 text-gray-700 leading-relaxed">
                                {faq.answer}
                            </p>
                        </details>
                    ))}
                </div>

                {/* CTA adicional */}
                <div className="mt-8 text-center">
                    <p className="text-gray-600 mb-4">
                        ¿Tenés otra consulta?
                    </p>
                    <a
                        href="https://wa.me/59898615074?text=Hola! Tengo una consulta sobre los productos"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                        </svg>
                        Escribinos por WhatsApp
                    </a>
                </div>
            </section>
        </>
    );
};

export default EventFAQ;

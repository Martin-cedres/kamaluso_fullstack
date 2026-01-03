import SeoMeta from '../components/SeoMeta';
import Link from 'next/link';
import Head from 'next/head';

export default function PreguntasFrecuentesB2B() {
    const faqs = [
        {
            question: '¿Cuál es la cantidad mínima para pedidos empresariales?',
            answer: 'No tenemos mínimo de compra. Puedes solicitar desde una única unidad personalizada con el logo de tu empresa. Por supuesto, ofrecemos precios especiales por volumen para cantidades mayores.',
        },
        {
            question: '¿Cuál es el precio de agendas corporativas por cantidad?',
            answer: 'El precio varía según el tipo de producto, tamaño y cantidad. Como referencia, nuestras agendas personalizadas parten desde $U 650. Para pedidos de +50 unidades ofrecemos descuentos por volumen. Solicita una cotización personalizada para tu empresa.',
        },
        {
            question: '¿Hacen envíos de regalos empresariales a todo Uruguay?',
            answer: 'Sí, enviamos a todo el país por la agencia de tu preferencia. Nosotros llevamos el pedido hasta la agencia sin costo adicional; tu empresa solo abona el costo del envío al recibirlo. También ofrecemos retiro en nuestro taller en San José de Mayo.',
        },
        {
            question: '¿Cuánto tiempo toma producir agendas personalizadas para empresas?',
            answer: 'El tiempo de producción depende del volumen del pedido. Para pedidos pequeños (1-10 unidades), generalmente es de 5-7 días hábiles. Para volúmenes mayores, el tiempo se ajusta proporcionalmente. Al cotizar te confirmamos la fecha estimada de entrega.',
        },
        {
            question: '¿Puedo ver una muestra antes de confirmar el pedido?',
            answer: 'Absolutamente. Preparamos una muestra digital (mockup) sin costo para que valides el diseño antes de imprimir. Para pedidos grandes (+100 unidades), podemos coordinar una muestra física.',
        },
        {
            question: '¿Qué opciones de personalización ofrecen para empresas?',
            answer: 'Ofrecemos personalización completa: tapas con tu logo/diseño corporativo, interior con fechas personalizadas (agenda semanal, diaria, o 2 días por página), libretas con rayado, liso o punteado. También puedes enviarnos tu propio diseño de interior exclusivo.',
        },
        {
            question: '¿Emiten factura para empresas?',
            answer: 'Sí, entregamos comprobantes oficiales por cada compra de acuerdo a la normativa vigente. Si tu empresa requiere específicamente crédito fiscal (IVA compras), consultanos previamente para coordinar los detalles.',
        },
        {
            question: '¿Pueden incluir el logo de mi empresa en las agendas?',
            answer: 'Sí, es lo que mejor hacemos. Tu logo se imprime a todo color en alta definición sobre la tapa laminada. El resultado es un producto premium que representa bien a tu marca. Enviamos mockup de aprobación antes de producir.',
        },
        {
            question: '¿Qué tipos de regalos empresariales ofrecen?',
            answer: 'Nos especializamos en papelería corporativa: agendas (tapa dura y flex), libretas, planners, anotadores y cuadernos. Todos 100% personalizables con tu branding. Ideales para regalos de fin de año, kits de bienvenida para empleados, o merchandising institucional.',
        },
        {
            question: '¿Hacen kits de bienvenida para nuevos empleados?',
            answer: 'Sí, es uno de nuestros servicios más solicitados. Podemos armar kits de onboarding con agenda + libreta + planner, todos con la imagen de tu empresa. Cotizamos el pack completo con precio especial.',
        },
        {
            question: '¿Cuándo debo hacer el pedido para regalos de fin de año?',
            answer: 'Recomendamos hacer pedidos de fin de año con al menos 3-4 semanas de anticipación (mediados de noviembre para entrega en diciembre). Para volúmenes grandes (+100 unidades), sugerimos contactarnos con más tiempo.',
        },
        {
            question: '¿Tienen un catálogo de productos?',
            answer: 'Puedes ver toda nuestra variedad de productos directamente en la sección de Regalos Empresariales de nuestra web. Para consultas sobre productos personalizados fuera de lo habitual, envíanos un mensaje.',
        },
        {
            question: '¿Cómo es el proceso de compra para empresas?',
            answer: 'Es muy simple: 1) Completas el formulario de cotización con tu idea y cantidad. 2) Te enviamos propuesta con mockup digital en menos de 24hs. 3) Aprobas el diseño y coordinamos pago. 4) Producimos y entregamos en la fecha acordada.',
        },
        {
            question: '¿Aceptan pagos con transferencia bancaria?',
            answer: 'Sí, aceptamos transferencia bancaria, Mercado Pago, y para empresas también ofrecemos la opción de pago contra entrega coordinado. Consulta las opciones al solicitar tu cotización.',
        },
        {
            question: '¿Me ayudan con la adaptación del diseño?',
            answer: 'Sí. Nos encargamos de adaptar tu logo y elementos de marca a nuestros productos para asegurar que el resultado final sea perfecto. Te enviamos siempre un mockup digital previo para tu aprobación.',
        },
    ];

    // Schema.org FAQPage
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };

    // Schema.org BreadcrumbList
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Inicio',
                item: 'https://www.papeleriapersonalizada.uy',
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Regalos Empresariales',
                item: 'https://www.papeleriapersonalizada.uy/regalos-empresariales',
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: 'Preguntas Frecuentes B2B',
                item: 'https://www.papeleriapersonalizada.uy/preguntas-frecuentes-b2b',
            },
        ],
    };

    return (
        <>
            <SeoMeta
                title="Preguntas Frecuentes Regalos Empresariales Uruguay | Kamaluso"
                description="Resolvemos tus dudas sobre agendas corporativas, precios por volumen, tiempos de entrega, personalización con logo y envíos empresariales en Uruguay."
                url="/preguntas-frecuentes-b2b"
                keywords="preguntas frecuentes regalos empresariales, precio agendas corporativas uruguay, envios empresariales, factura empresas, kits bienvenida empleados"
            />
            <Head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
                />
            </Head>

            <main className="min-h-screen bg-white">
                {/* Breadcrumb */}
                <nav className="bg-gray-50 py-4 px-6">
                    <div className="max-w-4xl mx-auto">
                        <ol className="flex items-center space-x-2 text-sm text-gray-500">
                            <li>
                                <Link href="/" className="hover:text-pink-600 transition">
                                    Inicio
                                </Link>
                            </li>
                            <li>/</li>
                            <li>
                                <Link href="/regalos-empresariales" className="hover:text-pink-600 transition">
                                    Regalos Empresariales
                                </Link>
                            </li>
                            <li>/</li>
                            <li className="text-gray-900 font-medium">Preguntas Frecuentes</li>
                        </ol>
                    </div>
                </nav>

                {/* Hero */}
                <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <span className="inline-block py-1 px-3 rounded-full bg-pink-600 text-xs font-bold tracking-wider mb-4 uppercase">
                            Empresas
                        </span>
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
                            Preguntas Frecuentes
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            Todo lo que necesitas saber sobre nuestros servicios de regalos empresariales,
                            agendas corporativas y personalización para tu empresa.
                        </p>
                    </div>
                </section>

                {/* FAQ List */}
                <section className="py-16 px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="space-y-6">
                            {faqs.map((faq, index) => (
                                <article
                                    key={index}
                                    className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition border border-gray-100"
                                >
                                    <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-start">
                                        <span className="text-pink-500 mr-3 text-xl flex-shrink-0">?</span>
                                        {faq.question}
                                    </h2>
                                    <p className="text-gray-600 ml-8 leading-relaxed">{faq.answer}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-pink-50 py-16 px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            ¿No encontraste lo que buscabas?
                        </h2>
                        <p className="text-gray-600 mb-8">
                            Nuestro equipo está listo para resolver cualquier duda sobre tu pedido corporativo.
                            Te respondemos en menos de 24 horas.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/regalos-empresariales#contacto"
                                className="inline-flex justify-center items-center px-8 py-4 border border-transparent text-lg font-bold rounded-full text-white bg-pink-600 hover:bg-pink-700 transition shadow-lg"
                            >
                                Solicitar Cotización
                            </Link>
                            <a
                                href="https://wa.me/59898615074?text=Hola%2C%20tengo%20una%20consulta%20sobre%20regalos%20empresariales"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex justify-center items-center px-8 py-4 border-2 border-gray-900 text-lg font-bold rounded-full text-gray-900 hover:bg-gray-900 hover:text-white transition"
                            >
                                💬 WhatsApp
                            </a>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

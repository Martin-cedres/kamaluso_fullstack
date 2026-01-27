import { GetStaticProps } from 'next'
import SeoMeta from '../components/SeoMeta'
import Link from 'next/link'
import Image from 'next/image'

export default function ImprimeYaPage() {
    // SEO Strategy: Attack "Fotocopias San José" (Local) and "Imprimir PDF Uruguay" (National)
    const pageTitle = "Fotocopias e Impresiones PDF San José y todo Uruguay | ImprimeYa Kamaluso";
    const pageDescription = "Servicio profesional de fotocopias e impresión de PDF en San José de Mayo y envíos a todo Uruguay. Precio por hoja, encuadernación espiral y atención por WhatsApp.";
    const canonicalUrl = "https://www.papeleriapersonalizada.uy/imprimeya";

    const phoneNumber = '59898615074';
    const whatsappMessage = '¡Hola! Quiero cotizar impresiones o fotocopias con ImprimeYa.';
    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    // Schema.org for LocalBusiness and Service
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "LocalBusiness",
                "@id": "https://www.papeleriapersonalizada.uy/imprimeya#localbusiness",
                "name": "Kamaluso - ImprimeYa Fotocopias",
                "image": "https://www.papeleriapersonalizada.uy/og-imprimeya.jpg",
                "telephone": "+598 98 615 074",
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "Ramón Massini 136",
                    "addressLocality": "San José de Mayo",
                    "addressRegion": "San José",
                    "postalCode": "80000",
                    "addressCountry": "UY"
                },
                "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": -34.344199,
                    "longitude": -56.721197
                },
                "openingHoursSpecification": {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": [
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday"
                    ],
                    "opens": "09:00",
                    "closes": "18:00"
                },
                "priceRange": "$"
            },
            {
                "@type": "Service",
                "serviceType": "Printing Service",
                "provider": {
                    "@id": "https://www.papeleriapersonalizada.uy/imprimeya#localbusiness"
                },
                "areaServed": {
                    "@type": "Country",
                    "name": "Uruguay"
                },
                "hasOfferCatalog": {
                    "@type": "OfferCatalog",
                    "name": "Servicios de Impresión",
                    "itemListElement": [
                        {
                            "@type": "Offer",
                            "itemOffered": {
                                "@type": "Service",
                                "name": "Impresión de PDF Blanco y Negro"
                            }
                        },
                        {
                            "@type": "Offer",
                            "itemOffered": {
                                "@type": "Service",
                                "name": "Impresión Color Láser"
                            }
                        },
                        {
                            "@type": "Offer",
                            "itemOffered": {
                                "@type": "Service",
                                "name": "Encuadernación Espiral y Anillado"
                            }
                        }
                    ]
                }
            }
        ]
    };

    const features = [
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            title: "Documentos PDF",
            description: "Libros digitales, resúmenes, apuntes, tesis y más"
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
            title: "Encuadernación Espiral",
            description: "Con tapas plásticas transparentes para máxima durabilidad"
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            title: "Todo Uruguay",
            description: "Retirá en San José de Mayo o recibí en tu domicilio"
        }
    ];

    const steps = [
        {
            number: "1",
            title: "Envianos tu PDF",
            description: "Por WhatsApp, contanos cuántas páginas tiene y qué necesitás"
        },
        {
            number: "2",
            title: "Recibí tu cotización",
            description: "Te respondemos rápido con el precio y tiempo de entrega"
        },
        {
            number: "3",
            title: "Listo para imprimir",
            description: "Retirá en nuestro taller o te lo enviamos a tu domicilio"
        }
    ];

    const services = [
        {
            title: "Fotocopiado",
            description: "Copias rápidas de tus documentos en el momento",
            highlight: "Servicio express",
            icon: "📠"
        },
        {
            title: "Impresión Blanco y Negro",
            description: "Ideal para documentos de texto, apuntes y resúmenes",
            highlight: "Los mejores precios",
            icon: "📄"
        },
        {
            title: "Impresión a Color",
            description: "Perfecta para presentaciones, gráficos e imágenes",
            highlight: "Calidad profesional",
            icon: "🎨"
        },
        {
            title: "Encuadernado Espiral",
            description: "Con tapas plásticas para mayor durabilidad y presentación",
            highlight: "Terminación premium",
            icon: "📚"
        },
        {
            title: "Hojas Sueltas",
            description: "Impresión simple sin encuadernación o engrapadas",
            highlight: "Económico y rápido",
            icon: "📋"
        }
    ];

    const faqs = [
        {
            question: "¿Qué formatos de archivo aceptan?",
            answer: "Trabajamos exclusivamente con archivos PDF para garantizar la mejor calidad de impresión."
        },
        {
            question: "¿Cuánto demora el pedido?",
            answer: "El tiempo de entrega se coordina según la disponibilidad y volumen del pedido. Te informamos al cotizar."
        },
        {
            question: "¿Hacen envíos a todo el país?",
            answer: "Sí, realizamos envíos a todo Uruguay. También podés retirar en nuestro taller en San José de Mayo."
        },
        {
            question: "¿Tienen local comercial?",
            answer: "Trabajamos desde nuestro taller en San José de Mayo (Calle Ramón Massini 136). Podés retirar tu pedido coordinando previamente."
        },
        {
            question: "¿Cuál es el mínimo de páginas?",
            answer: "No hay mínimo. Imprimimos desde 1 página hasta el volumen que necesites."
        }
    ];

    return (
        <>
            <SeoMeta
                title={pageTitle}
                description={pageDescription}
                url={canonicalUrl}
                image="/og-imprimeya.jpg"
                keywords="fotocopias san jose de mayo, imprimir pdf uruguay, fotocopiadora san jose, impresion documentos, encuadernación espiral, imprimir tesis, fotocopiado barato, kamaluso imprimeya"
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
                    <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-500/20 to-transparent"></div>

                    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 pb-32 md:pb-40">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                                    <span className="animate-pulse w-2 h-2 bg-green-400 rounded-full"></span>
                                    <span className="text-sm font-medium">Servicio disponible</span>
                                </div>

                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                                    Fotocopias e <br />
                                    Impresiones PDF
                                    <span className="block text-blue-200 text-3xl md:text-4xl mt-2">En San José y todo Uruguay</span>
                                </h1>

                                <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
                                    <strong>El mejor precio</strong> en impresiones blanco y negro, color y encuadernados. Envianos tu archivo y retirá pronto.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <a
                                        href={whatsappLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                                        </svg>
                                        Cotizá por WhatsApp
                                    </a>
                                    <a
                                        href="#como-funciona"
                                        className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold py-4 px-8 rounded-xl border border-white/20 transition-all duration-300"
                                    >
                                        ¿Cómo funciona?
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </a>
                                </div>
                            </div>

                            <div className="hidden md:block relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/50 to-transparent rounded-3xl"></div>
                                <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                                    <div className="space-y-4">
                                        {features.map((feature, index) => (
                                            <div key={index} className="flex items-start gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                                <div className="flex-shrink-0 p-2 bg-blue-500/20 rounded-lg text-blue-200">
                                                    {feature.icon}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                                                    <p className="text-blue-200 text-sm">{feature.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Wave separator - pointer-events-none para no bloquear clics */}
                    <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
                        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
                        </svg>
                    </div>
                </section>

                {/* Cómo Funciona */}
                <section id="como-funciona" className="py-16 md:py-24 bg-white">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                ¿Cómo funciona?
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                En 3 simples pasos tenés tu documento impreso
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {steps.map((step, index) => (
                                <div key={index} className="relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500"></div>
                                    <div className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold mb-6 shadow-lg">
                                            {step.number}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                                        <p className="text-gray-600">{step.description}</p>
                                    </div>

                                    {/* Arrow connector */}
                                    {index < 2 && (
                                        <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                                            <svg className="w-8 h-8 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Servicios */}
                <section className="py-16 md:py-24 bg-gray-50">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Nuestros Servicios
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Todo lo que necesitás para tus documentos impresos
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                            {services.map((service, index) => (
                                <div key={index} className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                                    <div className="text-4xl mb-4">{service.icon}</div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
                                    <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                                    <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                                        {service.highlight}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            ¿Listo para imprimir?
                        </h2>
                        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                            Envianos tu PDF por WhatsApp y te respondemos con una cotización personalizada en minutos.
                        </p>
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-10 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-lg"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                            </svg>
                            Solicitar Cotización
                        </a>

                        {/* Botones de compartir */}
                        <div className="mt-10 pt-8 border-t border-white/20">
                            <p className="text-blue-200 mb-4 text-sm">¿Conocés a alguien que necesite imprimir? Compartí este servicio:</p>
                            <div className="flex flex-wrap justify-center gap-3">
                                {/* Compartir en WhatsApp */}
                                <a
                                    href={`https://wa.me/?text=${encodeURIComponent('Mirá este servicio de impresión de documentos PDF en Uruguay 🖨️ https://www.papeleriapersonalizada.uy/imprimeya')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-green-500 backdrop-blur-sm text-white font-medium py-2 px-4 rounded-full border border-white/20 hover:border-green-500 transition-all duration-300"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                                    </svg>
                                    WhatsApp
                                </a>

                                {/* Compartir en Facebook */}
                                <a
                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://www.papeleriapersonalizada.uy/imprimeya')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-blue-500 backdrop-blur-sm text-white font-medium py-2 px-4 rounded-full border border-white/20 hover:border-blue-500 transition-all duration-300"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                    Facebook
                                </a>

                                {/* Copiar link */}
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText('https://www.papeleriapersonalizada.uy/imprimeya');
                                        alert('¡Link copiado!');
                                    }}
                                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium py-2 px-4 rounded-full border border-white/20 transition-all duration-300"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                    </svg>
                                    Copiar Link
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-16 md:py-24 bg-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Preguntas Frecuentes
                            </h2>
                            <p className="text-xl text-gray-600">
                                Todo lo que necesitás saber sobre el servicio
                            </p>
                        </div>

                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <details key={index} className="group bg-gray-50 rounded-xl overflow-hidden">
                                    <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-gray-900 hover:bg-gray-100 transition-colors">
                                        <span>{faq.question}</span>
                                        <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </summary>
                                    <div className="px-6 pb-6 text-gray-600">
                                        {faq.answer}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Ubicación */}
                <section className="py-16 md:py-24 bg-gray-50">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                    Fotocopiadora en San José de Mayo
                                </h2>
                                <p className="text-lg text-gray-600 mb-6">
                                    Ubicados en el centro de San José. Podés retirar tu pedido en nuestro taller coordinando previamente. <br />
                                    <strong>¿Estás en otro lado?</strong> También realizamos envíos a todo el interior de Uruguay por DAC o Correo.
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>Calle Ramón Massini 136, San José de Mayo</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <a href="https://wa.me/59898615074" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                                            098 615 074
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden shadow-xl">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3294.2466986578843!2d-56.721197399999994!3d-34.344198999999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95a1776af4b2cb17%3A0x7ae4e8824e44a149!2sKamaluso!5e0!3m2!1ses-419!2suy!4v1760242437229!5m2!1ses-419!2suy"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen={false}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Ubicación de Kamaluso - ImprimeYa"
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-12 bg-gray-900 text-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <p className="text-lg text-gray-300 mb-2">
                            ImprimeYa es un servicio de
                        </p>
                        <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-white hover:text-pink-400 transition-colors">
                            <Image src="/logo.webp" alt="Kamaluso Logo" width={40} height={40} className="w-auto h-10" unoptimized />
                            Kamaluso - Papelería Personalizada
                        </Link>
                    </div>
                </section>
            </main>
        </>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    return {
        props: {},
        revalidate: 86400,
    };
};

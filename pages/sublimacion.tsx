import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import connectDB from '../lib/mongoose';
import Product from '../models/Product';
import Category from '../models/Category';
import ProductCard, { Product as ProductType } from '../components/ProductCard';
import dynamic from 'next/dynamic';

const SublimationAccessModal = dynamic(() => import('../components/SublimationAccessModal'), {
    ssr: false,
});
import SeoMeta from '../components/SeoMeta';

interface SublimacionProps {
    products: ProductType[];
}

// Helper para detectar cookie
const hasWholesalerCookie = (): boolean => {
    if (typeof document === 'undefined') return false;
    return document.cookie.includes('kamaluso_wholesaler_access=true');
};

// FAQ data para Schema
const faqData = [
    {
        question: '¿Qué materiales ofrecen para sublimar?',
        answer: 'Ofrecemos agendas y libretas con tapas de Cartón Cristal 350 gr sublimable, tratadas con polímero premium para colores vibrantes. Los interiores ya vienen impresos, listos para anillar.',
    },
    {
        question: '¿Hacen envíos a todo Uruguay?',
        answer: 'Sí, enviamos a Montevideo, Canelones, Maldonado y todos los departamentos del país. Los envíos se realizan en un plazo de 3-5 días hábiles.',
    },
    {
        question: '¿Cuál es el tiempo de entrega?',
        answer: 'El tiempo de entrega es de 3 a 5 días hábiles para todo Uruguay. Para Montevideo, puede ser más rápido dependiendo de la disponibilidad.',
    },
    {
        question: '¿Tienen mínimo de compra?',
        answer: 'No, no tenemos mínimo de compra. Podés pedir desde 1 kit de tapas de cartón cristal 350 gr sublimable. Nuestros precios mayoristas aplican desde la primera unidad.',
    },
    {
        question: '¿A qué temperatura se subliman las tapas?',
        answer: 'Para nuestro cartón cristal 350 gr sublimable, recomendamos 170°C durante 120 segundos presión media. Consultá nuestra guía completa para evitar curvas o quemaduras.',
    },
];

export default function Sublimacion({ products }: SublimacionProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [hasAccess, setHasAccess] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    useEffect(() => {
        setHasAccess(hasWholesalerCookie());
    }, []);

    const handleUnlockSuccess = () => {
        setHasAccess(true);
        setModalOpen(false);
    };

    // Schema LocalBusiness
    const localBusinessSchema = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Kamaluso - Insumos Sublimación Uruguay',
        description: 'Proveedor mayorista de insumos para sublimación en Uruguay. Agendas, libretas y tapas sublimables.',
        url: 'https://www.papeleriapersonalizada.uy/sublimacion',
        areaServed: {
            '@type': 'Country',
            name: 'Uruguay',
        },
        address: {
            '@type': 'PostalAddress',
            addressCountry: 'UY',
        },
    };

    // Schema FAQPage
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqData.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };

    // Generar Schema de Productos unificado para mejorar rendimiento (evita múltiples scripts en el DOM)
    const productsSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: products.map((product, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
                '@type': 'Product',
                name: product.nombre,
                image: product.imagen || product.imageUrl || (product.images && product.images.length > 0 ? product.images[0] : undefined),
                description: product.descripcionBreve || product.descripcionExtensa || `${product.nombre} - Insumo para sublimación`,
                sku: product._id,
                brand: {
                    '@type': 'Brand',
                    name: 'Kamaluso',
                },
                offers: {
                    '@type': 'Offer',
                    priceCurrency: 'UYU',
                    price: product.precio || product.basePrice || 0,
                    availability: 'https://schema.org/InStock',
                    itemCondition: 'https://schema.org/NewCondition',
                    url: `https://www.papeleriapersonalizada.uy/productos/detail/${product.slug}`,
                },
            }
        }))
    };

    return (
        <>
            <SeoMeta
                title="Insumos Sublimación Uruguay | Tapas Cartón Cristal 350 gr Sublimable"
                description="Agendas y libretas para sublimar con interiores impresos y tapas de cartón cristal 350 gr sublimable. Precios mayoristas para talleres. Envíos a todo Uruguay."
                keywords="insumos sublimación uruguay, cartón cristal 350 gr sublimable, agendas para sublimar, tapas para agendas sublimación, mayorista papelería uruguay"
            />

            <Head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(productsSchema) }}
                />
            </Head>

            <main className="min-h-screen bg-white">
                {/* Hero Section Moderno */}
                <section
                    className="relative bg-orange-500 overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)' }}
                >
                    {/* Abstract Background Shapes */}
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 transform origin-bottom-left" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl filter mix-blend-overlay animate-pulse-slow" />

                    {/* Pattern */}
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                        }}
                    />

                    <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                            {/* Columna Texto */}
                            <div className="text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold tracking-wide uppercase text-xs mb-8 shadow-lg hover:bg-white/30 transition-all cursor-default">
                                    <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse"></span>
                                    Exclusivo Sublimadores
                                </div>

                                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-none tracking-tight drop-shadow-sm">
                                    Potenciá tu<br />
                                    <span className="text-slate-900 filter pb-2 block mt-2">
                                        Negocio
                                    </span>
                                </h1>

                                <p className="text-xl text-orange-50 mb-10 leading-relaxed font-medium max-w-xl mx-auto lg:mx-0 text-shadow-sm">
                                    Tapas de <strong>Cartón Cristal 350 gr Sublimable</strong> e interiores impresos listos para armar. Rentabilidad real del 150%.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                    {!hasAccess ? (
                                        <button
                                            onClick={() => setModalOpen(true)}
                                            className="group relative px-8 py-4 bg-slate-900 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                                        >
                                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                                            <span className="relative flex items-center gap-2">
                                                Desbloquear Precios
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                                </svg>
                                            </span>
                                        </button>
                                    ) : (
                                        <span className="px-8 py-4 bg-green-500 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-2 shadow-lg ring-4 ring-green-500/20">
                                            ✅ Acceso Activo
                                        </span>
                                    )}

                                    <Link
                                        href="/productos/papeleria-sublimable"
                                        className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-bold text-lg rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        Ver Catálogo
                                    </Link>
                                </div>
                            </div>

                            {/* Columna Visual 3D */}
                            <div className="hidden lg:block relative">
                                <div className="relative w-full aspect-square max-w-md mx-auto perspective-1000">
                                    {/* Card Flotante Principal */}
                                    <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/40 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] transform rotate-y-12 rotate-x-6 hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700 ease-out p-8 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                                                🔥
                                            </div>
                                            <div className="px-3 py-1 bg-green-500/20 text-green-100 rounded-full text-xs font-bold border border-green-500/30">
                                                +150% Rentabilidad
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="h-4 w-3/4 bg-white/20 rounded-full" />
                                            <div className="h-4 w-1/2 bg-white/20 rounded-full" />
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-white/10">
                                            <p className="text-white/80 font-medium text-sm">Tu Socio Estratégico</p>
                                            <p className="text-2xl font-bold text-white mt-1">Kamaluso B2B</p>
                                        </div>
                                    </div>

                                    {/* Elemento Decorativo Flotante */}
                                    <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl p-6 flex items-center justify-center transform -rotate-6 translate-z-10 animate-float-slow">
                                        <div className="text-center">
                                            <p className="text-orange-400 font-bold text-5xl mb-2">170°</p>
                                            <p className="text-slate-400 text-sm font-medium">Temperatura<br />Ideal</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* Estrategia de Negocio Section (ex-Esencia) */}
                <section className="px-4 md:px-8 py-20 bg-slate-50 text-slate-900">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                                ¿Por qué elegir Kamaluso como tu proveedor?
                            </h2>
                            <p className="text-lg text-slate-700">
                                Sabemos que tu negocio depende de la calidad y el margen.
                                Por eso creamos insumos pensados para que vendas más y mejor.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: '📈',
                                    title: 'Maximizá tu Rentabilidad',
                                    desc: 'Precios mayoristas reales que te permiten tener un excelente margen de ganancia en cada producto personalizado que vendes.'
                                },
                                {
                                    icon: '✨',
                                    title: 'Cartón Cristal 350 gr Sublimable',
                                    desc: 'Olvidate del cartón gris. Nuestras tapas son blancas, rígidas (350g) y con polímero de alta densidad para colores fotográficos.'
                                },
                                {
                                    icon: '🚀',
                                    title: 'Interiores Impresos Listos',
                                    desc: 'Ahorrá tiempo y dinero. Te entregamos los interiores de agenda ya impresos y compaginados. Vos solo sublimás y anillás.'
                                },
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                                >
                                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-orange-600 transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Products Section */}
                <section className="px-4 md:px-8 py-16">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <p className="text-sm font-semibold text-naranja uppercase tracking-widest mb-3">
                                Catálogo
                            </p>
                            <h2 className="text-3xl md:text-5xl font-bold text-textoPrimario">
                                Tu stock, siempre listo
                            </h2>
                        </div>

                        {products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                {products.map((product) => {
                                    // Aseguramos que el título mencione que es sublimable para SEO y claridad
                                    const displayTitle = product.nombre.toLowerCase().includes('sublimable')
                                        ? product.nombre
                                        : `${product.nombre} - Sublimable`;

                                    return (
                                        <ProductCard
                                            key={product._id}
                                            product={{ ...product, nombre: displayTitle }}
                                        />
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-textoSecundario">
                                <p className="text-lg mb-4">Próximamente agregaremos productos a esta categoría.</p>
                                <p>¿Tenés algún producto en mente? Contactanos!</p>
                            </div>
                        )}

                        {products.length > 0 && (
                            <div className="text-center mt-10">
                                <Link
                                    href="/productos/papeleria-sublimable"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-naranja to-amarillo text-white font-bold rounded-xl hover:shadow-kamalusoWarmXl hover:-translate-y-1 transition-all duration-300"
                                >
                                    Ver todo el catálogo
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </Link>
                            </div>
                        )}
                    </div>
                </section>

                {/* Shipping Section */}
                <section className="px-4 md:px-8 py-16 bg-fondoClaro">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-2xl md:text-4xl font-bold text-textoPrimario text-center mb-12">
                            🚚 Logística pensada para revendedores
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
                            {[
                                { icon: '📍', title: 'Todo UY', desc: '19 departamentos' },
                                { icon: '⏱️', title: '3-5 días', desc: 'hábiles' },
                                { icon: '💳', title: 'Pago seguro', desc: 'múltiples medios' },
                                { icon: '📦', title: 'Sin mínimo', desc: 'desde 1 unidad' },
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white p-6 rounded-xl text-center shadow-kamalusoSoft"
                                >
                                    <span className="text-3xl block mb-2">{item.icon}</span>
                                    <h3 className="font-bold text-textoPrimario">{item.title}</h3>
                                    <p className="text-sm text-textoSecundario">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <p className="text-center text-textoSecundario">
                            Envíos a Montevideo, Canelones, Maldonado y todos los departamentos del país.
                        </p>
                    </div>
                </section>

                {/* Guide Section */}
                <section className="px-4 md:px-8 py-16">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-1">
                                <span className="text-3xl mb-3 block">📖</span>
                                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                                    Perfeccioná tu técnica
                                </h2>
                                <p className="text-slate-300 mb-6">
                                    Accedé a nuestra guía profesional con parámetros exactos de temperatura y tiempos para evitar desperdicios y asegurar el mejor acabado.
                                </p>
                                <Link
                                    href="/blog/guia-completa-sublimacion-agendas"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 font-bold rounded-lg hover:bg-slate-100 transition"
                                >
                                    Leer guía
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </Link>
                            </div>
                            <div className="flex-shrink-0">
                                <div className="w-32 h-32 bg-gradient-to-br from-naranja to-amarillo rounded-2xl flex items-center justify-center text-6xl">
                                    🔥
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="px-4 md:px-8 py-16 bg-fondoClaro">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl md:text-4xl font-bold text-textoPrimario text-center mb-12">
                            ❓ Preguntas Frecuentes
                        </h2>

                        <div className="space-y-4">
                            {faqData.map((faq, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white rounded-xl overflow-hidden shadow-kamalusoSoft"
                                >
                                    <button
                                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                        className="w-full px-6 py-4 text-left flex items-center justify-between font-medium text-textoPrimario hover:bg-fondoClaro transition"
                                    >
                                        <span>{faq.question}</span>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            stroke="currentColor"
                                            className={`w-5 h-5 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                        </svg>
                                    </button>
                                    {openFaq === idx && (
                                        <div className="px-6 pb-4 text-textoSecundario">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Final Section */}
                <section className="px-4 md:px-8 py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                            Impulsá tu taller de Sublimación
                        </h2>
                        <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">
                            Unite a los cientos de emprendedores que eligen Kamaluso para diferenciar sus productos.
                            Precios mayoristas reales, sin mínimos absurdos.
                        </p>

                        {!hasAccess ? (
                            <button
                                onClick={() => setModalOpen(true)}
                                className="px-10 py-5 bg-gradient-to-r from-naranja to-amarillo text-white font-bold text-lg rounded-xl hover:shadow-kamalusoWarmXl hover:-translate-y-1 transition-all duration-300"
                            >
                                Hacé crecer tu negocio hoy
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <span className="inline-block px-10 py-5 bg-green-500/20 text-green-400 font-bold text-lg rounded-xl">
                                    ✅ Ya tenés acceso mayorista
                                </span>
                                <br />
                                <Link
                                    href="/productos/papeleria-sublimable"
                                    className="inline-flex items-center gap-2 text-white hover:text-naranja transition"
                                >
                                    Ir al catálogo →
                                </Link>
                            </div>
                        )}

                        <p className="text-slate-500 text-sm mt-6">
                            Al registrarte, accedés inmediatamente a todos los precios mayoristas.
                        </p>
                    </div>
                </section>
            </main>

            {/* Modal */}
            <SublimationAccessModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={handleUnlockSuccess}
            />
        </>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    await connectDB();

    // Buscar categoría de sublimación
    const sublimationCategory = await Category.findOne({ slug: 'papeleria-sublimable' }).lean();

    let products: ProductType[] = [];

    if (sublimationCategory) {
        // Buscar productos de la categoría
        const productsData = await Product.find({
            categoria: 'papeleria-sublimable',
            status: 'activo',
        })
            .sort({ order: 1, createdAt: -1 })
            .limit(8)
            .lean();

        products = JSON.parse(JSON.stringify(productsData));
    }

    return {
        props: {
            products,
        },
        revalidate: 3600, // 1 hora
    };
};

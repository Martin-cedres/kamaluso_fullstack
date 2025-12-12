import { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import React, { useRef, useState } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import EventPageLayout from '../../components/EventPageLayout';
import EventFAQ from '../../components/EventFAQ';
import ProductCard from '../../components/ProductCard';
import { ShieldCheckIcon, TruckIcon, SparklesIcon } from '@heroicons/react/24/solid';

interface Product {
    _id: string;
    nombre: string;
    slug: string;
    imageUrl?: string;
    alt?: string;
    basePrice?: number;
    categoria?: string;
    descripcion?: string;
    averageRating?: number;
    numReviews?: number;
    descripcionBreve?: string;
    descripcionExtensa?: string;
    puntosClave?: string[];
}

interface EventPage {
    title: string;
    slug: string;
    eventType: string;
    content: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    selectedProducts: Product[];
}

interface Props {
    eventPage: EventPage | null;
}

export default function EventLandingPage({ eventPage }: Props) {
    const carouselRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);

    const scrollCarousel = (direction: 'left' | 'right') => {
        if (carouselRef.current) {
            const scrollAmount = 280; // Ajustado para tarjetas más pequeñas
            carouselRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Auto-scroll del carrusel cada 3 segundos (se pausa al hover)
    React.useEffect(() => {
        if (isPaused) return; // Pausar si el usuario está interactuando

        const interval = setInterval(() => {
            if (carouselRef.current) {
                const container = carouselRef.current;
                const maxScroll = container.scrollWidth - container.clientWidth;

                // Si llegamos al final, volver al inicio
                if (container.scrollLeft >= maxScroll - 10) {
                    container.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    // Continuar scrolling
                    scrollCarousel('right');
                }
            }
        }, 3000); // Cada 3 segundos

        return () => clearInterval(interval);
    }, [isPaused]); // Reiniciar cuando cambie isPaused

    if (!eventPage) {
        return (
            <EventPageLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <h1 className="text-2xl font-bold text-gray-600">Página no encontrada</h1>
                </div>
            </EventPageLayout>
        );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://papeleriapersonalizada.uy';
    const pageUrl = `${baseUrl}/eventos/${eventPage.slug}`;

    // Calcular precio mínimo para sticky mobile
    const minPrice = eventPage.selectedProducts.length > 0
        ? Math.min(...eventPage.selectedProducts.map(p => p.basePrice || 0))
        : 0;
    const pageTitle = eventPage.seoTitle || eventPage.title;
    const pageDescription = eventPage.seoDescription || `Descubrí los mejores regalos personalizados para ${eventPage.eventType} en Uruguay.`;

    // Schema.org structured data
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: pageTitle,
        description: pageDescription,
        url: pageUrl,
        mainEntity: {
            '@type': 'ItemList',
            itemListElement: eventPage.selectedProducts.map((product, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                    '@type': 'Product',
                    name: product.nombre,
                    description: product.descripcion || product.nombre,
                    image: product.imageUrl,
                    offers: {
                        '@type': 'Offer',
                        price: product.basePrice,
                        priceCurrency: 'UYU',
                        availability: 'https://schema.org/InStock',
                    },
                },
            })),
        },
    };

    return (
        <>
            <Head>
                {/* Primary Meta Tags */}
                <title>{pageTitle}</title>
                <meta name="title" content={pageTitle} />
                <meta name="description" content={pageDescription} />
                {eventPage.seoKeywords && <meta name="keywords" content={eventPage.seoKeywords} />}

                {/* Canonical URL */}
                <link rel="canonical" href={pageUrl} />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content={pageUrl} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content={`${baseUrl}/og-event.jpg`} />
                <meta property="og:site_name" content="Papelería Personalizada Uruguay" />
                <meta property="og:locale" content="es_UY" />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content={pageUrl} />
                <meta property="twitter:title" content={pageTitle} />
                <meta property="twitter:description" content={pageDescription} />
                <meta property="twitter:image" content={`${baseUrl}/og-event.jpg`} />

                {/* Schema.org JSON-LD */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />
            </Head>

            <EventPageLayout>
                {/* Hero Section - COMPACTO CON CTA */}
                <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">
                            {eventPage.title}
                        </h1>
                        <p className="text-lg md:text-xl text-purple-50 max-w-2xl mx-auto mb-6">
                            {pageDescription}
                        </p>
                        {/* CTAs en Hero - COPY MEJORADO */}
                        <div className="flex gap-4 justify-center flex-wrap">
                            <a
                                href="#productos"
                                className="bg-white text-purple-600 px-8 py-4 rounded-lg font-bold hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
                            >
                                <span>🎁 Ver Regalos Únicos</span>
                            </a>
                            <a
                                href={`https://wa.me/59898615074?text=Hola! Vi los productos de ${eventPage.eventType} y quiero consultar`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-purple-600 transition-all flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                                </svg>
                                <span>Asesoría Gratis</span>
                            </a>
                        </div>
                    </div>
                </section>

                {/* Trust Signals - IGUALES AL HOME */}
                <section className="bg-purple-50 py-6 px-4 border-y border-purple-100">
                    <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-x-8 gap-y-4 text-sm text-gray-700 font-medium">
                        <div className="flex items-center gap-2">
                            <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                            <span>Compra 100% Segura</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <TruckIcon className="w-5 h-5 text-blue-600" />
                            <span>Envíos a todo Uruguay</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <SparklesIcon className="w-5 h-5 text-yellow-500" />
                            <span>Calidad Garantizada</span>
                        </div>
                    </div>
                </section>

                {/* Products Carousel - PRODUCTOS DEL EVENTO CON FORMATO DEL HOME */}
                {eventPage.selectedProducts && eventPage.selectedProducts.length > 0 && (
                    <section id="productos" className="bg-white py-12 px-4 scroll-mt-20">
                        <div className="max-w-7xl mx-auto">
                            <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
                                🎁 Regalos Perfectos para {eventPage.eventType}
                            </h2>
                            <p className="text-center text-gray-600 mb-10 text-lg">
                                Elegí entre {eventPage.selectedProducts.length} opciones únicas y personalizables
                            </p>

                            {/* Carrusel con ProductCard - Formato del Home */}
                            <div className="relative px-4 sm:px-8">
                                {/* Botón Anterior */}
                                {eventPage.selectedProducts.length > 3 && (
                                    <>
                                        <button
                                            onClick={() => scrollCarousel('left')}
                                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-xl rounded-full p-3 hover:bg-gray-50 transition-all hidden md:block"
                                            aria-label="Anterior"
                                        >
                                            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        {/* Botón Siguiente */}
                                        <button
                                            onClick={() => scrollCarousel('right')}
                                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-xl rounded-full p-3 hover:bg-gray-50 transition-all hidden md:block"
                                            aria-label="Siguiente"
                                        >
                                            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </>
                                )}

                                {/* Scroll Container */}
                                <div
                                    ref={carouselRef}
                                    onMouseEnter={() => setIsPaused(true)}
                                    onMouseLeave={() => setIsPaused(false)}
                                    className="flex gap-6 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory scrollbar-hide"
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                >
                                    {eventPage.selectedProducts.map((product) => (
                                        <div key={product._id} className="flex-shrink-0 w-[220px] sm:w-[260px] snap-start">
                                            <ProductCard product={{
                                                _id: product._id,
                                                nombre: product.nombre,
                                                precio: product.basePrice,
                                                imagen: product.imageUrl || '/placeholder.png',
                                                alt: product.alt || product.nombre,
                                                slug: product.slug || '',
                                                categoria: product.categoria || '',
                                                averageRating: product.averageRating,
                                                numReviews: product.numReviews,
                                                descripcionBreve: product.descripcionBreve,
                                                descripcionExtensa: product.descripcionExtensa,
                                                puntosClave: product.puntosClave,
                                            }} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CSS para ocultar scrollbar */}
                            <style jsx>{`
                                .scrollbar-hide::-webkit-scrollbar {
                                    display: none;
                                }
                            `}</style>
                        </div>
                    </section>
                )}

                {/* Main Content - BREVE Y COMPLEMENTARIO */}
                <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-50">
                    <div
                        className="prose lg:prose-lg max-w-none
            prose-headings:text-gray-900 prose-h2:text-purple-600 prose-h2:text-2xl prose-h2:mb-4
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-strong:text-purple-600 prose-strong:font-semibold
            prose-ul:my-6 prose-li:text-gray-700 prose-li:marker:text-purple-500"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(eventPage.content) }}
                    />
                </article>

                {/* Garantía - REDUCE FRICCIÓN */}
                <div className="max-w-4xl mx-auto px-4 mb-12">
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                            <svg className="w-12 h-12 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <div>
                                <h4 className="font-bold text-lg text-gray-900 mb-2">
                                    Garantía de Satisfacción 100%
                                </h4>
                                <p className="text-gray-700">
                                    Si tu regalo no supera tus expectativas, te devolvemos tu dinero.
                                    Sin preguntas. Así de simple.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Dinámico - Reduce objeciones */}
                <EventFAQ eventType={eventPage.eventType} />

                {/* CTA Section */}
                <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-4">🎁 ¿Listo para crear tu regalo único?</h2>
                        <p className="text-xl mb-8 text-purple-50">
                            Explorá toda nuestra colección personalizable
                        </p>
                        <Link
                            href="/productos"
                            className="inline-block bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105"
                        >
                            ✨ Ver Toda la Colección
                        </Link>
                    </div>
                </section>

                {/* Sticky CTA Mobile - CON PRECIO */}
                <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 p-4 md:hidden z-50 shadow-2xl">
                    <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
                        {/* Precio desde */}
                        <div className="text-white">
                            <p className="text-xs opacity-90">Desde</p>
                            <p className="text-2xl font-bold">${minPrice}</p>
                        </div>

                        {/* CTAs */}
                        <div className="flex gap-2 flex-1">
                            <a
                                href="#productos"
                                className="flex-1 bg-white text-purple-600 py-3 px-4 rounded-lg font-bold text-center text-sm shadow-lg"
                            >
                                🎁 Elegir Regalo
                            </a>
                            <a
                                href={`https://wa.me/59898615074?text=Hola! Vi ${eventPage.eventType} y quiero consultar`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-green-500 text-white p-3 rounded-lg shadow-lg flex items-center justify-center"
                                aria-label="Contactar por WhatsApp"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </EventPageLayout>
        </>
    );
}

export const getStaticPaths: GetStaticPaths = async () => {
    return { paths: [], fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async (context) => {
    const { slug } = context.params || ({} as { slug?: string });
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    if (!slug || typeof slug !== 'string') {
        return { notFound: true };
    }

    try {
        const res = await fetch(`${baseUrl}/api/eventos/${slug}`);
        if (!res.ok) {
            return { notFound: true, revalidate: 300 };
        }
        const eventPage = await res.json();

        return {
            props: { eventPage },
            revalidate: 3600, // Revalidate every hour
        };
    } catch (error) {
        console.error('Error fetching event page:', error);
        return { notFound: true, revalidate: 300 };
    }
};

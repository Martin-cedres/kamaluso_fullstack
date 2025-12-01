import { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import EventPageLayout from '../../components/EventPageLayout';
import ProductCard from '../../components/ProductCard';

interface Product {
    _id: string;
    nombre: string;
    slug: string;
    imageUrl?: string;
    alt?: string;
    basePrice?: number;
    categoria?: string;
    descripcion?: string;
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
                {/* Hero Section */}
                <section className="bg-gradient-to-r from-purple-900 to-pink-800 text-white py-16 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                            {eventPage.title}
                        </h1>
                        <p className="text-xl md:text-2xl text-purple-100 max-w-2xl mx-auto">
                            {pageDescription}
                        </p>
                    </div>
                </section>

                {/* Main Content */}
                <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div
                        className="prose lg:prose-xl max-w-none
            prose-headings:text-gray-900 prose-h2:text-purple-600 prose-h3:text-pink-600
            prose-a:text-blue-600 prose-a:no-underline prose-a:border-b-2 prose-a:border-blue-200 hover:prose-a:border-blue-600 transition-all
            prose-strong:text-purple-600 prose-strong:font-bold
            prose-li:marker:text-purple-500"
                        dangerouslySetInnerHTML={{
                            __html: (() => {
                                let content = eventPage.content;
                                const regex = /{{PRODUCT_CARD:([a-zA-Z0-9-]+)}}/g;

                                content = content.replace(regex, (match, slug) => {
                                    const product = eventPage.selectedProducts?.find((p: Product) => p.slug === slug);

                                    if (!product) return '';

                                    const imageUrl = product.imageUrl || '';
                                    const productUrl = `/productos/${product.slug}`;

                                    return `
                    <div class="not-prose my-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg border border-purple-100">
                      <div class="flex flex-col md:flex-row gap-6 items-center">
                        <div class="w-full md:w-1/3">
                          <img src="${imageUrl}" alt="${product.alt || product.nombre}" class="rounded-xl shadow-md w-full object-cover" />
                        </div>
                        <div class="flex-1">
                          <h4 class="text-2xl font-bold text-gray-900 mb-2">${product.nombre}</h4>
                          <p class="text-gray-600 mb-4">${product.descripcion?.substring(0, 150) || ''}...</p>
                          <div class="flex items-center gap-4">
                            <span class="text-3xl font-bold text-purple-600">$${product.basePrice}</span>
                            <a href="${productUrl}" class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105">
                              Ver Detalles
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  `;
                                });

                                return content;
                            })()
                        }}
                    />
                </article>

                {/* Products Grid */}
                {eventPage.selectedProducts && eventPage.selectedProducts.length > 0 && (
                    <section className="bg-gray-50 py-16 px-4">
                        <div className="max-w-7xl mx-auto">
                            <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
                                Nuestros Productos Recomendados
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {eventPage.selectedProducts.map((product) => (
                                    <ProductCard
                                        key={product._id}
                                        product={{
                                            _id: product._id,
                                            nombre: product.nombre,
                                            precio: product.basePrice || 0,
                                            imagen: product.imageUrl || '/placeholder.png',
                                            alt: product.alt || product.nombre,
                                            slug: product.slug || '',
                                            categoria: product.categoria || 'General',
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* CTA Section */}
                <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-4">¿Listo para encontrar el regalo perfecto?</h2>
                        <p className="text-xl mb-8 text-purple-100">
                            Explorá nuestra colección completa de productos personalizados
                        </p>
                        <Link
                            href="/productos"
                            className="inline-block bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105"
                        >
                            Ver Todos los Productos
                        </Link>
                    </div>
                </section>
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

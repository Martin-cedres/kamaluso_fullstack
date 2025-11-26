import { GetStaticProps } from 'next';
import Head from 'next/head';
import SeoMeta from '../components/SeoMeta';
import RealResultCard from '../components/RealResultCard';
import dbConnect from '../lib/mongoose';
import RealResult from '../models/RealResult';
import { StarIcon } from '@heroicons/react/24/solid';

interface RealResultItem {
    _id: string;
    title: string;
    description?: string;
    mockupImage: string;
    realImage: string;
    date: string;
}

interface GalleryPageProps {
    results: RealResultItem[];
}

export default function RealResultsGalleryPage({ results }: GalleryPageProps) {
    // Schema.org Data for CreativeWork/Review
    const schemaData = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Nuestros Trabajos Entregados - Expectativa vs Realidad',
        description: 'Galería de trabajos reales entregados por Kamaluso. Compara el diseño digital con el resultado final.',
        url: 'https://www.papeleriapersonalizada.uy/nuestros-trabajos-entregados',
        mainEntity: results.map((result) => ({
            '@type': 'CreativeWork',
            name: result.title,
            image: result.realImage,
            description: result.description || `Comparación de diseño y resultado final para ${result.title}`,
            dateCreated: result.date,
            author: {
                '@type': 'Organization',
                name: 'Kamaluso Papelería',
            },
        })),
    };

    return (
        <>
            <SeoMeta
                title="Nuestros Trabajos Entregados | Expectativa vs Realidad | Kamaluso"
                description="Mira nuestra galería de trabajos terminados. Compara el diseño digital con la foto real del producto entregado. Calidad garantizada en cada detalle."
            />
            <Head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
                    key="gallery-jsonld"
                />
            </Head>

            <main className="min-h-screen bg-gray-50 py-12 md:py-20">
                <div className="max-w-7xl mx-auto px-6">

                    {/* Header Section */}
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
                        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-pink-100 mb-4">
                            <div className="flex gap-0.5">
                                <StarIcon className="w-5 h-5 text-amarillo" />
                                <StarIcon className="w-5 h-5 text-amarillo" />
                                <StarIcon className="w-5 h-5 text-amarillo" />
                                <StarIcon className="w-5 h-5 text-amarillo" />
                                <StarIcon className="w-5 h-5 text-amarillo" />
                            </div>
                            <span className="text-sm font-medium text-gray-600">Calidad que se ve y se toca</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 font-heading leading-tight">
                            Trabajos <span className="text-transparent bg-clip-text bg-gradient-to-r from-rosa to-moradoClaro">entregados</span>
                        </h1>

                        <p className="text-lg text-gray-600 leading-relaxed">
                            En Papelería Personalizada Kamaluso, lo que ves es lo que obtienes (¡o mejor!).
                            Explora nuestra galería de proyectos reales y comprueba la fidelidad entre el diseño digital y el producto final que llega a tus manos.
                        </p>
                    </div>

                    {/* Gallery Grid */}
                    {results.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                            {results.map((result) => (
                                <RealResultCard
                                    key={result._id}
                                    title={result.title}
                                    description={result.description}
                                    mockupImage={result.mockupImage}
                                    realImage={result.realImage}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                            <p className="text-xl text-gray-400">Aún no hemos subido trabajos a la galería. ¡Pronto verás novedades!</p>
                        </div>
                    )}

                </div>
            </main>
        </>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    await dbConnect();

    try {
        const resultsData = await RealResult.find({ active: true }).sort({ date: -1 }).lean();

        // Serialize for Next.js (convert Date/ObjectId to strings)
        const results = JSON.parse(JSON.stringify(resultsData));

        return {
            props: {
                results,
            },
            revalidate: 3600, // Revalidate every hour
        };
    } catch (error) {
        console.error('Error fetching real results:', error);
        return {
            props: {
                results: [],
            },
            revalidate: 60,
        };
    }
};

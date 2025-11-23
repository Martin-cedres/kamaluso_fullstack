import { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import connectDB from '../../lib/mongoose';
import PillarPage, { IPillarPage } from '../../models/PillarPage';
import Post from '../../models/Post';
import Product from '../../models/Product';
import SeoMeta from '../../components/SeoMeta';

interface Props {
    pillarPage: IPillarPage | null;
}

export default function PillarPageDetail({ pillarPage }: Props) {
    if (!pillarPage) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-2xl font-bold text-gray-600">Página no encontrada</h1>
            </div>
        );
    }

    return (
        <>
            <SeoMeta
                title={pillarPage.seoTitle || pillarPage.title}
                description={pillarPage.seoDescription || `Guía completa sobre ${pillarPage.topic}`}
                url={`/pillar/${pillarPage.slug}`}
            />

            <main className="min-h-screen bg-white font-sans text-gray-900">
                {/* Hero Section */}
                <header className="bg-gradient-to-r from-purple-900 to-pink-800 text-white py-20 px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <span className="inline-block px-4 py-1 bg-white/20 rounded-full text-sm font-semibold mb-4 tracking-wide uppercase">
                            Guía Definitiva: {pillarPage.topic}
                        </span>
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
                            {pillarPage.title}
                        </h1>
                        <p className="text-xl md:text-2xl text-purple-100 max-w-2xl mx-auto leading-relaxed">
                            {pillarPage.seoDescription}
                        </p>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Main Content Column */}
                    <article className="lg:col-span-8 prose prose-lg prose-pink max-w-none">
                        {/* Render HTML Content safely */}
                        <div dangerouslySetInnerHTML={{ __html: pillarPage.content }} />
                    </article>
                    {/* Sidebar / Cluster Navigation */}
                    <aside className="lg:col-span-4 space-y-8">

                        {/* Cluster Products */}
                        {pillarPage.clusterProducts && pillarPage.clusterProducts.length > 0 && (
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    🛍️ Productos Recomendados
                                </h3>
                                <div className="space-y-4">
                                    {pillarPage.clusterProducts.map((product: any) => (
                                        <Link key={product._id} href={`/productos/detail/${product.slug}`} className="block group">
                                            <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-pink-300 hover:-translate-y-1">
                                                {(product.imageUrl || (product.images && product.images.length > 0)) ? (
                                                    <img
                                                        src={product.imageUrl || product.images[0]}
                                                        alt={product.nombre}
                                                        className="w-24 h-24 object-cover rounded-md border border-gray-100 shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                                                        📷
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-pink-600 transition line-clamp-2">
                                                        {product.nombre}
                                                    </h4>
                                                    <span className="text-sm text-pink-500 font-bold mt-2 inline-flex items-center gap-1">
                                                        Ver Producto
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                            <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                                                        </svg>
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Cluster Posts */}
                        {pillarPage.clusterPosts && pillarPage.clusterPosts.length > 0 && (
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    📚 Artículos Relacionados
                                </h3>
                                <ul className="space-y-3">
                                    {pillarPage.clusterPosts.map((post: any) => (
                                        <li key={post._id}>
                                            <Link href={`/blog/${post.slug}`} className="block p-3 hover:bg-purple-50 rounded-lg transition group">
                                                <h4 className="font-medium text-gray-700 group-hover:text-purple-700">
                                                    {post.title}
                                                </h4>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                    </aside>
                </div >
            </main >
        </>
    );
}

export const getStaticPaths: GetStaticPaths = async () => {
    await connectDB();
    const pages = await PillarPage.find({ status: 'published' }, 'slug');

    const paths = pages.map((page) => ({
        params: { slug: page.slug },
    }));

    return {
        paths,
        fallback: 'blocking', // Generar nuevas páginas bajo demanda
    };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
    try {
        await connectDB();
        const { slug } = params as { slug: string };

        // Buscar la página y poblar las relaciones
        const page = await PillarPage.findOne({ slug, status: 'published' })
            .populate('clusterPosts', 'title slug coverImage excerpt')
            .populate('clusterProducts', 'nombre slug imageUrl images basePrice')
            .lean();

        if (!page) {
            return {
                notFound: true,
            };
        }

        return {
            props: {
                pillarPage: JSON.parse(JSON.stringify(page)),
            },
            revalidate: 60, // Revalidar cada minuto si es necesario
        };
    } catch (error) {
        console.error('Error fetching pillar page:', error);
        return {
            notFound: true,
        };
    }
};

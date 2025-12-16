import Link from 'next/link';
import SeoMeta from './SeoMeta';

interface ContentItem {
    _id: string;
    title: string;
    subtitle?: string;
    slug: string;
    excerpt?: string;
    topic?: string;
    createdAt: string;
    tags?: string[];
    type: 'post' | 'pillar';
}

interface BlogPageProps {
    content: ContentItem[];
    currentPage: number;
    totalPages: number;
}

export default function BlogPageLayout({ content, currentPage, totalPages }: BlogPageProps) {
    return (
        <>
            <SeoMeta
                title={`Blog ${currentPage > 1 ? `(Página ${currentPage})` : ''} | Kamaluso Papelería`}
                description="Artículos, guías completas y noticias sobre papelería personalizada, regalos empresariales y más."
                url={currentPage > 1 ? `/blog/page/${currentPage}` : '/blog'}
            />

            <main className="min-h-screen bg-gray-50 px-6 py-12">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-center mb-4 text-gray-900">
                        Nuestro Blog
                    </h1>
                    <p className="text-center text-gray-600 mb-10">
                        Guías completas y artículos expertos sobre papelería personalizada
                    </p>

                    <div className="space-y-8">
                        {content.map((item) => (
                            <div
                                key={item._id}
                                className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow"
                            >
                                {item.type === 'pillar' && (
                                    <span className="inline-block mb-3 px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-full">
                                        📌 GUÍA COMPLETA
                                    </span>
                                )}
                                <h2 className="text-2xl font-bold mb-2 text-gray-900">
                                    <Link
                                        href={item.type === 'pillar' ? `/pillar/${item.slug}` : `/blog/${item.slug}`}
                                        className="hover:text-pink-500 transition"
                                    >
                                        {item.title}
                                    </Link>
                                </h2>
                                {item.excerpt && (
                                    <p className="text-gray-600 mb-4 line-clamp-3">{item.excerpt}</p>
                                )}
                                <div className="flex items-center justify-between">
                                    <Link
                                        href={item.type === 'pillar' ? `/pillar/${item.slug}` : `/blog/${item.slug}`}
                                        className="font-semibold text-pink-500 hover:underline"
                                    >
                                        Leer más →
                                    </Link>
                                    <span className="text-sm text-gray-400">
                                        {new Date(item.createdAt).toLocaleDateString('es-UY', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    <div className="mt-12 flex justify-center items-center space-x-4">
                        {currentPage > 1 && (
                            <Link href={currentPage === 2 ? '/blog' : `/blog/page/${currentPage - 1}`} className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Anterior
                            </Link>
                        )}
                        {totalPages > 1 && (
                            <span className="text-sm text-gray-500">
                                Página {currentPage} de {totalPages}
                            </span>
                        )}
                        {currentPage < totalPages && (
                            <Link href={`/blog/page/${currentPage + 1}`} className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Siguiente
                            </Link>
                        )}
                    </div>
                </div>
            </main>
        </>
    )
}

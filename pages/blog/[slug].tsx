import { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import SeoMeta from '../../components/SeoMeta';
import ProductCard from '../../components/ProductCard'; // Importar ProductCard

// --- Interfaces para el contenido ---

interface PostStub {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
}

interface ProductStub {
  _id: string;
  nombre: string;
  slug: string;
  imageUrl?: string;
  alt?: string;
  basePrice?: number;
  categoria?: string;
}

// Interfaz para un Post completo
interface Post {
  type: 'post';
  _id: string;
  title: string;
  subtitle?: string;
  slug: string;
  content: string;
  excerpt?: string;
  createdAt: string;
  tags?: string[];
  coverImage?: string;
}

// Interfaz para una Pillar Page completa
interface PillarPage {
  type: 'pillar';
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  createdAt: string;
  coverImage?: string;
  clusterPosts: PostStub[];
  clusterProducts: ProductStub[];
}

type Content = Post | PillarPage;

interface Props {
  content: Content | null;
}

// --- Componente Principal ---

export default function ContentPage({ content }: Props) {
  if (!content) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-xl">Contenido no encontrado.</p>
      </main>
    );
  }

  const pageTitle = `${content.title} | Blog de Kamaluso`;
  const pageDescription = content.excerpt || content.content.substring(0, 155);
  const canonicalUrl = `/blog/${content.slug}`;
  const pageImage = content.coverImage || '/logo.webp';

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: content.title,
    description: pageDescription,
    datePublished: content.createdAt,
    image: pageImage,
    author: {
      '@type': 'Organization',
      name: 'Kamaluso',
    },
  };

  return (
    <>
      <SeoMeta
        title={pageTitle}
        description={pageDescription}
        url={canonicalUrl}
        image={pageImage}
        type="article"
      />
      <Head>
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      </Head>

      <main className="min-h-screen bg-white px-4 sm:px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <article>
            {content.coverImage && (
              <div className="relative w-full h-64 md:h-80 mb-8 rounded-lg overflow-hidden shadow-md">
                <Image
                  src={content.coverImage}
                  alt={content.title}
                  fill
                  sizes="(max-width: 800px) 100vw, 768px"
                  className="object-cover"
                  priority
                />
              </div>
            )}
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{content.title}</h1>
            {content.type === 'post' && content.subtitle && (
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                {content.subtitle}
              </h2>
            )}
            <p className="text-gray-500 mb-6">
              Publicado el {new Date(content.createdAt).toLocaleDateString()}
            </p>
            <div
              className="prose lg:prose-xl max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: content.content }}
            />
            {content.type === 'post' && content.tags && content.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8">
                {content.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-pink-100 text-pink-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </article>
        </div>

        {/* --- Sección Cluster (Solo para Pillar Pages) --- */}
        {content.type === 'pillar' && (
          <section className="max-w-7xl mx-auto mt-16 pt-12 border-t border-gray-200">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
              Explora el Universo de &quot;{content.title}&quot;
            </h2>

            {/* Artículos Relacionados */}
            {content.clusterPosts && content.clusterPosts.length > 0 && (
              <div className="mb-16">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6">Artículos para Profundizar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {content.clusterPosts.map((post) => (
                    <Link key={post._id} href={`/blog/${post.slug}`} passHref>
                      <a className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                        <div className="relative h-48 w-full">
                          <Image
                            src={post.coverImage || '/placeholder.png'}
                            alt={post.title}
                            layout="fill"
                            objectFit="cover"
                          />
                        </div>
                        <div className="p-6">
                          <h4 className="font-bold text-lg mb-2">{post.title}</h4>
                          <p className="text-gray-600 text-sm">{post.excerpt}</p>
                        </div>
                      </a>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Productos Recomendados */}
            {content.clusterProducts && content.clusterProducts.length > 0 && (
              <div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-6">Productos Recomendados en este Tema</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {content.clusterProducts.map((product) => (
                    <ProductCard key={product._id} product={{
                      _id: product._id,
                      nombre: product.nombre,
                      precio: product.basePrice || 0,
                      imagen: product.imageUrl || '/placeholder.png',
                      alt: product.alt || product.nombre,
                      slug: product.slug || '',
                      categoria: product.categoria || 'General', // Fallback category
                    }} />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </>
  );
}

// --- Data Fetching ---

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
    const res = await fetch(`${baseUrl}/api/blog/${slug}`);
    if (!res.ok) {
      return { notFound: true, revalidate: 300 };
    }
    const contentData = await res.json();

    // Lógica de tags específica para Posts
    if (contentData.type === 'post') {
      if (contentData.tags && Array.isArray(contentData.tags) && contentData.tags.length > 0 && typeof contentData.tags[0] === 'string') {
        contentData.tags = contentData.tags[0].split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
      } else {
        contentData.tags = [];
      }
    }

    return {
      props: { content: contentData },
      revalidate: 900, // 15 min
    };
  } catch (error) {
    console.error('Error fetching content:', error);
    return { notFound: true, revalidate: 300 };
  }
};

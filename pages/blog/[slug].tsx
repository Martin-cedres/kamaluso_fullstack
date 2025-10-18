import { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Navbar from '../../components/Navbar'
import SeoMeta from '../../components/SeoMeta'

interface Post {
  _id: string
  title: string
  subtitle?: string // Added
  slug: string
  content: string
  excerpt?: string
  createdAt: string
  tags?: string[] // Added
  coverImage?: string // Added
}

interface Props {
  post: Post | null
}

export default function BlogPostPage({ post }: Props) {
  if (!post) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center pt-32">
          <p className="text-gray-500 text-xl">Post no encontrado.</p>
        </main>
      </>
    )
  }

  const pageTitle = `${post.title} | Blog de Kamaluso`
  const pageDescription = post.excerpt || post.content.substring(0, 155)
  const canonicalUrl = `/blog/${post.slug}`
  const pageImage = post.coverImage || '/logo.webp'

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: pageDescription,
    datePublished: post.createdAt,
    image: pageImage,
    author: {
      '@type': 'Organization',
      name: 'Kamaluso',
    },
  }

  return (
    <>
      <SeoMeta
        title={pageTitle}
        description={pageDescription}
        url={canonicalUrl}
        image={pageImage}
        type="article"
      />
      {/* JSON-LD Schema for Google Rich Results */}
      <Head>
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      </Head>

      <Navbar />

      <main className="min-h-screen bg-white pt-32 px-6">
        <div className="max-w-4xl mx-auto">
          <article>
            {post.coverImage && (
              <div className="relative w-full h-64 mb-8 rounded-lg overflow-hidden shadow-md">
                <Image
                  src={post.coverImage || '/placeholder.png'}
                  alt={post.title}
                  fill
                  sizes="(max-width: 896px) 100vw, 896px"
                  className="object-cover rounded-lg"
                />
              </div>
            )}
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            {post.subtitle && (
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                {post.subtitle}
              </h2>
            )}{' '}
            {/* Added subtitle */}
            <p className="text-gray-500 mb-2">
              Publicado el {new Date(post.createdAt).toLocaleDateString()}
            </p>
            <div className="prose lg:prose-xl max-w-none mb-8">
              {/* Render the post content. If it's HTML, you'd use dangerouslySetInnerHTML */}
              {post.content}
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8">
                {post.tags.map((tag) => (
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
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  // Pre-render no paths at build; generate on-demand
  return { paths: [], fallback: 'blocking' }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { slug } = context.params || ({} as { slug?: string })
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  if (!slug || typeof slug !== 'string') {
    return { notFound: true }
  }

  try {
    const res = await fetch(`${baseUrl}/api/blog/${slug}`)
    if (!res.ok) {
      return { notFound: true, revalidate: 300 }
    }
    const post = await res.json()

    // Process tags to ensure it's an array of strings
    if (post.tags && Array.isArray(post.tags) && post.tags.length > 0 && typeof post.tags[0] === 'string') {
      post.tags = post.tags[0].split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
    } else {
      post.tags = []; // Ensure it's an empty array if not valid
    }

    return {
      props: { post },
      revalidate: 900, // 15 min
    }
  } catch (error) {
    console.error('Error fetching post:', error)
    return { notFound: true, revalidate: 300 }
  }
}

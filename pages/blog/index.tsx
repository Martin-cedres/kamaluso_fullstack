import { GetStaticProps } from 'next'
import Link from 'next/link'
import SeoMeta from '../../components/SeoMeta'
import connectDB from '../../lib/mongoose'
import Post from '../../models/Post'
import PillarPage from '../../models/PillarPage'

interface ContentItem {
  _id: string
  title: string
  subtitle?: string
  slug: string
  excerpt?: string
  topic?: string // Solo para Pillar Pages
  createdAt: string
  tags?: string[]
  type: 'post' | 'pillar' // Nuevo campo para diferenciar
}

interface Props {
  content: ContentItem[]
}

export default function BlogIndexPage({ content }: Props) {
  return (
    <>
      <SeoMeta
        title="Blog | Kamaluso Papelería"
        description="Artículos, guías completas y noticias sobre papelería personalizada, regalos empresariales y más."
        url="/blog"
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
                {/* Badge para diferenciar tipo de contenido */}
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

                {item.subtitle && (
                  <p className="text-xl text-gray-700 mb-2">{item.subtitle}</p>
                )}

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
                    {new Date(item.createdAt).toLocaleDateString('es-UY', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    await connectDB()

    // Obtener Posts
    const postsData = await Post.find({}).sort({ createdAt: -1 }).lean()
    const posts = postsData.map(post => ({
      ...JSON.parse(JSON.stringify(post)),
      type: 'post' as const
    }))

    // Obtener Pillar Pages
    const pillarData = await PillarPage.find({}).sort({ createdAt: -1 }).lean()
    const pillars = pillarData.map(pillar => ({
      _id: pillar._id.toString(),
      title: pillar.title,
      slug: pillar.slug,
      excerpt: pillar.seoDescription || `Guía completa sobre ${pillar.topic}`,
      topic: pillar.topic,
      createdAt: (pillar as any).createdAt.toISOString(),
      type: 'pillar' as const
    }))

    // Combinar y ordenar por fecha
    const content = [...posts, ...pillars].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return {
      props: { content },
      revalidate: 600, // 10 min
    }
  } catch (error) {
    console.error('Error fetching content for blog index:', error)
    return {
      props: { content: [] },
    }
  }
}
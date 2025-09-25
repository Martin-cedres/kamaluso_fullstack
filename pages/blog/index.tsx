import { GetStaticProps } from 'next'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import SeoMeta from '../../components/SeoMeta'
import connectDB from '../../lib/mongoose'
import Post from '../../models/Post'

interface Post {
  _id: string
  title: string
  subtitle?: string // Added
  slug: string
  excerpt?: string
  createdAt: string
  tags?: string[] // Added
}

interface Props {
  posts: Post[]
}

export default function BlogIndexPage({ posts }: Props) {
  return (
    <>
      <SeoMeta
        title="Blog | Kamaluso Papelería"
        description="Artículos y noticias sobre papelería personalizada, regalos empresariales y más."
        url="/blog"
      />

      <Navbar />

      <main className="min-h-screen bg-gray-50 pt-32 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-semibold text-center mb-10">
            Nuestro Blog
          </h1>

          <div className="space-y-8">
            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-white p-6 rounded-2xl shadow-md"
              >
                <h2 className="text-2xl font-bold mb-2">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="hover:text-pink-500 transition"
                  >
                    {post.title}
                  </Link>
                </h2>
                {post.subtitle && (
                  <p className="text-xl text-gray-700 mb-2">{post.subtitle}</p>
                )}{' '}
                {/* Added subtitle */}
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="font-semibold text-pink-500 hover:underline"
                >
                  Leer más
                </Link>
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
    const postsData = await Post.find({}).sort({ createdAt: -1 }).lean()
    const posts = JSON.parse(JSON.stringify(postsData))

    return {
      props: { posts },
      revalidate: 600, // 10 min
    }
  } catch (error) {
    console.error('Error fetching posts for blog index:', error)
    return {
      props: { posts: [] },
    }
  }
}
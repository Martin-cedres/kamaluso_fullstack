import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  createdAt: string;
}

interface Props {
  posts: Post[];
}

export default function BlogIndexPage({ posts }: Props) {
  return (
    <>
      <Head>
        <title>Blog | Kamaluso Papelería</title>
        <meta name="description" content="Artículos y noticias sobre papelería personalizada, regalos empresariales y más." />
      </Head>

      <Navbar />

      <main className="min-h-screen bg-gray-50 pt-32 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-semibold text-center mb-10">Nuestro Blog</h1>

          <div className="space-y-8">
            {posts.map((post) => (
              <div key={post._id} className="bg-white p-6 rounded-2xl shadow-md">
                <h2 className="text-2xl font-bold mb-2">
                  <Link href={`/blog/${post.slug}`} className="hover:text-pink-500 transition">
                    {post.title}
                  </Link>
                </h2>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <Link href={`/blog/${post.slug}`} className="font-semibold text-pink-500 hover:underline">
                  Leer más
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  try {
    const res = await fetch(`${baseUrl}/api/blog/listar`);
    const posts = await res.json();

    return {
      props: { posts },
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return {
      props: { posts: [] },
    };
  }
};

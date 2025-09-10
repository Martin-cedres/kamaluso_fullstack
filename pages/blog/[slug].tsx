import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Navbar from '../../components/Navbar';

interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  createdAt: string;
  // Add other fields like author, coverImage, etc. as you extend the schema
}

interface Props {
  post: Post | null;
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
    );
  }

  const pageTitle = `${post.title} | Blog de Kamaluso`;
  const pageDescription = post.excerpt || post.content.substring(0, 155);
  const canonicalUrl = `https://www.papeleriapersonalizada.uy/blog/${post.slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": pageDescription,
    "datePublished": post.createdAt,
    "author": {
        "@type": "Organization",
        "name": "Kamaluso"
    }
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={canonicalUrl} />
        <meta property="twitter:title" content={pageTitle} />
        <meta property="twitter:description" content={pageDescription} />

        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      </Head>

      <Navbar />

      <main className="min-h-screen bg-white pt-32 px-6">
        <div className="max-w-4xl mx-auto">
          <article>
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            <p className="text-gray-500 mb-8">Publicado el {new Date(post.createdAt).toLocaleDateString()}</p>
            <div className="prose lg:prose-xl max-w-none">
              {/* Render the post content. If it's HTML, you'd use dangerouslySetInnerHTML */}
              {post.content}
            </div>
          </article>
        </div>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.query;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  try {
    const res = await fetch(`${baseUrl}/api/blog/${slug}`);
    if (!res.ok) {
      return { props: { post: null } };
    }
    const post = await res.json();

    return {
      props: { post },
    };
  } catch (error) {
    console.error('Error fetching post:', error);
    return {
      props: { post: null },
    };
  }
};

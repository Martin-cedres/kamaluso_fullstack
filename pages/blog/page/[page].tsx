import { GetStaticProps, GetStaticPaths } from 'next';
import connectDB from '../../../lib/mongoose';
import Post from '../../../models/Post';
import PillarPage from '../../../models/PillarPage';
import BlogPageLayout from '../../../components/BlogPageLayout';

const POSTS_PER_PAGE = 10;

// Esta función es ahora la lógica central para obtener datos y puede ser reutilizada.
export async function getPaginatedContent(page: number) {
  await connectDB();

  // 1. Fetch only necessary fields for sorting
  const postsData = await Post.find({}, '_id createdAt').sort({ createdAt: -1 }).lean();
  const pillarData = await PillarPage.find({}, '_id createdAt').sort({ createdAt: -1 }).lean();

  const allContentIds = [...postsData, ...pillarData]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(item => ({ id: item._id.toString() }));

  const totalPages = Math.ceil(allContentIds.length / POSTS_PER_PAGE);
  const startIndex = (page - 1) * POSTS_PER_PAGE;
  const pageIds = allContentIds.slice(startIndex, startIndex + POSTS_PER_PAGE).map(item => item.id);

  // 2. Fetch full data only for the current page's content
  const posts = await Post.find({ '_id': { $in: pageIds } }).lean();
  const pillars = await PillarPage.find({ '_id': { $in: pageIds } }).lean();

  // 3. Combine and sort the full content based on the paginated order
  const contentMap = new Map();
  posts.forEach(p => contentMap.set(p._id.toString(), { ...JSON.parse(JSON.stringify(p)), type: 'post' }));
  pillars.forEach(p => contentMap.set(p._id.toString(), {
    _id: p._id.toString(),
    title: p.title,
    slug: p.slug,
    excerpt: p.seoDescription || `Guía completa sobre ${p.topic}`,
    topic: p.topic,
    createdAt: (p as any).createdAt.toISOString(),
    type: 'pillar'
  }));

  const pageContent = pageIds.map(id => contentMap.get(id)).filter(Boolean);

  return {
    content: pageContent,
    totalPages,
  };
}

// Render the page using the reusable layout
export default BlogPageLayout;

export const getStaticPaths: GetStaticPaths = async () => {
    await connectDB();
    const postsCount = await Post.countDocuments();
    const pillarsCount = await PillarPage.countDocuments();
    const totalContent = postsCount + pillarsCount;
    const totalPages = Math.ceil(totalContent / POSTS_PER_PAGE);

    // We don't pre-render page 1 here, as index.tsx will handle it.
    const paths = Array.from({ length: totalPages > 1 ? totalPages -1 : 0 }, (_, i) => ({
        params: { page: (i + 2).toString() },
    }));

    return {
        paths,
        fallback: 'blocking',
    };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const page = parseInt(params?.page as string || '1');
    
    // Redirect page 1 to the canonical /blog URL
    if (page === 1) {
        return {
            redirect: {
                destination: '/blog',
                permanent: false,
            },
        };
    }

    const { content, totalPages } = await getPaginatedContent(page);

    if (!content || content.length === 0) {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            content,
            currentPage: page,
            totalPages,
        },
        revalidate: 600, // 10 min
    };
};

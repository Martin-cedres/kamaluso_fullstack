import { GetStaticProps } from 'next';
import BlogPageLayout from '../../components/BlogPageLayout';
import { getPaginatedContent } from './page/[page]';

// La página de índice del blog ahora simplemente renderiza el componente de página paginada,
// pasándole las props para la PRIMERA página.

export default BlogPageLayout;

export const getStaticProps: GetStaticProps = async () => {
    const page = 1;
    const { content, totalPages } = await getPaginatedContent(page);

    // No content found for page 1, which can happen if there are no posts.
    if (!content) {
        return { notFound: true };
    }

    return {
        props: {
            content,
            currentPage: page,
            totalPages,
        },
        revalidate: 600, // 10 minutos
    };
};
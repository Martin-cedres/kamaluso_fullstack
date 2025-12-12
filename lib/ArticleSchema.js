import Head from 'next/head';
import PropTypes from 'prop-types';
import { siteConfig } from './seoConfig';

/**
 * Componente para generar el schema de Article (para blog posts y páginas pillar).
 * @param {object} article - Objeto con los datos del artículo
 */
const ArticleSchema = ({ article }) => {
    if (!article) {
        return null;
    }

    const articleUrl = `${siteConfig.baseUrl}/pillar/${article.slug}`;
    const imageUrl = article.imageUrl
        ? (article.imageUrl.startsWith('http') ? article.imageUrl : `${siteConfig.baseUrl}${article.imageUrl}`)
        : `${siteConfig.baseUrl}/logo.webp`;

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        '@id': `${articleUrl}#article`,
        headline: article.title || article.nombre,
        description: article.description || article.metaDescription,
        image: imageUrl,
        datePublished: article.publishedAt || article.createdAt,
        dateModified: article.updatedAt || article.createdAt,
        author: {
            '@type': 'Organization',
            name: siteConfig.organization.name,
            url: siteConfig.baseUrl,
        },
        publisher: {
            '@type': 'Organization',
            '@id': `${siteConfig.baseUrl}/#organization`,
            name: siteConfig.organization.name,
            logo: {
                '@type': 'ImageObject',
                url: siteConfig.organization.logo,
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': articleUrl,
        },
        inLanguage: siteConfig.language,
    };

    return (
        <Head>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
        </Head>
    );
};

ArticleSchema.propTypes = {
    article: PropTypes.shape({
        title: PropTypes.string,
        nombre: PropTypes.string,
        description: PropTypes.string,
        metaDescription: PropTypes.string,
        slug: PropTypes.string.isRequired,
        imageUrl: PropTypes.string,
        publishedAt: PropTypes.string,
        createdAt: PropTypes.string,
        updatedAt: PropTypes.string,
    }).isRequired,
};

export default ArticleSchema;

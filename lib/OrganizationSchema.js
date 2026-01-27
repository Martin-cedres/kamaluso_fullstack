
import Head from 'next/head';
import { siteConfig } from './seoConfig';

const OrganizationSchema = () => {
    const orgData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'url': siteConfig.baseUrl,
        'logo': `${siteConfig.baseUrl}/logo.webp`
    };

    const siteData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'url': siteConfig.baseUrl,
        'potentialAction': {
            '@type': 'SearchAction',
            'target': `${siteConfig.baseUrl}/buscar?q={search_term_string}`,
            'query-input': 'required name=search_term_string'
        }
    };

    return (
        <Head>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(orgData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(siteData) }}
            />
        </Head>
    );
};
export default OrganizationSchema;

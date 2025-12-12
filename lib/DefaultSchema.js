import Head from 'next/head';
import { siteConfig } from './seoConfig';

/**
 * Componente para generar schemas globales de Organization y WebSite.
 * Debe incluirse en _app.tsx para que esté disponible en todas las páginas.
 */
const DefaultSchema = () => {
    const schema = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Organization',
                '@id': `${siteConfig.baseUrl}/#organization`,
                name: siteConfig.organization.name,
                url: siteConfig.baseUrl,
                logo: {
                    '@type': 'ImageObject',
                    url: siteConfig.organization.logo,
                },
                sameAs: [
                    siteConfig.organization.facebook,
                    siteConfig.organization.instagram,
                ],
                contactPoint: {
                    '@type': 'ContactPoint',
                    telephone: siteConfig.contact.phone,
                    contactType: siteConfig.contact.type,
                    areaServed: siteConfig.contact.areaServed,
                    availableLanguage: siteConfig.contact.availableLanguage,
                },
            },
            {
                '@type': 'WebSite',
                '@id': `${siteConfig.baseUrl}/#website`,
                url: siteConfig.baseUrl,
                name: 'Papelería Personalizada',
                description: 'Agendas, libretas y planners 100% personalizados en Uruguay',
                publisher: { '@id': `${siteConfig.baseUrl}/#organization` },
                potentialAction: {
                    '@type': 'SearchAction',
                    target: {
                        '@type': 'EntryPoint',
                        urlTemplate: `${siteConfig.baseUrl}/buscar?q={search_term_string}`,
                    },
                    'query-input': 'required name=search_term_string',
                },
                inLanguage: siteConfig.language,
            },
        ],
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

export default DefaultSchema;

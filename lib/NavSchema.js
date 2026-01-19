import Head from 'next/head';
import { siteConfig } from './seoConfig';

/**
 * Componente para generar el esquema SiteNavigationElement.
 * Ayuda a Google a entender la jerarquía del menú y mostrar Sitelinks.
 */
const NavSchema = () => {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'name': 'Menú de navegación principal',
        'itemListElement': [
            {
                '@type': 'SiteNavigationElement',
                'position': 1,
                'name': 'Agendas Personalizadas',
                'url': `${siteConfig.baseUrl}/productos/agendas`
            },
            {
                '@type': 'SiteNavigationElement',
                'position': 2,
                'name': 'Libretas y Cuadernos',
                'url': `${siteConfig.baseUrl}/productos/libretas-y-cuadernos`
            },
            {
                '@type': 'SiteNavigationElement',
                'position': 3,
                'name': 'Regalos Empresariales',
                'url': `${siteConfig.baseUrl}/regalos-empresariales`
            },
            {
                '@type': 'SiteNavigationElement',
                'position': 4,
                'name': 'Insumos para Sublimación',
                'url': `${siteConfig.baseUrl}/sublimacion`
            },
            {
                '@type': 'SiteNavigationElement',
                'position': 5,
                'name': 'Nuestro Blog',
                'url': `${siteConfig.baseUrl}/blog`
            }
        ]
    };

    return (
        <Head>
            <script
                type="application/ld+json"
                id="nav-schema"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
        </Head>
    );
};

export default NavSchema;

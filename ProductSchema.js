import Head from 'next/head';
import PropTypes from 'prop-types';
import { siteConfig } from '../../lib/seoConfig';

/**
 * Componente para generar el script de datos estructurados (JSON-LD) para una página de producto.
 * Debe usarse junto con DefaultSchema.
 * @param {object} product - El objeto del producto con sus detalles.
 */
const ProductSchema = ({ product }) => {
  if (!product) {
    return null;
  }

  const productUrl = `${siteConfig.baseUrl}/productos/${product.slug}`;

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': `${productUrl}#product`,
        name: product.name,
        description: product.description,
        image: product.images || [],
        sku: product.sku,
        brand: {
          '@type': 'Brand',
          name: siteConfig.organization.name,
        },
        offers: {
          '@type': 'Offer',
          url: productUrl,
          priceCurrency: 'UYU',
          price: product.price,
          availability: 'https://schema.org/InStock',
          seller: {
            '@id': `${siteConfig.baseUrl}/#organization`,
          },
        },
        // Si el producto tiene FAQs, las vinculamos aquí
        ...(product.faqs && product.faqs.length > 0 && {
          mainEntity: {
            '@id': `${productUrl}#faqpage`,
          },
        }),
      },
      // Si hay FAQs, generamos el schema FAQPage correspondiente
      ...(product.faqs && product.faqs.length > 0
        ? [
            {
              '@type': 'FAQPage',
              '@id': `${productUrl}#faqpage`,
              mainEntity: product.faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: faq.answer,
                },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <Head>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </Head>
  );
};

ProductSchema.propTypes = {
  product: PropTypes.object.isRequired,
};

export default ProductSchema;
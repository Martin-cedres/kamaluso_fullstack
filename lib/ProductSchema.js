import Head from 'next/head';
import PropTypes from 'prop-types';
import { siteConfig } from './seoConfig';

/**
 * Componente para generar el script de datos estructurados (JSON-LD) para una página de producto.
 * Debe usarse junto con DefaultSchema.
 * @param {object} product - El objeto del producto con sus detalles.
 */
const ProductSchema = ({ product, averageRating, reviewCount }) => {
  if (!product) {
    return null;
  }

  const productUrl = `${siteConfig.baseUrl}/productos/${product.slug}`;
  const imageUrl = product.imageUrl ? (product.imageUrl.startsWith('http') ? product.imageUrl : `${siteConfig.baseUrl}${product.imageUrl}`) : '';

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': `${productUrl}#product`,
        name: product.nombre, // Corregido: name -> nombre
        description: product.descripcionBreve || product.descripcion, // Corregido: description -> descripcion
        image: product.images && product.images.length > 0 ? product.images : [imageUrl],
        sku: product._id, // Usamos ID como SKU por defecto
        brand: {
          '@type': 'Brand',
          name: siteConfig.organization?.name || 'Kamaluso',
        },
        offers: {
          '@type': 'Offer',
          url: productUrl,
          priceCurrency: 'UYU', // Moneda fija UYU
          price: product.basePrice, // Corregido: price -> basePrice
          availability: 'https://schema.org/InStock', // Siempre en stock como solicitado
          itemCondition: 'https://schema.org/NewCondition',
          seller: {
            '@type': 'Organization',
            name: siteConfig.organization?.name || 'Kamaluso',
          },
        },
        ...(averageRating && reviewCount > 0 && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: averageRating,
            reviewCount: reviewCount,
          },
        }),
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
  averageRating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  reviewCount: PropTypes.number,
};

export default ProductSchema;
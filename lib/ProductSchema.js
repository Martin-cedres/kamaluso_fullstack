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

  // Función auxiliar para asegurar URLs absolutas
  const getAbsoluteUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    // Asegurar que baseUrl no termine en / para evitar dobles slashes
    const baseUrl = siteConfig.baseUrl.endsWith('/') ? siteConfig.baseUrl.slice(0, -1) : siteConfig.baseUrl;
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${path}`;
  };

  const productUrl = getAbsoluteUrl(`/productos/detail/${product.slug}`);

  // Recopilar todas las imágenes y asegurar que sean absolutas
  const images = [];
  const primaryImage = getAbsoluteUrl(product.imageUrl);
  if (primaryImage) images.push(primaryImage);

  if (product.images && Array.isArray(product.images)) {
    product.images.forEach(img => {
      const absUrl = getAbsoluteUrl(img);
      if (absUrl && !images.includes(absUrl)) {
        images.push(absUrl);
      }
    });
  }

  // Si no hay imágenes, usar un placeholder (aunque imageUrl es requerido en el modelo)
  const finalImages = images.length > 0 ? images : [getAbsoluteUrl('/placeholder.png')];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': `${productUrl}#product`,
        name: product.nombre,
        description: product.descripcionBreve || product.descripcion,
        image: finalImages,
        sku: product._id,
        brand: {
          '@type': 'Brand',
          name: siteConfig.organization?.name || 'Kamaluso',
        },
        offers: {
          '@type': 'Offer',
          url: productUrl,
          priceCurrency: 'UYU',
          price: product.basePrice,
          availability: 'https://schema.org/InStock',
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
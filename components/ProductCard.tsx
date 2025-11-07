import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import StarRating from './StarRating'; // Importar StarRating
import Head from 'next/head';

export interface Product {
  _id: string;
  nombre: string;
  precio: number;
  categoria: string;
  slug: string;
  imagen: string;
  alt?: string;
  averageRating?: number;
  numReviews?: number;
  soloDestacado?: boolean;
  // Nuevos campos para el schema
  descripcionBreve?: string;
  descripcionExtensa?: string;
  puntosClave?: string[];
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const productUrl = `/productos/detail/${product.slug}`;
  const siteUrl = 'https://www.papeleriapersonalizada.uy';

  // Construir la descripción para el schema
  let schemaDescription = product.descripcionExtensa || product.descripcionBreve || '';
  if (product.puntosClave && product.puntosClave.length > 0) {
    schemaDescription += ` Puntos Clave: ${product.puntosClave.join(', ')}.`;
  }

  // Construir el script JSON-LD para el schema de producto
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.nombre,
    image: `${siteUrl}${product.imagen}`,
    description: schemaDescription,
    sku: product._id,
    brand: {
      '@type': 'Brand',
      name: 'Kamaluso',
    },
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}${productUrl}`,
      priceCurrency: 'UYU',
      price: product.precio,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    ...(product.numReviews && product.numReviews > 0 && product.averageRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.averageRating.toFixed(1),
        reviewCount: product.numReviews,
      },
    }),
  };

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
          key={`product-schema-${product._id}`}
        />
      </Head>
      <div className="flex flex-col h-full rounded-2xl border border-transparent overflow-hidden shadow-md transition-shadow hover:shadow-lg hover:shadow-pink-500/50 hover:border-2 hover:border-pink-500/50">
        {/* Imagen como enlace */}
        <Link href={productUrl} className="block relative w-full aspect-square">
          <Image
            src={product.imagen}
            alt={product.alt || product.nombre}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transform transition-transform duration-500 hover:scale-105"
          />
        </Link>

        {/* Contenido */}
        <div className="flex flex-col flex-grow p-4">
          <Link href={productUrl}>
            <h2 className="text-lg font-bold text-gray-800 line-clamp-2 hover:text-pink-600">
              {product.nombre}
            </h2>
          </Link>
          
          {/* Rating de Estrellas */}
          {product.numReviews && product.numReviews > 0 && product.averageRating ? (
            <div className="flex items-center my-0">
              <StarRating rating={product.averageRating} />
              <span className="text-xs text-gray-500 ml-2">
                ({product.numReviews})
              </span>
            </div>
          ) : (
            <div className="my-0 h-6"></div>
          )}

          <p className="text-xl font-semibold text-pink-500 mb-0 mt-auto">
            {product.soloDestacado ? 'Desde ' : ''}$U {product.precio}
          </p>
        </div>

        {/* Botón como enlace */}
        <Link href={productUrl} className="block w-full text-center bg-pink-500 text-white py-3 font-medium shadow-md hover:border-2 hover:border-pink-400 hover:shadow-lg transition rounded-b-2xl mt-auto">
          Ver detalles
        </Link>
      </div>
    </>
  );
};

export default ProductCard;

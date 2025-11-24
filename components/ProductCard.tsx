import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import StarRating from './StarRating'; // Importar StarRating
import Head from 'next/head';

export interface Product {
  _id: string;
  nombre: string;
  precio?: number;
  basePrice?: number;
  categoria?: string; // Made optional to match ProductProp
  slug?: string; // Made optional to match ProductProp
  imagen?: string;
  imageUrl?: string;
  images?: string[];
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

  // Determine the image source safely
  const imageSrc = product.imagen || product.imageUrl || (product.images && product.images.length > 0 ? product.images[0] : '/placeholder.png');

  const absoluteImageUrl = imageSrc.startsWith('http')
    ? imageSrc
    : `${siteUrl}${imageSrc}`;

  // Construir el script JSON-LD para el schema de producto
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.nombre,
    image: absoluteImageUrl,
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
      price: product.precio || product.basePrice,
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

      <div className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-kamalusoSoft transition-all duration-300 hover:shadow-kamalusoPink hover:-translate-y-1 border border-slate-100">
        {/* Imagen como enlace */}
        <Link href={productUrl} className="block relative w-full aspect-square min-w-0 overflow-hidden bg-fondoClaro">
          <Image
            src={imageSrc}
            alt={product.alt || product.nombre}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transform transition-transform duration-700 group-hover:scale-110"
          />
          {/* Overlay sutil al hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        </Link>

        {/* Contenido */}
        <div className="flex flex-col flex-grow p-5">
          <Link href={productUrl}>
            <h2 className="text-lg font-bold font-heading text-textoPrimario line-clamp-2 group-hover:text-rosa transition-colors">
              {product.nombre}
            </h2>
          </Link>

          {/* Rating de Estrellas */}
          {product.numReviews && product.numReviews > 0 && product.averageRating ? (
            <div className="flex items-center mt-2 mb-1">
              <StarRating rating={product.averageRating} />
              <span className="text-xs text-textoSecundario ml-2 font-medium">
                ({product.numReviews})
              </span>
            </div>
          ) : (
            <div className="mt-2 mb-1 h-5"></div>
          )}

          <div className="mt-auto pt-3 flex items-end justify-between">
            <div className="flex flex-col">
              {product.soloDestacado && (
                <span className="text-xs text-textoSecundario mb-0.5">Desde</span>
              )}
              <p className="text-xl font-bold text-rosa">
                $U {product.precio || product.basePrice}
              </p>
            </div>
            <Link href={productUrl} className="relative z-10 w-8 h-8 rounded-full bg-fondoClaro flex items-center justify-center text-rosa group-hover:bg-rosa group-hover:text-white transition-colors duration-300" title="Ver más">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Botón "Ver detalles" eliminado visualmente en favor de la tarjeta clicable completa, 
            pero mantenemos el enlace en la imagen y título para accesibilidad y SEO */}
      </div>
    </>
  );
};

export default ProductCard;

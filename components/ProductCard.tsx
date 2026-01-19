import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import OptimizedImage from './OptimizedImage';
import StarRating from './StarRating';
import Head from 'next/head';
import ShareProductButton from './ShareProductButton';
import PriceLock from './PriceLock';
import SublimationAccessModal from './SublimationAccessModal';

export interface Product {
  _id: string;
  nombre: string;
  precio?: number;
  basePrice?: number;
  categoria?: string;
  slug?: string;
  imagen?: string;
  imageUrl?: string;
  images?: string[];
  alt?: string;
  averageRating?: number;
  numReviews?: number;
  soloDestacado?: boolean;
  descripcionBreve?: string;
  descripcionExtensa?: string;
  puntosClave?: string[];
}

interface ProductCardProps {
  product: Product;
}

// Helper para detectar cookie de acceso mayorista
const hasWholesalerCookie = (): boolean => {
  if (typeof document === 'undefined') return false;
  return document.cookie.includes('kamaluso_wholesaler_access=true');
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const productUrl = `/productos/detail/${product.slug}`;
  const siteUrl = 'https://www.papeleriapersonalizada.uy';

  const [modalOpen, setModalOpen] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  // Detectar cookie en el cliente
  useEffect(() => {
    setHasAccess(hasWholesalerCookie());
  }, []);

  // Detectar si es producto sublimable
  const isSublimable = product.categoria === 'papeleria-sublimable';

  let schemaDescription = product.descripcionExtensa || product.descripcionBreve || '';
  if (product.puntosClave && product.puntosClave.length > 0) {
    schemaDescription += ` Puntos Clave: ${product.puntosClave.join(', ')}.`;
  }

  const imageSrc = product.imagen || product.imageUrl || (product.images && product.images.length > 0 ? product.images[0] : '/placeholder.png');

  const absoluteImageUrl = imageSrc.startsWith('http')
    ? imageSrc
    : `${siteUrl}${imageSrc}`;

  const productPrice = product.precio || product.basePrice || 0;

  // Schema solo para productos NO sublimables (los sublimables usan PriceLock)
  const productSchema = !isSublimable ? {
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
      price: productPrice,
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
  } : null;

  const handleUnlockSuccess = () => {
    setHasAccess(true);
    setModalOpen(false);
  };

  // Clases dinámicas para hover - cálido para sublimables, rosa para normales
  const hoverShadowClass = isSublimable
    ? 'hover:shadow-kamalusoWarm'
    : 'hover:shadow-kamalusoPink';

  const titleHoverClass = isSublimable
    ? 'group-hover:text-naranja'
    : 'group-hover:text-rosa';

  const buttonBgClass = isSublimable
    ? 'text-naranja group-hover:bg-naranja'
    : 'text-rosa group-hover:bg-rosa';

  return (
    <>
      {/* Schema para productos no sublimables */}
      {/* Schema movido a la página principal para optimización */}

      <div className={`group flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-kamalusoSoft transition-all duration-300 ${hoverShadowClass} hover:-translate-y-1 border border-slate-100`}>
        <Link href={productUrl} className="block relative w-full aspect-square min-w-0 overflow-hidden bg-fondoClaro">
          <OptimizedImage
            src={imageSrc}
            alt={product.alt || product.nombre}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transform transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

          {/* Badge para productos sublimables */}
          {isSublimable && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-naranja to-amarillo text-white text-xs font-bold px-2 py-1 rounded-full z-10">
              🔥 Mayorista
            </div>
          )}

          {/* Botón de Compartir */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <ShareProductButton
              productName={product.nombre}
              productUrl={`${siteUrl}${productUrl}`}
              productImage={absoluteImageUrl}
              variant="icon"
              size="sm"
            />
          </div>
        </Link>

        <div className="flex flex-col flex-grow p-5">
          <Link href={productUrl}>
            <h2 className={`text-lg font-bold font-heading text-textoPrimario line-clamp-2 ${titleHoverClass} transition-colors`}>
              {product.nombre}
            </h2>
          </Link>

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

              {/* Precio: PriceLock para sublimables, normal para otros */}
              {isSublimable ? (
                <PriceLock
                  price={productPrice}
                  productName={product.nombre}
                  productUrl={`${siteUrl}${productUrl}`}
                  productImage={absoluteImageUrl}
                  productDescription={schemaDescription}
                  hasAccess={hasAccess}
                  onUnlockRequest={() => setModalOpen(true)}
                  size="sm"
                />
              ) : (
                <p className="text-xl font-bold text-rosa">
                  $U {productPrice}
                </p>
              )}
            </div>
            <Link
              href={productUrl}
              className={`relative z-10 w-8 h-8 rounded-full bg-fondoClaro flex items-center justify-center ${buttonBgClass} group-hover:text-white transition-colors duration-300`}
              title="Ver más"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Modal de acceso sublimación */}
      <SublimationAccessModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleUnlockSuccess}
      />
    </>
  );
};

export default ProductCard;


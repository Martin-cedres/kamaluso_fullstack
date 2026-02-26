import React, { useState, useEffect, useRef } from 'react';
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
  videoUrl?: string;
  videoPreviewUrl?: string;
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
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detectar cookie en el cliente
  useEffect(() => {
    setHasAccess(hasWholesalerCookie());
  }, []);

  // Video hover preview: con debounce de 200ms para evitar parpadeos
  const hasVideoPreview = !!product.videoPreviewUrl;
  const hasVideo = !!product.videoUrl;

  const handleMouseEnter = () => {
    if (!hasVideoPreview) return;
    hoverTimeoutRef.current = setTimeout(() => setIsHovered(true), 200);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(false);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  // Detectar si es producto sublimable
  const isSublimable = product.categoria === 'papeleria-sublimable';

  let schemaDescription = product.descripcionExtensa || product.descripcionBreve || '';
  if (product.puntosClave && product.puntosClave.length > 0) {
    schemaDescription += ` Puntos Clave: ${product.puntosClave.join(', ')}.`;
  }

  // La imagen base debe ser estática por defecto. Priorizamos las versiones procesadas 
  // que sí tienen variantes de tamaño y primer fotograma garantizado.
  const imageSrc = product.imagen || product.imageUrl || (product.images && product.images.length > 0 ? product.images[0] : product.videoPreviewUrl) || '/placeholder.png';

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
      <div className={`group flex flex-col h-full bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 ${hoverShadowClass} hover:-translate-y-2 border border-slate-100/50 hover:border-slate-200/50`}>
        <Link
          href={productUrl}
          className="block relative w-full aspect-square min-w-0 overflow-hidden bg-[#FBF9F7]"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <OptimizedImage
            src={imageSrc}
            alt={product.alt || product.nombre}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transform transition-transform duration-1000 ease-out group-hover:scale-105"
          />

          {/* Video Preview animado en hover (desktop) */}
          {hasVideoPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={isHovered ? 'playing' : 'static'} // Forzar re-render para reiniciar loop
              src={product.videoPreviewUrl}
              alt={`Preview de ${product.nombre}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 z-[5] hidden md:block ${isHovered ? 'opacity-100' : 'opacity-0'
                }`}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-black/0 group-hover:from-black/[0.05] group-hover:to-transparent transition-all duration-500" />

          {/* Badge para productos sublimables - Ultra Minimalista / Expansivo */}
          {isSublimable && (
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-naranja text-[10px] font-bold px-2 py-1.5 rounded-full shadow-sm z-10 flex items-center gap-0 group-hover:gap-2 transition-all duration-500 ease-in-out border border-naranja/10 group-hover:px-3 overflow-hidden max-w-[32px] group-hover:max-w-[120px]">
              <span className="flex-shrink-0">💎</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 uppercase tracking-widest whitespace-nowrap">Mayorista</span>
            </div>
          )}

          {/* Badge de Vista Animada (WebP) - Estilo Bubble */}
          {hasVideoPreview && (
            <div className={`absolute bottom-3 left-3 bg-white/95 backdrop-blur-md text-pink-600 text-[10px] font-black p-2 rounded-full z-10 shadow-sm border border-pink-100 transition-all duration-300 flex items-center gap-0 group-hover:gap-2 overflow-hidden max-w-[34px] group-hover:max-w-[140px] group-hover:px-4 ${isHovered ? 'md:opacity-0' : 'opacity-100'}`}>
              <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500"></span>
              </span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 uppercase tracking-widest whitespace-nowrap">Ver en acción</span>
            </div>
          )}

          {/* Botón de Compartir - Estilo minimalista */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 z-10 translate-y-2 group-hover:translate-y-0">
            <ShareProductButton
              productName={product.nombre}
              productUrl={`${siteUrl}${productUrl}`}
              productImage={absoluteImageUrl}
              variant="icon"
              size="sm"
            />
          </div>
        </Link>

        <div className="flex flex-col flex-grow p-6 relative">
          <Link href={productUrl}>
            <h2 className={`text-base md:text-lg font-bold font-heading text-slate-900 line-clamp-2 leading-snug ${titleHoverClass} transition-colors duration-300`}>
              {product.nombre}
            </h2>
          </Link>

          {/* Contenedor de Información Secundaria / Ratings con Animación */}
          <div className="relative h-10 mt-3 overflow-hidden">
            {/* Rating (Estado por defecto) */}
            <div className="absolute inset-0 flex items-center transition-all duration-500 group-hover:-translate-y-full group-hover:opacity-0">
              {product.averageRating && product.averageRating > 0 ? (
                <div className="flex items-center">
                  <StarRating rating={product.averageRating} />
                  {product.numReviews && product.numReviews > 0 && (
                    <span className="text-[10px] text-slate-400 ml-2 font-medium">({product.numReviews})</span>
                  )}
                </div>
              ) : (
                <span className="text-[10px] text-slate-300 uppercase tracking-widest font-medium">Producto Artesanal</span>
              )}
            </div>

            {/* Descripción/Specs al Hover (Estado Activo) */}
            <div className="absolute inset-0 flex items-center transition-all duration-500 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
              <p className="text-[11px] text-slate-500 font-medium italic line-clamp-2 leading-tight">
                {product.descripcionBreve || "Diseño exclusivo Kamaluso con detalles premium."}
              </p>
            </div>
          </div>

          <div className="mt-auto pt-4 flex items-end justify-between">
            <div className="flex flex-col">
              {product.soloDestacado && (
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Desde</span>
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
                <p className="text-xl font-extrabold text-slate-950 font-heading">
                  <span className="text-xs font-bold text-slate-400 mr-1 italic">$U</span>
                  {productPrice}
                </p>
              )}
            </div>

            {/* CTA Button: Expansivo "Personalizar" */}
            <Link
              href={productUrl}
              className={`relative z-10 h-11 px-4 rounded-full bg-slate-50 flex items-center justify-center text-slate-950 shadow-sm border border-slate-100 transition-all duration-500 hover:scale-105 active:scale-95 group/btn hover:bg-slate-950 hover:text-white hover:border-slate-950 overflow-hidden`}
              title="Ir a personalizar"
            >
              <div className="flex items-center gap-0 group-hover/btn:gap-2 transition-all duration-500">
                <span className="max-w-0 opacity-0 group-hover/btn:max-w-[100px] group-hover/btn:opacity-100 transition-all duration-500 text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap overflow-hidden">
                  Personalizar
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
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

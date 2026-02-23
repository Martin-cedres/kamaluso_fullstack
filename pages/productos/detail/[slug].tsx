import { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import ProductCard from '../../../components/ProductCard';
import VisualOptionSelector from '../../../components/VisualOptionSelector';
import ShareProductButton from '../../../components/ShareProductButton';
import { useRouter } from 'next/router'
import { useCart } from '../../../context/CartContext'
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, ShieldCheckIcon, TruckIcon, SparklesIcon, DocumentTextIcon, CheckCircleIcon, QuestionMarkCircleIcon, LightBulbIcon, StarIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import Breadcrumbs from '../../../components/Breadcrumbs'
import OptimizedImage from '../../../components/OptimizedImage';
import ProductVideo from '../../../components/ProductVideo';
import { getYouTubeId, getYouTubeThumbnail } from '../../../components/ProductVideo';
import StarRating from '../../../components/StarRating';
import ReviewList from '../../../components/ReviewList';
import ReviewForm from '../../../components/ReviewForm';
import toast from 'react-hot-toast'
import connectDB from '../../../lib/mongoose'
import Product, { IProduct, ICustomizationGroup, ICustomizationOption } from '../../../models/Product'
import CoverDesign, { ICoverDesign } from '../../../models/CoverDesign';
import Review, { IReview } from '../../../models/Review';
import Category from '../../../models/Category';
import mongoose from 'mongoose'

import InteriorDesignGallery from '../../../components/InteriorDesignGallery';
import NewCoverDesignGallery, { DesignOption } from '../../../components/NewCoverDesignGallery';
import FaqSection from '../../../components/FaqSection';
import UseCasesSection from '../../../components/UseCasesSection';
import s3Loader from '../../../lib/s3-loader';
import ProductSchema from '../../../lib/ProductSchema';
import PriceLock from '../../../components/PriceLock';
import SublimationAccessModal from '../../../components/SublimationAccessModal';
import ProductDetailedContent from '../../../components/ProductDetailedContent';
import ProductInfoAccordions from '../../../components/ProductInfoAccordions';
import SeoMeta from '../../../components/SeoMeta';

// Helper para detectar cookie de acceso mayorista
const hasWholesalerCookie = (): boolean => {
  if (typeof document === 'undefined') return false;
  return document.cookie.includes('kamaluso_wholesaler_access=true');
};


// This interface is for the props passed to the component
interface ProductProp {
  _id: string
  nombre: string
  descripcion?: string
  basePrice?: number
  precio?: number
  precioDura?: number
  categoria?: string
  destacado?: boolean
  imageUrl?: string
  images?: string[]
  alt?: string
  slug?: string
  tapa?: string
  seoTitle?: string
  seoDescription?: string
  precioFlex?: number
  soloDestacado?: boolean // Nuevo campo
  customizationGroups?: any[]; // Nuevo campo
  showCoverType?: boolean; // Nuevo campo
  descripcionBreve?: string; // Nuevo campo
  puntosClave?: string[]; // Nuevo campo
  descripcionExtensa?: string; // Nuevo campo
  faqs?: { question: string; answer: string; }[]; // Nuevo campo
  useCases?: string[]; // Nuevo campo
  videoUrl?: string;
  videoPreviewUrl?: string;
  creadoEn?: string | Date;
}

const getCardDisplayPrice = (product: ProductProp) => {
  if (product.basePrice) return product.basePrice
  if (product.precioDura) return product.precioDura
  if (product.precioFlex) return product.precioFlex
  if (product.precio) return product.precio
  return null
}

interface Props {
  product: ProductProp | null
  relatedProducts: ProductProp[]
  reviews: IReview[]
  reviewCount: number
  averageRating: string
  mainCategory: { nombre: string; slug: string } | null;
  subCategory: { nombre: string; slug: string } | null;
  noindex?: boolean; // Add this
}

const customGroupTitles: Record<string, string> = {
  'Diseño de Tapa': 'Elige el diseño de la tapa',
  'Elástico': 'Con elástico de cierre?',
  'Frase/Nombre': 'Agrega Nombre o Frase a la tapa (opcional)',
};

const groupOrder: Record<string, number> = {
  'Diseño de Tapa': 1,
  'Elástico': 2,
  'Frase/Nombre': 3,
};

export default function ProductDetailPage({ product, relatedProducts, reviews, reviewCount, averageRating, mainCategory, subCategory, noindex }: Props) {
  const { addToCart } = useCart()
  const router = useRouter()
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const defaultSelections: Record<string, string> = {};
    if (product) {
      const tipoDeTapaGroup = product.customizationGroups?.find(g => g.name === 'Tipo de Tapa');
      if (tipoDeTapaGroup && tipoDeTapaGroup.options && tipoDeTapaGroup.options.length > 0) {
        defaultSelections['Tipo de Tapa'] = tipoDeTapaGroup.options[0].name;
      }
    }
    return defaultSelections;
  });
  const [totalPrice, setTotalPrice] = useState(product?.basePrice || 0);
  // Inicializar con placeholder para evitar diferencias entre servidor y cliente
  const [activeImage, setActiveImage] = useState('/placeholder.png');
  const [isAnimating, setIsAnimating] = useState(false);
  const addToCartRef = useRef<HTMLDivElement>(null);
  const desktopCarouselRef = useRef<HTMLDivElement>(null);
  const mobileCarouselRef = useRef<HTMLDivElement>(null);

  const [showDesktopLeftArrow, setShowDesktopLeftArrow] = useState(false);
  const [showDesktopRightArrow, setShowDesktopRightArrow] = useState(false);
  const [showMobileLeftArrow, setShowMobileLeftArrow] = useState(false);
  const [showMobileRightArrow, setShowMobileRightArrow] = useState(false);
  // Estado para Lead Magnet de sublimación
  const [sublimationModalOpen, setSublimationModalOpen] = useState(false);
  const [hasWholesalerAccess, setHasWholesalerAccess] = useState(false);

  // Detectar si es producto sublimable
  const isSublimable = product?.categoria === 'papeleria-sublimable';

  // Detectar cookie de acceso mayorista
  useEffect(() => {
    setHasWholesalerAccess(hasWholesalerCookie());
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [router.asPath]);

  const scrollThumbnails = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    const container = ref.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const activeCoverDesignGroups = useMemo(() => {
    return product?.customizationGroups?.filter(g => g.name === 'Diseño de Tapa') || [];
  }, [product?.customizationGroups]);

  const displayGroups = useMemo(() => {
    if (!product?.customizationGroups) return [];
    // Filter out the main cover design group (handled by activeCoverDesignGroups) and the now-hidden 'Tipo de Tapa' group
    return product.customizationGroups.filter(g =>
      g.name !== 'Diseño de Tapa' && g.name !== 'Tipo de Tapa'
    );
  }, [product?.customizationGroups]);

  const orderedCustomizationGroups = useMemo(() => {
    const allVisibleGroups = [...activeCoverDesignGroups, ...displayGroups];

    const getSortKey = (groupName: string) => {
      if (groupName.startsWith('Diseño de Tapa')) return 'Diseño de Tapa';
      return groupName;
    };

    return allVisibleGroups.sort((a, b) => {
      // Prioritize displayOrder from the database if it exists
      if (a.displayOrder !== undefined && b.displayOrder !== undefined) {
        return a.displayOrder - b.displayOrder;
      }
      if (a.displayOrder !== undefined) return -1; // a comes first
      if (b.displayOrder !== undefined) return 1;  // b comes first

      // Fallback to hardcoded order
      const keyA = getSortKey(a.name);
      const keyB = getSortKey(b.name);
      const orderA = groupOrder[keyA] ?? 99;
      const orderB = groupOrder[keyB] ?? 99;
      return orderA - orderB;
    });
  }, [activeCoverDesignGroups, displayGroups]);

  // Constante especial para identificar el video en la galería
  const VIDEO_MARKER = '__VIDEO__';
  const PREVIEW_MARKER = '__PREVIEW__';

  const allProductMedia = useMemo(() => {
    const media: string[] = [];

    // Si tiene preview animado, es el primer item (Loop)
    if (product?.videoPreviewUrl) media.push(PREVIEW_MARKER);

    // Si tiene video completo, es el siguiente
    if (product?.videoUrl) media.push(VIDEO_MARKER);

    // Extraer ID del video preview si existe para deduplicación robusta
    const videoId = product?.videoPreviewUrl?.split('/').pop()?.split('.')[0];

    if (product?.imageUrl) {
      // Deduplicar si es el mismo asset que el preview animado (Sincronizado por Admin)
      let isDuplicate = false;
      if (videoId) {
        const imageId = product.imageUrl.split('/').pop()?.split('.')[0];
        if (videoId === imageId) isDuplicate = true;
      }
      if (!isDuplicate) media.push(product.imageUrl);
    }

    if (product?.images) {
      product.images.forEach(img => {
        // También deduplicar contra el video preview si está en el array de imágenes
        let isRedundantWithPreview = false;
        if (videoId) {
          const imgId = img.split('/').pop()?.split('.')[0];
          if (videoId === imgId) isRedundantWithPreview = true;
        }

        if (!media.includes(img) && img !== product.imageUrl && !isRedundantWithPreview) {
          media.push(img);
        }
      });
    }
    return media;
  }, [product?.imageUrl, product?.images, product?.videoUrl, product?.videoPreviewUrl]);

  // Alias para compatibilidad con la navegación existente
  const allProductImages = allProductMedia;

  useEffect(() => {
    const checkScroll = (
      element: HTMLDivElement | null,
      setLeft: (v: boolean) => void,
      setRight: (v: boolean) => void
    ) => {
      if (!element) return;
      const { scrollLeft, scrollWidth, clientWidth } = element;
      setLeft(scrollLeft > 0);
      setRight(scrollLeft < scrollWidth - clientWidth - 1);
    };

    const handleScrollCheck = () => {
      checkScroll(desktopCarouselRef.current, setShowDesktopLeftArrow, setShowDesktopRightArrow);
      checkScroll(mobileCarouselRef.current, setShowMobileLeftArrow, setShowMobileRightArrow);
    };

    // Check immediately and after delay
    handleScrollCheck();
    const timeoutId = setTimeout(handleScrollCheck, 150);

    const desktopEl = desktopCarouselRef.current;
    const mobileEl = mobileCarouselRef.current;

    if (desktopEl) desktopEl.addEventListener('scroll', handleScrollCheck);
    if (mobileEl) mobileEl.addEventListener('scroll', handleScrollCheck);
    window.addEventListener('resize', handleScrollCheck);

    return () => {
      clearTimeout(timeoutId);
      if (desktopEl) desktopEl.removeEventListener('scroll', handleScrollCheck);
      if (mobileEl) mobileEl.removeEventListener('scroll', handleScrollCheck);
      window.removeEventListener('resize', handleScrollCheck);
    };
  }, [allProductImages]);

  useEffect(() => {
    if (product) {
      setActiveImage(allProductMedia[0] || '/placeholder.png');
    }
  }, [product, allProductImages]);

  const handleImageChange = useCallback((newImage: string) => {
    if (newImage !== activeImage) {
      setActiveImage(newImage);
      setIsAnimating(true);
    }
  }, [activeImage]);

  // Auto-scroll thumbnails when active image changes
  useEffect(() => {
    const index = allProductImages.findIndex(img => img === activeImage);
    if (index !== -1) {
      // Try to find desktop thumbnail
      const desktopThumbnail = document.getElementById(`thumbnail-desktop-${index}`);
      if (desktopThumbnail) {
        desktopThumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
      // Try to find mobile thumbnail (we'll add IDs to mobile too)
      const mobileThumbnail = document.getElementById(`thumbnail-mobile-${index}`);
      if (mobileThumbnail) {
        mobileThumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeImage, allProductImages]);



  const handleCoverDesignSelect = useCallback((groupName: string, option: DesignOption) => {

    if (option.image) {

      handleImageChange(option.image);

    }



    setSelections(prev => {

      const newSelections = { ...prev };

      // Deseleccionar cualquier otra opción de diseño de tapa

      Object.keys(newSelections).forEach(key => {

        if (key.startsWith('Diseño de Tapa')) {

          delete newSelections[key];

        }

      });

      // Establecer la nueva selección

      newSelections[groupName] = option.name;

      return newSelections;

    });

  }, [handleImageChange]);





  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;

      const isDesktopFocused = desktopCarouselRef.current?.contains(document.activeElement);
      const isMobileFocused = mobileCarouselRef.current?.contains(document.activeElement);

      if (!isDesktopFocused && !isMobileFocused) return;

      e.preventDefault();

      const currentIndex = allProductImages.findIndex(img => img === activeImage);
      if (currentIndex === -1) return;

      let nextIndex;
      if (e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % allProductImages.length;
      } else { // ArrowLeft
        nextIndex = (currentIndex - 1 + allProductImages.length) % allProductImages.length;
      }
      handleImageChange(allProductImages[nextIndex]);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [allProductImages, activeImage, handleImageChange]);



  const navigateImage = (direction: 'prev' | 'next') => {
    const currentIndex = allProductImages.findIndex(img => img === activeImage);
    if (currentIndex === -1) return;

    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % allProductImages.length;
    } else {
      nextIndex = (currentIndex - 1 + allProductImages.length) % allProductImages.length;
    }
    handleImageChange(allProductImages[nextIndex]);
  };

  useEffect(() => {
    if (!product) return;

    let currentPrice = product.basePrice || 0;
    product.customizationGroups?.forEach(group => {
      const selectedOptionName = selections[group.name];
      if (selectedOptionName) {
        if (group.options && Array.isArray(group.options)) {
          const selectedOption = group.options.find(opt => opt.name === selectedOptionName);
          if (selectedOption) {
            currentPrice += selectedOption.priceModifier;
          }
        } else {
          console.warn(`El grupo de personalización "${group.name}" no tiene un array de opciones.`, group);
        }
      }
    });
    setTotalPrice(currentPrice);
  }, [selections, product]);

  const handleSelectionChange = (groupName: string, value: string) => {
    const trimmedGroupName = groupName.trim();
    setSelections(prev => {
      const newSelections: Record<string, string> = { ...prev, [trimmedGroupName]: value };
      product?.customizationGroups?.forEach(group => {
        if (group.dependsOn?.groupName === trimmedGroupName && newSelections[group.name]) {
          delete newSelections[group.name];
        }
      });
      return newSelections;
    });
  };



  const handleAddToCart = () => {
    if (!product) return;

    // Validar que todas las personalizaciones requeridas estén seleccionadas
    const requiredGroups = product.customizationGroups?.filter(g => g.required) || [];
    const missingSelections = requiredGroups.filter(g => !selections[g.name]);

    if (missingSelections.length > 0) {
      toast.error(`Por favor, selecciona una opción para: ${missingSelections.map(g => g.name).join(', ')}`);
      return;
    }

    const cartItem = {
      _id: product._id,
      nombre: product.nombre,
      precio: totalPrice,
      imageUrl: activeImage,
      selections: selections,
      categoria: product.categoria,
    };

    addToCart(cartItem);
    toast.success(`${product.nombre} fue agregado al carrito!`);
  };

  if (router.isFallback) {
    return <div>Cargando...</div>
  }

  if (!product) {
    return <div>Producto no encontrado</div>
  }

  const breadcrumbs = [
    { name: 'Inicio', href: '/' },
    { name: 'Productos', href: '/productos' },
  ];
  if (mainCategory) {
    breadcrumbs.push({ name: mainCategory.nombre, href: `/productos/${mainCategory.slug}` });
  }
  if (subCategory) {
    breadcrumbs.push({ name: subCategory.nombre, href: `/productos/${mainCategory?.slug}/${subCategory.slug}` });
  }
  breadcrumbs.push({ name: product.nombre, href: `/productos/detail/${product.slug}` });

  const tipoDeTapaGroup = product?.customizationGroups?.find(g => g.name === 'Tipo de Tapa');

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://www.papeleriapersonalizada.uy${item.href}`,
    })),
  };



  // Construir URL dinámica para OG Image
  const ogImageUrl = `https://www.papeleriapersonalizada.uy/api/og/product?title=${encodeURIComponent(product.nombre)}&price=${getCardDisplayPrice(product) || product.basePrice}&image=${encodeURIComponent(product.imageUrl || '')}`;

  return (
    <>
      <SeoMeta
        title={product.seoTitle || product.nombre}
        description={product.seoDescription || product.descripcion}
        image={ogImageUrl}
      />
      <ProductSchema product={product} averageRating={averageRating} reviewCount={reviewCount} />
      <Head>
        {noindex && <meta name="robots" content="noindex" />}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
          key="breadcrumb-jsonld"
        />
        {product.videoUrl && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "VideoObject",
                "name": `Video de ${product.nombre}`,
                "description": product.descripcionBreve || `Mira este video de ${product.nombre} en Kamaluso`,
                "thumbnailUrl": [
                  `https://img.youtube.com/vi/${getYouTubeId(product.videoUrl) || ''}/maxresdefault.jpg`
                ],
                "uploadDate": product.creadoEn ? new Date(product.creadoEn).toISOString() : new Date().toISOString(),
                "contentUrl": product.videoUrl,
                "embedUrl": `https://www.youtube.com/embed/${getYouTubeId(product.videoUrl) || ''}`
              })
            }}
          />
        )}
      </Head>

      <div className="bg-white" style={{ paddingTop: 'calc(var(--topbar-height, 0px) + 4rem)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Migas de pan para Escritorio */}
          <div className="hidden md:block pb-6">
            <Breadcrumbs items={breadcrumbs} />
          </div>

          {/* Botón "Volver" para Móvil */}
          <div className="md:hidden mb-4">
            <button onClick={() => router.back()} className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900">
              <ChevronLeftIcon className="h-5 w-5 mr-1" />
              Volver
            </button>
          </div>

        </div>

        {/* --- ESTRUCTURA PARA ESCRITORIO (md y superior) --- */}
        <div className="hidden md:grid mx-auto max-w-[1400px] px-6 lg:px-12 grid-cols-12 gap-12 mt-8 mb-24">

          {/* Columna Izquierda (Imagen Principal + Miniaturas) - 6 columnas (50%) */}
          <div className="col-span-12 md:col-span-6 flex flex-col sticky top-28 self-start">
            <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden shadow-sm bg-[#F9F9F9] mb-6 group">
              {activeImage === PREVIEW_MARKER && product.videoPreviewUrl ? (
                /* Point 5: High-End Gallery Loop using <img> for WebP compatibility */
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={product.videoPreviewUrl}
                  alt={`Preview animado de ${product.nombre}`}
                  className="h-full w-full object-cover"
                />
              ) : activeImage === VIDEO_MARKER && product.videoUrl ? (
                <ProductVideo
                  videoUrl={product.videoUrl}
                  alt={`Video de ${product.nombre}`}
                />
              ) : (
                <OptimizedImage
                  key={activeImage}
                  src={activeImage}
                  alt={product.alt || product.nombre}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  style={{ objectFit: 'cover' }}
                  className={`transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
                  priority
                  onLoadingComplete={() => setIsAnimating(false)}
                />
              )}

              {/* Botones de Navegación Imagen Principal (Hover) */}
              {allProductMedia.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-3 text-slate-800 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-20"
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeftIcon className="h-6 w-6" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigateImage('next'); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-3 text-slate-800 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-20"
                    aria-label="Siguiente imagen"
                  >
                    <ChevronRightIcon className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Miniaturas Ampliadas */}
            {allProductMedia.length > 1 && (
              <div className="relative w-full flex items-center justify-start gap-4">
                <button
                  onClick={() => scrollThumbnails(desktopCarouselRef, 'left')}
                  className={`bg-white border border-slate-200 text-slate-600 rounded-full p-2 hover:bg-slate-50 transition-opacity ${showDesktopLeftArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  aria-label="Scroll left"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>

                <div
                  ref={desktopCarouselRef}
                  className="flex flex-nowrap gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-2 w-full scroll-smooth"
                >
                  {allProductMedia.map((media, index) => (
                    <div
                      key={index}
                      id={`thumbnail-desktop-${index}`}
                      className={`relative w-24 h-24 rounded-lg overflow-hidden cursor-pointer snap-start flex-shrink-0 transition-all duration-300 ${activeImage === media ? 'ring-2 ring-slate-900 opacity-100' : 'opacity-60 hover:opacity-100'}`}
                      onClick={() => handleImageChange(media)}
                    >
                      {media === PREVIEW_MARKER ? (
                        <div className="relative h-full w-full bg-black">
                          <img
                            src={product.videoPreviewUrl}
                            alt="Preview animado"
                            className="h-full w-full object-cover opacity-60"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="rounded-full bg-white/20 p-1 backdrop-blur-sm">
                              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      ) : media === VIDEO_MARKER && product.videoUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getYouTubeThumbnail(getYouTubeId(product.videoUrl) || '')}
                            alt="Video"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </>
                      ) : (
                        <OptimizedImage
                          src={media}
                          alt={`Vista ${index + 1}`}
                          fill
                          sizes="100px"
                          style={{ objectFit: 'cover' }}
                          unoptimized={media === product.videoPreviewUrl}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => scrollThumbnails(desktopCarouselRef, 'right')}
                  className={`bg-white border border-slate-200 text-slate-600 rounded-full p-2 hover:bg-slate-50 transition-opacity ${showDesktopRightArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  aria-label="Scroll right"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Columna Derecha (Info + Compra) - 6 columnas (50%) */}
          <div className="col-span-12 md:col-span-6 flex flex-col gap-8">

            {/* Cabecera de Producto */}
            <div className="border-b border-slate-100 pb-6">
              <h1 className="text-4xl md:text-5xl font-black font-heading text-slate-900 mb-4 leading-tight tracking-tight">
                {product.nombre}
              </h1>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <StarRating rating={parseFloat(averageRating)} />
                    <span className="ml-2 text-sm font-medium text-slate-500 underline decoration-slate-300 underline-offset-4">
                      {reviewCount} {reviewCount === 1 ? 'opinión' : 'opiniones'}
                    </span>
                  </div>

                  {isSublimable && !hasWholesalerAccess ? (
                    // Badge especial para mayoristas sin acceso
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Precio Mayorista
                    </span>
                  ) : (
                    // Precio normal destacado
                    <p className="text-3xl font-extrabold text-slate-900 font-heading">
                      $U {totalPrice}
                    </p>
                  )}
                </div>

                {/* Sublimable Locked State */}
                {isSublimable && !hasWholesalerAccess && (
                  <PriceLock
                    price={totalPrice}
                    productName={product.nombre}
                    productUrl={`https://www.papeleriapersonalizada.uy/productos/detail/${product.slug}`}
                    productImage={activeImage}
                    productDescription={product.descripcionBreve}
                    hasAccess={hasWholesalerAccess}
                    onUnlockRequest={() => setSublimationModalOpen(true)}
                    size="lg"
                  />
                )}
              </div>
            </div>

            {/* Descripción Breve Editorial */}
            {product.descripcionBreve && (
              <div className="text-slate-800 text-lg leading-8 font-medium">
                {product.descripcionBreve}
              </div>
            )}

            {/* --- Configurador --- */}
            <div ref={addToCartRef} className="flex flex-col gap-8">
              {orderedCustomizationGroups.map((group, index) => {
                const groupNumber = index + 1;
                const isCoverDesignGroup = group.name.startsWith('Diseño de Tapa');

                if (isCoverDesignGroup) {
                  const groupTitle = customGroupTitles['Diseño de Tapa'] || group.name.replace('Diseño de Tapa - ', '');
                  return (
                    <div key={group.name} className="animate-fade-in">
                      <NewCoverDesignGallery
                        groupName={`${groupNumber}. ${groupTitle}`}
                        options={(group.options || []).map(opt => ({ name: opt.name, image: opt.image || '', priceModifier: opt.priceModifier || 0 }))}
                        onSelectOption={(option) => handleCoverDesignSelect(group.name, option)}
                        selectedOptionName={selections[group.name]}
                      />
                    </div>
                  );
                } else {
                  const groupTitle = customGroupTitles[group.name] || group.name;

                  return (
                    <div key={group.name} className="flex flex-col gap-3">
                      <h3 className="font-bold text-base text-slate-900 uppercase tracking-wide flex items-center justify-between">
                        <span>{groupNumber}. {groupTitle}</span>
                        {group.required && <span className="text-[10px] text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full font-bold">Requerido</span>}
                      </h3>

                      {group.type === 'text' ? (
                        <input
                          type="text"
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                          placeholder="Escribe tu personalización aquí..."
                          value={selections[group.name] || ''}
                          onChange={(e) => handleSelectionChange(group.name, e.target.value)}
                        />
                      ) : (
                        <div className="flex flex-wrap gap-3">
                          {(group.options || []).map((option) => (
                            <button
                              key={option.name}
                              onClick={() => handleSelectionChange(group.name, option.name)}
                              className={`px-5 py-3 rounded-lg border-2 text-sm font-bold transition-all duration-200 ${selections[group.name] === option.name
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:text-slate-900'
                                }`}
                            >
                              {option.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
              })}
            </div>

            {/* --- Botones de Acción --- */}
            <div className="flex flex-col gap-4 mt-4 pt-6 border-t border-slate-100">
              <button
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white text-lg font-bold py-4 rounded-full shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 flex justify-center items-center gap-3"
              >
                <span>Añadir al carrito</span>
                <span className="text-white/40">|</span>
                <span>$U {totalPrice}</span>
              </button>

              {/* Trust Badges alineados */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-2">
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheckIcon className="w-5 h-5 text-slate-300" />
                  <span>Compra Segura</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <TruckIcon className="w-5 h-5 text-slate-300" />
                  <span>Envíos a todo el país</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <SparklesIcon className="w-5 h-5 text-slate-300" />
                  <span>Hecho en Uruguay</span>
                </div>
              </div>
            </div>


          </div>
        </div>

        {/* --- ESTRUCTURA PARA MÓVIL (hasta md) --- */}
        <div className="md:hidden mt-0 pb-80 bg-white">

          {/* Carrusel Full-Width Edge-to-Edge */}
          <div className="relative w-full aspect-square bg-[#F9F9F9] overflow-hidden">
            {activeImage === PREVIEW_MARKER && product.videoPreviewUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={product.videoPreviewUrl}
                alt={`Preview animado de ${product.nombre}`}
                className="h-full w-full object-cover"
              />
            ) : activeImage === VIDEO_MARKER && product.videoUrl ? (
              <ProductVideo
                videoUrl={product.videoUrl}
                alt={`Video de ${product.nombre}`}
              />
            ) : (
              <OptimizedImage
                key={activeImage}
                src={activeImage}
                alt={product.alt || product.nombre}
                fill
                sizes="100vw"
                style={{ objectFit: 'cover' }}
                className={`transition-opacity duration-300 ${isAnimating ? 'opacity-80' : 'opacity-100'}`}
                priority
                onLoadingComplete={() => setIsAnimating(false)}
              />
            )}

            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              {activeImage === PREVIEW_MARKER ? (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : activeImage === VIDEO_MARKER ? (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : null}
              <span>{allProductMedia.indexOf(activeImage) + 1} / {allProductMedia.length}</span>
            </div>
          </div>

          {/* Contenedor de Info Móvil */}
          <div className="px-5 pt-6 flex flex-col gap-6">

            {/* Header Móvil */}
            <div>
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-3xl font-black font-heading text-slate-900 leading-tight w-[70%]">
                  {product.nombre}
                </h1>
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-bold text-slate-900">$ {totalPrice}</span>
                  <div className="flex items-center gap-1">
                    <StarIcon className="w-3 h-3 text-amarillo fill-amarillo" />
                    <span className="text-xs text-slate-500 font-medium">{averageRating}</span>
                  </div>
                </div>
              </div>

              {product.descripcionBreve && (
                <p className="text-slate-500 text-sm leading-relaxed mt-2 border-b border-slate-100 pb-4">
                  {product.descripcionBreve}
                </p>
              )}
            </div>

            {/* Mobile Trust Badges Compact */}
            <div className="flex items-center justify-between gap-2 py-3 bg-slate-50 px-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2">
                <TruckIcon className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Envíos a todo el país</span>
              </div>
              <div className="w-[1px] h-4 bg-slate-200"></div>
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Hecho en Uruguay</span>
              </div>
            </div>
            {/* Mobile Customization Groups */}
            <div className="flex flex-col gap-6 mt-6">
              {orderedCustomizationGroups.map((group, i) => {
                const groupNumber = i + 1;
                const groupTitle = customGroupTitles[group.name] || group.name;

                // 1. Diseño de Tapa (Galería Especial)
                if (group.name === 'Diseño de Tapa') {
                  return (
                    <div key={group.name} className="flex flex-col gap-3">
                      <NewCoverDesignGallery
                        groupName={`${groupNumber}. ${groupTitle}`}
                        options={(group.options || []).map(opt => ({ name: opt.name, image: opt.image || '', priceModifier: opt.priceModifier || 0 }))}
                        onSelectOption={(option) => handleCoverDesignSelect(group.name, option)}
                        selectedOptionName={selections[group.name]}
                      />
                    </div>
                  );
                }

                // 2. Campos de Texto (Nombre, Frase)
                if (group.type === 'text') {
                  return (
                    <div key={group.name} className="flex flex-col gap-3">
                      <h3 className="font-bold text-base text-slate-900 uppercase tracking-wide flex items-center justify-between">
                        <span>{groupNumber}. {groupTitle}</span>
                        {group.required && <span className="text-[10px] text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full font-bold">Requerido</span>}
                      </h3>
                      <input
                        type="text"
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                        placeholder={`Escribe ${group.name}...`}
                        value={selections[group.name] || ''}
                        onChange={(e) => handleSelectionChange(group.name, e.target.value)}
                      />
                    </div>
                  );
                }

                // 3. Otros Selectores Especiales (Grid/Color para visuales)
                let selectorType: 'text' | 'button' | 'color' | 'grid' = 'button';
                let isVisualSelector = false;

                if (group.name.toLowerCase().includes('interior') || group.name.toLowerCase().includes('diseño')) {
                  selectorType = 'grid';
                  isVisualSelector = true;
                }
                else if (group.name.toLowerCase().includes('wire') || group.name.toLowerCase().includes('color')) {
                  selectorType = 'color';
                  isVisualSelector = true;
                }

                if (isVisualSelector) {
                  return (
                    <div key={group.name}>
                      <VisualOptionSelector
                        type={selectorType}
                        title={`${groupNumber}. ${groupTitle}`}
                        required={group.required}
                        options={(group.options || []).map(opt => ({
                          name: opt.name,
                          priceModifier: opt.priceModifier,
                          image: opt.image,
                          color: opt.color
                        }))}
                        selectedOption={selections[group.name]}
                        onSelect={(value) => handleSelectionChange(group.name, value)}
                      />
                    </div>
                  );
                }

                // 4. Fallback: Botones Simples (Elástico, Tipo de Tapa, etc.)
                return (
                  <div key={group.name} className="flex flex-col gap-3">
                    <h3 className="font-bold text-base text-slate-900 uppercase tracking-wide flex items-center justify-between">
                      <span>{groupNumber}. {groupTitle}</span>
                      {group.required && <span className="text-[10px] text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full font-bold">Requerido</span>}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {(group.options || []).map((option) => (
                        <button
                          key={option.name}
                          onClick={() => handleSelectionChange(group.name, option.name)}
                          className={`px-5 py-3 rounded-lg border-2 text-sm font-bold transition-all duration-200 active:scale-95 ${selections[group.name] === option.name
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:text-slate-900'
                            }`}
                        >
                          {option.name}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* --- Botones de Acción Móvil --- */}
            {/* --- Sticky Bottom Bar Móvil --- */}
            <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-[999] bg-white border-t border-slate-100 p-4 shadow-[0_-15px_40px_rgba(0,0,0,0.15)] rounded-t-3xl">
              <button
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white text-lg font-bold py-4 rounded-full shadow-lg shadow-pink-500/30 active:scale-95 transition-all flex justify-center items-center gap-3"
              >
                <span>Añadir al carrito</span>
                <span className="text-white/40">|</span>
                <span>$U {totalPrice}</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* --- CONTENIDO DETALLADO COMÚN --- */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-32 md:mb-20">
        <ProductDetailedContent product={product} reviews={reviews} reviewCount={reviewCount} />
      </div>

      {
        relatedProducts.length > 0 && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <section className="mt-16">
              <h2 className="text-3xl font-semibold mb-8 text-center">Productos relacionados</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {relatedProducts.map((p) => (
                  <div key={p._id} className="h-full">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </section>
          </div>
        )
      }

      {/* Modal de acceso sublimación */}
      <SublimationAccessModal
        isOpen={sublimationModalOpen}
        onClose={() => setSublimationModalOpen(false)}
        onSuccess={() => {
          setHasWholesalerAccess(true);
          setSublimationModalOpen(false);
        }}
      />
    </>
  )
}


export const getStaticPaths: GetStaticPaths = async () => {
  await connectDB()
  const products = await Product.find({}).lean()

  const paths = products.map((product) => ({
    params: { slug: product.slug },
  }))

  return {
    paths,
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { slug } = context.params as { slug: string };

  // --- START: REDIRECT/NOINDEX LOGIC FOR OLD ID-BASED URLs ---
  // Check if the slug could be a MongoDB ObjectId
  if (mongoose.Types.ObjectId.isValid(slug)) {
    await connectDB();
    const productById = await Product.findById(slug).lean();

    // If a product is found with this ID, and it has a category slug, redirect to the new URL structure
    if (productById && productById.categoria && productById.slug) {
      const newUrl = `/productos/${productById.categoria}/${productById.slug}`;
      return {
        redirect: {
          destination: newUrl,
          permanent: true, // 301 Permanent Redirect
        },
      };
    } else {
      // If it's a valid ObjectId but no product is found, or data is missing,
      // return a 404 with noindex to prevent indexing of these old invalid URLs.
      return {
        props: {
          product: null,
          relatedProducts: [],
          reviews: [],
          reviewCount: 0,
          averageRating: "0.0",
          mainCategory: null,
          subCategory: null,
          noindex: true, // Signal to the component to add noindex tag
        },
        revalidate: 3600, // Still revalidate to pick up changes if product is added/fixed
      };
    }
  }
  // --- END: REDIRECT/NOINDEX LOGIC ---

  if (!slug || typeof slug !== 'string') {
    return { notFound: true }
  }

  try {
    await connectDB()

    // If it's not an ID or no product was found by ID, proceed with finding by slug
    const productData = await Product.findOne({ slug }).lean()

    if (!productData) {
      return { notFound: true }
    }

    const product = JSON.parse(JSON.stringify(productData))

    // Combine static and dynamic customization groups
    const staticGroups = product.customizationGroups || [];
    const allCoverDesigns = [];

    if (product.coverDesignGroupNames && product.coverDesignGroupNames.length > 0) {
      for (const groupName of product.coverDesignGroupNames) {
        const designs = await CoverDesign.find({ groups: groupName }).lean();
        allCoverDesigns.push(...designs);
      }
    }

    const coverDesignGroups = [];
    if (allCoverDesigns.length > 0) {
      coverDesignGroups.push({
        name: 'Diseño de Tapa',
        type: 'cover-design',
        options: allCoverDesigns.map(d => ({
          name: d.name,
          image: d.imageUrl,
          priceModifier: 0 // O el modificador de precio si lo tienes
        })),
      });
    }

    product.customizationGroups = [...staticGroups, ...coverDesignGroups];

    let mainCategory = null;
    if (product.categoria) {
      mainCategory = await Category.findOne({ slug: product.categoria }).lean();
    }

    let subCategory = null;
    if (product.subCategoria && product.subCategoria.length > 0) {
      // Asumiendo que queremos la primera subcategoría para la miga de pan
      subCategory = await Category.findOne({ slug: product.subCategoria[0] }).lean();
    }

    // Fetch approved reviews
    const reviewsData = await Review.find({ product: product._id, isApproved: true })
      .populate('product', 'nombre imageUrl slug') // Populate product with necessary fields
      .sort({ createdAt: -1 })
      .lean();
    const reviews = JSON.parse(JSON.stringify(reviewsData));

    // Calculate average rating from approved reviews
    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0
      ? reviews.reduce((acc: number, item: IReview) => item.rating + acc, 0) / reviewCount
      : 0;

    let relatedProductsData: IProduct[] = []
    if (product.categoria) {
      relatedProductsData = await Product.find({
        categoria: product.categoria,
        _id: { $ne: new mongoose.Types.ObjectId(product._id) },
      })
        .limit(4)
        .lean()
    }

    const relatedProducts = JSON.parse(JSON.stringify(relatedProductsData))

    return {
      props: {
        product,
        relatedProducts,
        reviews,
        reviewCount,
        averageRating: averageRating.toFixed(1),
        mainCategory: JSON.parse(JSON.stringify(mainCategory)),
        subCategory: JSON.parse(JSON.stringify(subCategory)),
      },
      revalidate: 60, // Revalidar cada 60 segundos
    }
  } catch (error) {
    console.error(`Error fetching product details for slug: ${slug}`, error)
    return { notFound: true }
  }
}

import { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import ProductCard from '../../../components/ProductCard';
import VisualOptionSelector from '../../../components/VisualOptionSelector';
import { useRouter } from 'next/router'
import { useCart } from '../../../context/CartContext'
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, ShieldCheckIcon, TruckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import SeoMeta from '../../../components/SeoMeta'
import Breadcrumbs from '../../../components/Breadcrumbs'
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
  const [isClient, setIsClient] = useState(false);
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
  const [activeImage, setActiveImage] = useState(product?.imageUrl || '/placeholder.png');
  const [isAnimating, setIsAnimating] = useState(false);
  const addToCartRef = useRef<HTMLDivElement>(null);
  const desktopCarouselRef = useRef<HTMLDivElement>(null);
  const mobileCarouselRef = useRef<HTMLDivElement>(null);

  const [showDesktopLeftArrow, setShowDesktopLeftArrow] = useState(false);
  const [showDesktopRightArrow, setShowDesktopRightArrow] = useState(false);
  const [showMobileLeftArrow, setShowMobileLeftArrow] = useState(false);
  const [showMobileRightArrow, setShowMobileRightArrow] = useState(false);
  const [activeTab, setActiveTab] = useState('descripcion');

  const [tapaSeleccionada, setTapaSeleccionada] = useState<any>(null);

  useEffect(() => {
    setIsClient(true); // Indicar que el componente se ha montado en el cliente
  }, []);

  const TabButton = ({ tabName, label }: { tabName: string; label: string }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 text-sm sm:text-base font-semibold transition-colors duration-300 whitespace-nowrap ${activeTab === tabName
        ? 'border-b-2 border-pink-500 text-pink-600'
        : 'text-gray-500 hover:text-gray-800'
        }`}
    >
      {label}
    </button>
  );


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

  const allProductImages = useMemo(() => {
    const images = new Set<string>();
    if (product?.imageUrl) images.add(product.imageUrl);
    if (product?.images) product.images.forEach(img => images.add(img));
    return Array.from(images);
  }, [product?.imageUrl, product?.images]);

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
      setActiveImage(allProductImages[0] || '/placeholder.png');
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

  let faqSchema = null;
  if (product.faqs && product.faqs.length > 0) {
    faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: product.faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    };
  }

  return (
    <>
      <SeoMeta
        title={product.seoTitle || product.nombre}
        description={product.seoDescription || product.descripcion}
        image={product.imageUrl}
      />
      <Head>
        {noindex && <meta name="robots" content="noindex" />}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: product.nombre,
              image: allProductImages.map(img => img.startsWith('http') ? img : `https://www.papeleriapersonalizada.uy${img}`),
              description: product.seoDescription || product.descripcion,
              sku: product._id,
              brand: {
                '@type': 'Brand',
                name: 'Kamaluso',
              },
              offers: {
                '@type': 'Offer',
                url: `https://www.papeleriapersonalizada.uy/productos/detail/${product.slug}`,
                priceCurrency: 'UYU',
                price: product.basePrice,
                availability: 'https://schema.org/InStock',
                itemCondition: 'https://schema.org/NewCondition',
              },
              aggregateRating: reviewCount > 0 ? {
                '@type': 'AggregateRating',
                ratingValue: averageRating,
                reviewCount: reviewCount,
              } : undefined,
            }),
          }}
          key="product-schema"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
          key="breadcrumb-jsonld"
        />
        {faqSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            key="faq-jsonld"
          />
        )}
      </Head>

      <div className="bg-white pt-24">
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
        <div className="hidden md:grid mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid-cols-2 gap-14 mt-6">
          {/* Columna Izquierda Pegajosa (Imagen + Miniaturas) */}
          <div className="md:sticky top-28 self-start">
            <div className="relative w-full max-w-md lg:max-w-lg aspect-square rounded-2xl overflow-hidden shadow-lg mb-4 group mx-auto">
              <Image
                key={activeImage}
                src={activeImage}
                alt={product.alt || product.nombre}
                fill
                sizes="(max-width: 768px) 90vw, 50vw"
                style={{ objectFit: 'cover' }}
                className={`transition-opacity duration-500 ${isAnimating ? 'opacity-50' : 'opacity-100'}`}
                priority
                onLoadingComplete={() => setIsAnimating(false)}
              />
              {allProductImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/50 rounded-full p-2 text-gray-800 hover:bg-white/80 transition-opacity opacity-0 group-hover:opacity-100 z-20"
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeftIcon className="h-6 w-6" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigateImage('next'); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/50 rounded-full p-2 text-gray-800 hover:bg-white/80 transition-opacity opacity-0 group-hover:opacity-100 z-20"
                    aria-label="Siguiente imagen"
                  >
                    <ChevronRightIcon className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Miniaturas para Escritorio */}
            {allProductImages.length > 1 && (
              <div className="relative w-full max-w-md lg:max-w-lg flex items-center justify-center mx-auto mt-4 group/thumbnails">

                {/* Gradient Masks */}
                <div className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none transition-opacity duration-300 ${showDesktopLeftArrow ? 'opacity-100' : 'opacity-0'}`} />
                <div className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none transition-opacity duration-300 ${showDesktopRightArrow ? 'opacity-100' : 'opacity-0'}`} />

                {/* Left Arrow */}
                <button
                  onClick={() => scrollThumbnails(desktopCarouselRef, 'left')}
                  className={`absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-1.5 shadow-md border border-gray-100 z-20 transition-all duration-200 transform ${showDesktopLeftArrow ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'}`}
                  aria-label="Scroll left"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>

                <div
                  ref={desktopCarouselRef}
                  tabIndex={0}
                  className="flex flex-nowrap gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-2 px-1 w-full scroll-smooth focus:outline-none"
                >
                  {allProductImages.map((img, index) => (
                    <div
                      key={index}
                      id={`thumbnail-desktop-${index}`}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden cursor-pointer snap-start flex-shrink-0 transition-all duration-300 focus:outline-none transform ${activeImage === img ? 'ring-2 ring-pink-500 scale-105' : 'hover:opacity-80 hover:scale-105 opacity-70'}`}
                      onClick={() => handleImageChange(img)}
                    >
                      <Image
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        sizes="80px"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>

                {/* Right Arrow */}
                <button
                  onClick={() => scrollThumbnails(desktopCarouselRef, 'right')}
                  className={`absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-1.5 shadow-md border border-gray-100 z-20 transition-all duration-200 transform ${showDesktopRightArrow ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'}`}
                  aria-label="Scroll right"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Columna Derecha con Scroll */}
          <div className="min-w-0 space-y-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{product.nombre}</h1>
            <div className="flex items-center">
              <StarRating rating={parseFloat(averageRating)} />
              <span className="ml-2 text-sm text-gray-600">({reviewCount} {reviewCount === 1 ? 'opinión' : 'opiniones'})</span>
            </div>
            <p className="text-3xl font-semibold text-pink-500 hidden md:block">$U {totalPrice}</p>

            {product.descripcionBreve && (
              <p className="text-gray-600 text-lg leading-relaxed">{product.descripcionBreve}</p>
            )}

            {/* --- Grupos de Personalización --- */}
            <div ref={addToCartRef} className="space-y-6">
              {orderedCustomizationGroups.map((group, index) => {
                const groupNumber = index + 1;
                const isCoverDesignGroup = group.name.startsWith('Diseño de Tapa');

                if (isCoverDesignGroup) {
                  const groupTitle = customGroupTitles['Diseño de Tapa'] || group.name.replace('Diseño de Tapa - ', '');
                  return (
                    <div key={group.name}>
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
                    <div key={group.name}>
                      <h3 className="font-bold text-lg text-gray-800 mb-2">{groupNumber}. {groupTitle}{group.required && <span className="text-red-500 ml-1">*</span>}</h3>
                      {group.type === 'text' ? (
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                          placeholder="Escribe aquí..."
                          value={selections[group.name] || ''}
                          onChange={(e) => handleSelectionChange(group.name, e.target.value)}
                        />
                      ) : (
                        <div className="flex flex-wrap gap-3">
                          {(group.options || []).map((option) => (
                            <button
                              key={option.name}
                              onClick={() => handleSelectionChange(group.name, option.name)}
                              className={`px-6 py-3 rounded-lg border text-base font-medium transition-colors ${selections[group.name] === option.name ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
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
            <div className="hidden md:flex flex-col sm:flex-row gap-4 mt-8">
              <button onClick={handleAddToCart} className="w-full sm:w-auto bg-pink-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:bg-pink-600 transition flex-grow">
                Agregar al carrito
              </button>
            </div>

            {/* Trust Badges (Desktop) */}
            <div className="hidden md:flex items-center gap-6 mt-6 pt-6 border-t border-gray-100 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-verde" />
                <span>Compra 100% Segura</span>
              </div>
              <div className="flex items-center gap-2">
                <TruckIcon className="w-5 h-5 text-azul" />
                <span>Envíos a todo el país</span>
              </div>
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-amarillo" />
                <span>Calidad Garantizada</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- ESTRUCTURA PARA MÓVIL (hasta md) --- */}
        <div className="md:hidden mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-2">
          {/* Contenedor de Imagen Principal Pegajosa */}
          <div className="sticky top-16 z-40 bg-white pb-4">
            <div className="relative w-full max-w-md lg:max-w-lg aspect-square rounded-2xl overflow-hidden shadow-lg group mx-auto">
              <Image
                key={activeImage}
                src={activeImage}
                alt={product.alt || product.nombre}
                fill
                sizes="(max-width: 768px) 90vw, 50vw"
                style={{ objectFit: 'cover' }}
                className={`transition-opacity duration-500 ${isAnimating ? 'opacity-50' : 'opacity-100'}`}
                priority
                onLoadingComplete={() => setIsAnimating(false)}
              />
              {allProductImages.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/50 rounded-full p-2 text-gray-800 hover:bg-white/80 transition-opacity opacity-0 group-hover:opacity-100 z-20" aria-label="Imagen anterior">
                    <ChevronLeftIcon className="h-6 w-6" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); navigateImage('next'); }} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/50 rounded-full p-2 text-gray-800 hover:bg-white/80 transition-opacity opacity-0 group-hover:opacity-100 z-20" aria-label="Siguiente imagen">
                    <ChevronRightIcon className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Contenido con Scroll (Miniaturas, Info, Opciones) */}
          <div className="min-w-0 space-y-8 mt-4">
            {/* Miniaturas para Móvil */}
            {allProductImages.length > 1 && (
              <div className="relative w-full max-w-md lg:max-w-lg flex items-center justify-center mx-auto">
                {/* Gradient Masks */}
                <div className={`absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none transition-opacity duration-300 ${showMobileLeftArrow ? 'opacity-100' : 'opacity-0'}`} />
                <div className={`absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none transition-opacity duration-300 ${showMobileRightArrow ? 'opacity-100' : 'opacity-0'}`} />

                {showMobileLeftArrow && (
                  <button onClick={() => scrollThumbnails(mobileCarouselRef, 'left')} className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1.5 z-20 shadow-md border border-gray-100">
                    <ChevronLeftIcon className="h-5 w-5 text-gray-700" />
                  </button>
                )}
                <div ref={mobileCarouselRef} tabIndex={0} className="flex flex-nowrap gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-2 px-4 w-full scroll-smooth focus:outline-none">
                  {allProductImages.map((img, index) => (
                    <div
                      key={index}
                      id={`thumbnail-mobile-${index}`}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden cursor-pointer snap-start flex-shrink-0 transition-all duration-300 focus:outline-none ${activeImage === img ? 'ring-2 ring-pink-500 scale-105' : 'hover:opacity-80 opacity-80'}`}
                      onClick={() => handleImageChange(img)}
                    >
                      <Image src={img} alt={`Thumbnail ${index + 1}`} fill sizes="80px" style={{ objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
                {showMobileRightArrow && (
                  <button onClick={() => scrollThumbnails(mobileCarouselRef, 'right')} className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1.5 z-20 shadow-md border border-gray-100">
                    <ChevronRightIcon className="h-5 w-5 text-gray-700" />
                  </button>
                )}
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{product.nombre}</h1>
            <div className="flex items-center">
              <StarRating rating={parseFloat(averageRating)} />
              <span className="ml-2 text-sm text-gray-600">({reviewCount} {reviewCount === 1 ? 'opinión' : 'opiniones'})</span>
            </div>
            <p className="text-3xl font-semibold text-pink-500 hidden md:block">$U {totalPrice}</p>

            {product.descripcionBreve && (
              <p className="text-gray-600 text-lg leading-relaxed">{product.descripcionBreve}</p>
            )}

            {/* --- Grupos de Personalización --- */}
            <div ref={addToCartRef} className="space-y-6">
              {orderedCustomizationGroups.map((group, index) => {
                const groupNumber = index + 1;
                const isCoverDesignGroup = group.name.startsWith('Diseño de Tapa');

                if (isCoverDesignGroup) {
                  const groupTitle = customGroupTitles['Diseño de Tapa'] || group.name.replace('Diseño de Tapa - ', '');
                  return (
                    <div key={group.name}>
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

                  // Determine visual type based on group name
                  let selectorType: 'grid' | 'color' | 'text' | 'button' = 'button';
                  if (group.type === 'text') selectorType = 'text';
                  else if (group.name.toLowerCase().includes('interior') || group.name.toLowerCase().includes('diseño')) selectorType = 'grid';
                  else if (group.name.toLowerCase().includes('wire') || group.name.toLowerCase().includes('elástico') || group.name.toLowerCase().includes('color')) selectorType = 'color';

                  return (
                    <div key={group.name}>
                      <VisualOptionSelector
                        type={selectorType}
                        title={`${groupNumber}. ${groupTitle}`}
                        required={group.required}
                        options={(group.options || []).map(opt => ({
                          name: opt.name,
                          priceModifier: opt.priceModifier,
                          // For grid types, we might want to map to specific images if available, 
                          // otherwise VisualOptionSelector handles placeholders.
                          // For color types, VisualOptionSelector handles color mapping by name.
                        }))}
                        selectedOption={selections[group.name]}
                        onSelect={(value) => handleSelectionChange(group.name, value)}
                      />
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </div>

        {/* --- CONTENIDO COMÚN (Sección de Pestañas y Relacionados) --- */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="w-full mt-8 md:mt-16">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex gap-x-4 sm:gap-x-6 overflow-x-auto scrollbar-hide" aria-label="Tabs">
                <TabButton tabName="descripcion" label="Descripción" />
                {product.puntosClave && product.puntosClave.length > 0 && (
                  <TabButton tabName="puntosClave" label="Puntos Clave" />
                )}
                {product.faqs && product.faqs.length > 0 && (
                  <TabButton tabName="faqs" label="Preguntas Frecuentes" />
                )}
                {product.useCases && product.useCases.length > 0 && (
                  <TabButton tabName="useCases" label="Casos de Uso" />
                )}
                <TabButton tabName="reseñas" label={`Reseñas (${reviewCount})`} />
              </nav>
            </div>

            <div className="py-8">
              {/* ... content ... */}
            </div>


            {/* Sticky Mobile Add to Cart Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 md:hidden z-50 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.1)] safe-area-bottom">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium">Total a pagar</span>
                <span className="text-xl font-bold text-rosa">$U {totalPrice}</span>
              </div>
              <button
                onClick={handleAddToCart}
                className="bg-rosa text-white px-8 py-3 rounded-xl font-bold shadow-kamalusoPink hover:bg-pink-600 transition-all active:scale-95"
              >
                Agregar
              </button>
            </div>

            {activeTab === 'descripcion' && (
              <div className="prose max-w-none text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: product.descripcion || product.descripcionExtensa || '' }} />
            )}
            {activeTab === 'puntosClave' && (
              <div>
                <ul className="space-y-4">
                  {product.puntosClave?.map((punto, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-6 w-6 text-pink-500 mr-4 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 text-lg">{punto}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {activeTab === 'reseñas' && (
              <div id="reviews-section" className="max-w-4xl mx-auto">
                <div className="space-y-12">
                  <ReviewForm productId={product._id} onReviewSubmit={() => window.location.reload()} />
                  <ReviewList reviews={reviews} />
                </div>
              </div>
            )}
            {activeTab === 'faqs' && (
              <FaqSection faqs={product.faqs || []} />
            )}
            {activeTab === 'useCases' && (
              <UseCasesSection useCases={product.useCases || []} />
            )}
          </div>
        </div >
      </div >

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

      {/* --- Botón de Compra Pegajoso para Móviles --- */}

      {/* --- Botón de Compra Pegajoso para Móviles --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-40 pb-safe">
        <div className="flex justify-between items-center gap-4">
          {/* Precio a la izquierda */}
          <div className="text-left flex-1">
            <p className="text-xs text-gray-500 -mb-1">Total</p>
            <p className="font-bold text-2xl text-pink-500">$U {totalPrice}</p>
          </div>
          {/* Botón de Añadir a la derecha (principal) */}
          <button
            onClick={handleAddToCart}
            className="bg-pink-500 text-white px-4 py-4 rounded-xl font-semibold shadow-lg hover:bg-pink-600 transition text-lg whitespace-nowrap"
          >
            Agregar al carrito
          </button>
        </div>
      </div>

      {/* --- Botón Flotante de WhatsApp para Móviles --- */}
      <a
        href="https://wa.me/59898615074?text=%C2%A1Hola!%20Vi%20sus%20productos%20en%20Papeler%C3%ADa%20Personalizada%20y%20quiero%20m%C3%A1s%20info."
        target="_blank"
        rel="noopener noreferrer"
        className="md:hidden fixed bottom-20 right-4 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-colors duration-300 z-50 flex items-center justify-center"
        aria-label="Contactar por WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"></path></svg>
      </a>

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

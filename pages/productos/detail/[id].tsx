import { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import Navbar from '../../../components/Navbar'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCart } from '../../../context/CartContext'
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import SeoMeta from '../../../components/SeoMeta'
import Breadcrumbs from '../../../components/Breadcrumbs'
import StarRating from '../../../components/StarRating';
import ReviewList from '../../../components/ReviewList';
import ReviewForm from '../../../components/ReviewForm';
import toast from 'react-hot-toast'
import connectDB from '../../../lib/mongoose'
import Product, { IProduct } from '../../../models/Product'
import Review, { IReview } from '../../../models/Review';
import Category from '../../../models/Category'; // Importar el modelo Category
import mongoose from 'mongoose'
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import CoverDesignGallery from '../../../components/CoverDesignGallery';
import InteriorDesignGallery from '../../../components/InteriorDesignGallery';

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
}

export default function ProductDetailPage({ product, relatedProducts, reviews, reviewCount, averageRating, mainCategory, subCategory }: Props) {
  const { addToCart } = useCart()
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    undefined,
  )
  const [finish, setFinish] = useState<string | null>(null)
  const [open, setOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- SSR-SAFE STATE INITIALIZATION ---
  const [selections, setSelections] = useState<Record<string, string>>({});

  // New useEffect to set initial selections based on product customization groups
  useEffect(() => {
    if (product) {
      const initialSelections: Record<string, string> = {};
      const tipoTapaGroup = product.customizationGroups?.find(g => g.name === 'Tipo de Tapa');
      const tapaDuraOption = tipoTapaGroup?.options.find(o => o.name === 'Tapa Dura');
      if (tipoTapaGroup && tapaDuraOption) {
        initialSelections['Tipo de Tapa'] = 'Tapa Dura';
      }
      setSelections(initialSelections);
    }
  }, [product]);

  const [totalPrice, setTotalPrice] = useState(product?.basePrice || 0);
  const [activeImage, setActiveImage] = useState(
    product?.imageUrl || '/placeholder.png'
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showStickyButton, setShowStickyButton] = useState(false);
  const addToCartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (addToCartRef.current) {
        const { top } = addToCartRef.current.getBoundingClientRect();
        // Show sticky button if the top of the original button is off-screen
        setShowStickyButton(top < window.innerHeight);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isSpecialProduct = useMemo(() => {
    return product?.customizationGroups?.some(group => 
      group.name.startsWith('Diseño de Tapa') || group.name === 'Interiores'
    ) || false;
  }, [product?.customizationGroups]);

  const allProductImages = useMemo(() => {
    const images = new Set<string>();
    if (product?.imageUrl) {
      images.add(product.imageUrl);
    }
    if (product?.images && product.images.length > 0) {
      product.images.forEach(img => images.add(img));
    }
    // Ensure main image is first, then other unique images
    const finalImages = product?.imageUrl ? [product.imageUrl] : [];
    images.forEach(img => {
      if (img !== product?.imageUrl) {
        finalImages.push(img);
      }
    });
    return finalImages;
  }, [product?.imageUrl, product?.images]);

  // New useEffect to set initial activeImage based on product type
  useEffect(() => {
    if (product) {
      if (isSpecialProduct) {
        setActiveImage(product.images?.[0] || product.imageUrl || '/placeholder.png');
      } else {
        setActiveImage(allProductImages[0] || '/placeholder.png');
      }
    }
  }, [product, isSpecialProduct, allProductImages]);

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const handleImageChange = useCallback((newImage: string) => {
    if (newImage !== activeImage) {
      setActiveImage(newImage);
      setIsAnimating(true);
    }
  }, [activeImage]);

  const handlePrevImage = useCallback(() => {
    if (!isSpecialProduct && allProductImages.length > 1) {
      const currentIndex = allProductImages.indexOf(activeImage);
      const prevIndex = (currentIndex - 1 + allProductImages.length) % allProductImages.length;
      handleImageChange(allProductImages[prevIndex]);
    }
  }, [activeImage, allProductImages, handleImageChange, isSpecialProduct]);

  const handleNextImage = useCallback(() => {
    if (!isSpecialProduct && allProductImages.length > 1) {
      const currentIndex = allProductImages.indexOf(activeImage);
      const nextIndex = (currentIndex + 1) % allProductImages.length;
      handleImageChange(allProductImages[nextIndex]);
    }
  }, [activeImage, allProductImages, handleImageChange, isSpecialProduct]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlePrevImage, handleNextImage]);

  // This effect now safely runs on the client after selections are made by the user
  useEffect(() => {
    if (!product) return;

    let currentPrice = product.basePrice || 0;
    let hasImageSelected = false;

    // Iterate through all selected options to calculate price
    product.customizationGroups?.forEach(group => {
      if (group.type === 'text') return; // Skip text type groups as they don't have options
      const selectedOptionName = selections[group.name];
      if (selectedOptionName) {
        const selectedOption = group.options.find(opt => opt.name === selectedOptionName);
        if (selectedOption) {
          currentPrice += selectedOption.priceModifier;
          if (selectedOption.image) {
            hasImageSelected = true;
          }
        }
      }
    });

    setTotalPrice(currentPrice);

    // If no image-bearing option is currently selected, revert to default product image
    // This logic only applies to special products where images are driven by customizations
    if (isSpecialProduct && !hasImageSelected && activeImage !== (product.images?.[0] || product?.imageUrl || '/placeholder.png')) {
      handleImageChange(product.images?.[0] || product?.imageUrl || '/placeholder.png');
    }

  }, [selections, product, activeImage, handleImageChange, isSpecialProduct]);


  const handleSelectionChange = (groupName: string, value: string) => {
    const trimmedGroupName = groupName.trim();
    const group = product?.customizationGroups?.find(g => g.name.trim() === trimmedGroupName);
    const finalValue = (group?.type === 'text') ? value : value.trim();

    setSelections(prev => {
      const newSelections: Record<string, string> = {
        ...prev,
        [trimmedGroupName]: finalValue,
      };

      // Deselect options of dependent groups when the parent changes
      product?.customizationGroups?.forEach(group => {
        if (group.dependsOn?.groupName === trimmedGroupName && newSelections[group.name]) {
          delete newSelections[group.name];
        }
      });

      // Explicitly update activeImage if the newly selected option has one, only for special products
      const group = product?.customizationGroups?.find(g => g.name.trim() === trimmedGroupName);
      if (group?.type !== 'text' && isSpecialProduct) {
        const option = group?.options.find(o => o.name.trim() === finalValue);
        if (option?.image) {
          handleImageChange(option.image);
        }
      }

      return newSelections;
    });
  };

  const displayGroups = useMemo(() => {
    if (!product?.customizationGroups) return [];

    const allGroups = [...product.customizationGroups];
    const orderedGroups = [];
    const addedGroupNames = new Set<string>();

    const addGroup = (name: string, filterFn: (g: any) => boolean = (g) => g.name === name) => {
      const group = allGroups.find(filterFn);
      if (group && !addedGroupNames.has(group.name)) {
        orderedGroups.push(group);
        addedGroupNames.add(group.name);
      }
    };

    // 1. Tipo de Tapa
    addGroup('Tipo de Tapa');

    // 2. Textura de Tapa
    addGroup('Textura de Tapa');

    // 3. Elástico
    addGroup('Elástico');

    // 4. Interiores
    addGroup('Interiores');

    // 5. Diseño de Tapa (Dura/Flexible)
    allGroups.filter(g => g.name.startsWith('Diseño de Tapa')).forEach(group => {
      if (!addedGroupNames.has(group.name)) {
        orderedGroups.push(group);
        addedGroupNames.add(group.name);
      }
    });

    // 6. Add any other remaining groups that were not explicitly ordered
    allGroups.forEach(group => {
      if (!addedGroupNames.has(group.name)) {
        orderedGroups.push(group);
        addedGroupNames.add(group.name);
      }
    });

    return orderedGroups;
  }, [product?.customizationGroups]);

  useEffect(() => {
    if (product?.images?.[0]) {
      setSelectedImage(product.images[0])
    } else if (product?.imageUrl) {
      setSelectedImage(product.imageUrl)
    }
  }, [product])



  const getDisplayPrice = () => {
    if (!product) return null
    if (product.precioDura) return product.precioDura
    if (product.precioFlex) return product.precioFlex
    if (product.precio) return product.precio
    return null
  }

  const displayPrice = getDisplayPrice()

  const handleAddToCart = () => {
    if (product) {
      // --- VALIDATION LOGIC ---
      const visibleGroups = product.customizationGroups?.filter(group => {
        if (!group.dependsOn) return true; // Always include groups without dependencies
        const parentSelection = selections[group.dependsOn.groupName];
        return parentSelection === group.dependsOn.optionName;
      }) || [];

      for (const group of visibleGroups) {
        // Los grupos de texto son opcionales, no requieren selección
        if (group.type !== 'text' && !selections[group.name]) {
          toast.error(`Por favor, selecciona una opción para "${group.name}".`);
          return; // Stop if a selection is missing
        }
      }

      const itemToAdd = {
        _id: String(product._id),
        nombre: product.nombre,
        precio: totalPrice,
        imageUrl: activeImage,
        customizations: selections,
      };

      addToCart(itemToAdd);
      toast.success(`${product.nombre} ha sido agregado al carrito!`);
    }
  };

  if (router.isFallback) {
    return <div>Cargando...</div>
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center pt-32">
          <p className="text-gray-500 text-xl">Producto no encontrado.</p>
        </main>
      </>
    )
  }

  const pageTitle = product.seoTitle || `${product.nombre} | Kamaluso Papelería`
  const pageDescription =
    product.seoDescription ||
    product.descripcion ||
    'Encuentra los mejores artículos de papelería personalizada en Kamaluso.'
  const pageImage = product.images?.[0] || product.imageUrl || '/logo.webp'
  const canonicalUrl = `/productos/detail/${product._id}`
  const siteUrl = 'https://www.papeleriapersonalizada.uy'

  // --- Mis datos para los Breadcrumbs --- //
  const breadcrumbItems = [
    { name: 'Inicio', href: '/' },
  ];

  if (mainCategory) {
    breadcrumbItems.push({
      name: mainCategory.nombre,
      href: `/productos/${mainCategory.slug}`,
    });
  } else if (product.categoria) { // Fallback if mainCategory object not found but slug exists
    breadcrumbItems.push({
      name: product.categoria.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      href: `/productos/${product.categoria}`,
    });
  } else {
    breadcrumbItems.push({ name: 'Productos', href: '/productos' });
  }

  if (subCategory && mainCategory) { // Only add subcategory if main category is also present
    breadcrumbItems.push({
      name: subCategory.nombre,
      href: `/productos/${mainCategory.slug}/${subCategory.slug}`,
    });
  }

  breadcrumbItems.push({
    name: product.nombre,
    href: `/productos/detail/${product._id}`,
  });

  // --- Mi Schema para Google --- //

  // Aquí defino el schema del producto para que Google entienda mejor la información.
  const productSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.nombre,
    image: pageImage.startsWith('http') ? pageImage : `${siteUrl}${pageImage}`,
    description: pageDescription,
    sku: product._id,
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}${canonicalUrl}`,
      priceCurrency: 'UYU',
      price: displayPrice,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Kamaluso Papelería',
      },
    },
    aggregateRating: reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: averageRating,
      reviewCount: reviewCount,
    } : undefined,
    review: reviews.map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.user.name,
      },
      datePublished: new Date(review.createdAt).toISOString(),
      reviewBody: review.comment,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: '5',
        worstRating: '1',
      },
    })),
  }

  // Aquí defino el schema de los breadcrumbs para que Google los muestre en los resultados.
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.href}`,
    })),
  }

  return (
    <>
      <SeoMeta
        title={pageTitle}
        description={pageDescription}
        image={pageImage}
        url={canonicalUrl}
        type="product"
      />
      <Head>
        {/* Inyecto los datos estructurados en la página para que Google los lea */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
          key="product-jsonld"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
          key="breadcrumb-jsonld"
        />
      </Head>

      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-32 px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Breadcrumbs items={breadcrumbItems} />
          </div>

          {/* Contenedor Principal de la Grilla */}
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12">
            
            {/* --- Columna Izquierda: Carrusel de Imágenes --- */}
            <div className="w-full lg:sticky top-32 self-start">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="block w-full aspect-square relative rounded-2xl overflow-hidden shadow-lg cursor-zoom-in"
                >
                  <Image
                    key={activeImage}
                    src={activeImage}
                    alt={product.alt || product.nombre}
                    fill
                    sizes="(max-width: 767px) 400px, (max-width: 1023px) 800px, 640px"
                    style={{ objectFit: 'cover' }}
                    className="rounded-2xl"
                    priority // LCP Image
                  />
                </button>

                {!isSpecialProduct && allProductImages.length > 1 && (
                  <>
                    <button onClick={handlePrevImage} className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-40 hover:opacity-100 transition-opacity duration-300 z-10" aria-label="Imagen anterior">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={handleNextImage} className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-40 hover:opacity-100 transition-opacity duration-300 z-10" aria-label="Siguiente imagen">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </>
                )}
              </div>

              <Lightbox
                open={open}
                close={() => setOpen(false)}
                slides={allProductImages.map(img => ({ src: img.endsWith('.webp') ? `${img.slice(0, -5)}-1200w.webp` : img }))}
                index={allProductImages.indexOf(activeImage)}
              />

              {!isSpecialProduct && allProductImages.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                  {allProductImages.map((img, index) => (
                    <button key={index} type="button" onClick={() => handleImageChange(img)} className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 ${activeImage === img ? 'border-pink-500' : 'border-gray-300'} flex-shrink-0`}>
                      <Image src={img} alt={product.alt || product.nombre} fill sizes="100px" style={{ objectFit: 'cover' }} className="rounded-lg" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* --- Columna Derecha: Información y Personalización --- */}
            <div className="w-full mt-8 lg:mt-0">
              {reviewCount > 0 && (
                <div className="flex items-center mb-3">
                  <StarRating rating={parseFloat(averageRating)} />
                  <a href="#reviews-section" className="text-gray-600 ml-2 text-sm hover:underline">
                    ({reviewCount} {reviewCount === 1 ? 'opinión' : 'opiniones'})
                  </a>
                </div>
              )}
              <h1 className="text-2xl md:text-3xl font-bold mb-3">{product.nombre}</h1>
              
              {isClient ? (
                <p key={totalPrice} className="text-pink-500 font-bold text-4xl mb-6 transition-all duration-300 ease-in-out animate-pulse-once">
                  $U {totalPrice}
                </p>
              ) : (
                <p className="text-pink-500 font-bold text-4xl mb-6">
                  $U {product?.basePrice || 0}
                </p>
              )}

              {/* --- Opciones de Personalización --- */}
              <div className="space-y-5">
                {displayGroups.map((group) => {
                  const groupName = group.name.trim();
                  if (group.dependsOn) {
                    const parentSelection = selections[group.dependsOn.groupName];
                    if (parentSelection !== group.dependsOn.optionName) return null;
                  }

                  if (groupName.startsWith('Diseño de Tapa')) {
                    return (
                      <div key={groupName}>
                        <label className="block text-sm font-medium text-gray-800 mb-2">{groupName}</label>
                        <CoverDesignGallery options={group.options} selectedOption={selections[groupName]} onSelectOption={(optionName) => handleSelectionChange(groupName, optionName)} />
                      </div>
                    );
                  }

                  if (groupName === 'Interiores') {
                    return (
                      <div key={groupName}>
                        <label className="block text-sm font-medium text-gray-800 mb-2">{groupName}</label>
                        <InteriorDesignGallery options={group.options} selectedOption={selections[groupName]} onSelectOption={(optionName) => handleSelectionChange(groupName, optionName)} />
                      </div>
                    );
                  }

                  if (group.type === 'text') {
                    return (
                      <div key={groupName}>
                        <label htmlFor={groupName} className="block text-sm font-medium text-gray-800 mb-2">{groupName}</label>
                        <textarea
                          id={groupName}
                          value={selections[groupName] || ''}
                          onChange={(e) => handleSelectionChange(groupName, e.target.value)}
                          placeholder={group.value || 'Escribe tu texto aquí...'}
                          rows={3}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                        />
                      </div>
                    );
                  }

                  // --- Nuevo Renderizador de Botones Modernos ---
                  return (
                    <div key={groupName}>
                      <label className="block text-sm font-medium text-gray-800 mb-2">{groupName}</label>
                      <div className="flex flex-wrap gap-2">
                        {group.options.map((option: any) => {
                          const isSelected = selections[groupName] === option.name.trim();
                          return (
                            <button
                              key={option.name}
                              type="button"
                              onClick={() => handleSelectionChange(groupName, option.name)}
                              className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors duration-200 ${
                                isSelected
                                  ? 'bg-gray-900 text-white border-gray-900'
                                  : 'bg-white text-gray-800 border-gray-300 hover:border-gray-900'
                              }`}
                            >
                              {option.name}
                              {option.priceModifier > 0 && <span className="ml-1 font-normal text-xs"> (+ $U {option.priceModifier})</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* --- Botones de Acción --- */}
              <div ref={addToCartRef} className="flex flex-col sm:flex-row gap-4 mt-8">
                <button onClick={handleAddToCart} className="w-full sm:w-auto bg-pink-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:bg-pink-600 transition flex-grow">
                  Agregar al carrito
                </button>
                <button onClick={() => router.back()} className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold text-center hover:bg-gray-100 transition">
                  Ir atrás
                </button>
              </div>
            </div>

            {/* --- Fila Inferior: Descripción del Producto --- */}
            {product.descripcion && (
              <div className="lg:col-span-2 mt-12 pt-8 border-t">
                <h2 className="text-2xl font-bold mb-4">Descripción del Producto</h2>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: product.descripcion }} />
              </div>
            )}
          </div>
        </div>

        {/* --- Secciones Externas: Opiniones y Relacionados --- */}
        <section id="reviews-section" className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold mb-8 text-center">Opiniones de nuestros clientes</h2>
          <div className="space-y-12">
            <ReviewForm productId={product._id} onReviewSubmit={() => window.location.reload()} />
            <ReviewList reviews={reviews} />
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-3xl font-semibold mb-8 text-center">Productos relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {relatedProducts.map((p) => (
                <Link key={p._id} href={`/productos/detail/${p._id}`} className="block bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 group flex flex-col">
                  <div className="relative w-full aspect-square">
                    <Image
                      src={p.images?.[0] || p.imageUrl || '/placeholder.png'}
                      alt={p.nombre}
                      fill
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 25vw"
                      style={{ objectFit: 'cover' }}
                      className="group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-lg truncate text-gray-800 flex-grow">{p.nombre}</h3>
                    {getCardDisplayPrice(p) && <p className="text-pink-500 font-semibold mt-2">$U {getCardDisplayPrice(p)}</p>}
                  </div>
                  <div className="block w-full bg-pink-500 text-white px-4 py-3 font-medium text-center shadow-md rounded-b-2xl">
                    Ver más
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* --- Botón de Compra Pegajoso para Móviles --- */}
      {showStickyButton && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-40">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Precio Total</p>
              <p className="font-bold text-xl text-pink-500">$U {totalPrice}</p>
            </div>
            <button onClick={handleAddToCart} className="bg-pink-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:bg-pink-600 transition">
              Agregar al carrito
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  await connectDB()
  const products = await Product.find({}).lean()

  const paths = products.map((product) => ({
    params: { id: product._id.toString() },
  }))

  return {
    paths,
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { id } = context.params

  if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
    return { notFound: true }
  }

  try {
    await connectDB()

    const productData = await Product.findById(id).lean()

    if (!productData) {
      return { notFound: true }
    }

    const product = JSON.parse(JSON.stringify(productData))

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
    const reviewsData = await Review.find({ product: product._id, isApproved: true }).sort({ createdAt: -1 }).lean();
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
      revalidate: 3600, // Revalidate once per hour
    }
  } catch (error) {
    console.error(`Error fetching product details for id: ${id}`, error)
    return { notFound: true }
  }
}
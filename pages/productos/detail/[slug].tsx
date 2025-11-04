import { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCart } from '../../../context/CartContext'
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
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
import Lightbox, { Slide } from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import InteriorDesignGallery from '../../../components/InteriorDesignGallery';
import NewCoverDesignGallery, { DesignOption } from '../../../components/NewCoverDesignGallery';


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

export default function ProductDetailPage({ product, relatedProducts, reviews, reviewCount, averageRating, mainCategory, subCategory }: Props) {
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
  const [showStickyButton, setShowStickyButton] = useState(false);
  const addToCartRef = useRef<HTMLDivElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const thumbnailCarouselRef = useRef<HTMLDivElement>(null);
  const [showThumbnailLeftArrow, setShowThumbnailLeftArrow] = useState(false);
  const [showThumbnailRightArrow, setShowThumbnailRightArrow] = useState(false);
  const [activeTab, setActiveTab] = useState('descripcion');

  const TabButton = ({ tabName, label }: { tabName: string; label: string }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 text-sm sm:text-base font-semibold transition-colors duration-300 whitespace-nowrap ${
        activeTab === tabName
          ? 'border-b-2 border-pink-500 text-pink-600'
          : 'text-gray-500 hover:text-gray-800'
      }`}
    >
      {label}
    </button>
  );


  const checkForThumbnailScroll = useCallback(() => {
    const container = thumbnailCarouselRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setShowThumbnailLeftArrow(scrollLeft > 0);
      setShowThumbnailRightArrow(scrollLeft < scrollWidth - clientWidth - 1); // -1 for precision issues
    }
  }, []);

  const scrollThumbnails = (direction: 'left' | 'right') => {
    const container = thumbnailCarouselRef.current;
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
    const container = thumbnailCarouselRef.current;
    if (container) {
      checkForThumbnailScroll();
      window.addEventListener('resize', checkForThumbnailScroll);
      container.addEventListener('scroll', checkForThumbnailScroll);

      return () => {
        window.removeEventListener('resize', checkForThumbnailScroll);
        container.removeEventListener('scroll', checkForThumbnailScroll);
      };
    }
  }, [allProductImages, checkForThumbnailScroll]);

  useEffect(() => {
    if (product) {
      setActiveImage(allProductImages[0] || '/placeholder.png');
    }
  }, [product, allProductImages]);

  useEffect(() => {
    const handleScroll = () => {
      if (addToCartRef.current) {
        const { top } = addToCartRef.current.getBoundingClientRect();
        setShowStickyButton(top < window.innerHeight);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  useEffect(() => {
    if (!product) return;

    let currentPrice = product.basePrice || 0;
    product.customizationGroups?.forEach(group => {
      const selectedOptionName = selections[group.name];
      if (selectedOptionName) {
        const selectedOption = group.options.find(opt => opt.name === selectedOptionName);
        if (selectedOption) {
          currentPrice += selectedOption.priceModifier;
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



  const handleCoverDesignSelect = (groupName: string, option: DesignOption) => {
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



  return (
    <>
      <SeoMeta
        title={product.seoTitle || product.nombre}
        description={product.seoDescription || product.descripcion}
        image={product.imageUrl}
      />

      <div className="bg-white pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs items={breadcrumbs} />

          <div className="grid lg:grid-cols-2 gap-x-12 gap-y-8 mt-6">
            {/* --- Columna Izquierda: Galería de Imágenes --- */}
            <div className="flex flex-col items-center">
              <div className="relative w-full max-w-md lg:max-w-lg aspect-square rounded-2xl overflow-hidden shadow-lg mb-4">
                <Image
                  key={activeImage}
                  src={activeImage}
                  alt={product.alt || product.nombre}
                  fill
                  sizes="(max-width: 768px) 90vw, 50vw"
                  style={{ objectFit: 'cover' }}
                  className={`transition-opacity duration-500 ${isAnimating ? 'opacity-50' : 'opacity-100'}`}
                  priority
                  onClick={() => setLightboxOpen(true)}
                />
              </div>
              
              {allProductImages.length > 1 && (
                <div className="relative w-full max-w-md lg:max-w-lg flex items-center justify-center">
                  {showThumbnailLeftArrow && (
                    <button onClick={() => scrollThumbnails('left')} className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 z-10 shadow-md hover:bg-white">
                      <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
                    </button>
                  )}
                  <div ref={thumbnailCarouselRef} className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-2 px-1">
                    {allProductImages.map((img, index) => (
                      <div
                        key={index}
                        className={`relative w-20 h-20 rounded-lg overflow-hidden cursor-pointer snap-start flex-shrink-0 transition-all duration-200 ${activeImage === img ? 'ring-2 ring-pink-500 ring-offset-2' : 'hover:opacity-80'}`}
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
                  {showThumbnailRightArrow && (
                    <button onClick={() => scrollThumbnails('right')} className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 z-10 shadow-md hover:bg-white">
                      <ChevronRightIcon className="h-6 w-6 text-gray-700" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* --- Columna Derecha: Información y Controles --- */}
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{product.nombre}</h1>
              <div className="flex items-center mt-3">
                <StarRating rating={parseFloat(averageRating)} />
                <span className="ml-2 text-sm text-gray-600">({reviewCount} {reviewCount === 1 ? 'opinión' : 'opiniones'})</span>
              </div>
              <p className="text-3xl font-semibold text-pink-500 mt-4">$U {totalPrice}</p>

              {/* --- Descripción Breve --- */}
              {product.descripcionBreve && (
                <p className="text-gray-600 text-lg leading-relaxed mt-4">{product.descripcionBreve}</p>
              )}

              
              {/* --- Grupos de Personalización Unificados y Ordenados --- */}
              <div className="mt-6 space-y-6">
                {orderedCustomizationGroups.map((group, index) => {
                  const groupNumber = index + 1;
                  const isCoverDesignGroup = group.name.startsWith('Diseño de Tapa');

                  if (isCoverDesignGroup) {
                    const groupTitle = customGroupTitles['Diseño de Tapa'] || group.name.replace('Diseño de Tapa - ', '');
                    return (
                      <NewCoverDesignGallery
                        key={group.name}
                        groupName={`${groupNumber}. ${groupTitle}`}
                        options={(group.options || []).map(opt => ({ name: opt.name, image: opt.image || '', priceModifier: opt.priceModifier || 0 }))}
                        onSelectOption={(option) => handleCoverDesignSelect(group.name, option)}
                        selectedOptionName={selections[group.name]}
                      />
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
                                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${selections[group.name] === option.name ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
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
              <div ref={addToCartRef} className="flex flex-col sm:flex-row gap-4 mt-8">
                <button onClick={handleAddToCart} className="w-full sm:w-auto bg-pink-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:bg-pink-600 transition flex-grow">
                  Agregar al carrito
                </button>
                <button onClick={() => router.back()} className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold text-center hover:bg-gray-100 transition">
                  Ir atrás
                </button>
              </div>
            </div>

          </div>

          {/* --- Nueva Sección de Pestañas --- */}
          <div className="w-full mt-16">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex gap-x-4 sm:gap-x-6" aria-label="Tabs">
                <TabButton tabName="descripcion" label="Descripción" />
                {product.puntosClave && product.puntosClave.length > 0 && (
                  <TabButton tabName="puntosClave" label="Puntos Clave" />
                )}
                <TabButton tabName="reseñas" label={`Reseñas (${reviewCount})`} />
              </nav>
            </div>

            <div className="py-8">
              {activeTab === 'descripcion' && (
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: product.descripcionExtensa || product.descripcion || '' }} />
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
            </div>
          </div>

        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-3xl font-semibold mb-8 text-center">Productos relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {relatedProducts.map((p) => (
                <Link key={p._id} href={`/productos/detail/${p.slug}`} className="block bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 group flex flex-col">
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
      </div>

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
    params: { slug: product.slug },
  }))

  return {
    paths,
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { slug } = context.params

  if (!slug || typeof slug !== 'string') {
    return { notFound: true }
  }

  try {
    await connectDB()

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
      revalidate: 3600, // Revalidate once per hour
    }
  } catch (error) {
    console.error(`Error fetching product details for slug: ${slug}`, error)
    return { notFound: true }
  }
}
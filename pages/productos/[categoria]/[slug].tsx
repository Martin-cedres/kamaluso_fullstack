import { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Navbar from '../../../components/Navbar'
import Link from 'next/link'
import { useCart } from '../../../context/CartContext';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import connectDB from '../../../lib/mongoose';
import Product, { IProduct } from '../../../models/Product';
import Review, { IReview } from '../../../models/Review'; // Import Review model and interface
import { useRouter } from 'next/router';
import StarRating from '../../../components/StarRating';
import ReviewList from '../../../components/ReviewList';
import ReviewForm from '../../../components/ReviewForm';
import Breadcrumbs from '../../../components/Breadcrumbs';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import CoverDesignGallery from '../../../components/CoverDesignGallery';
import InteriorDesignGallery from '../../../components/InteriorDesignGallery';

interface ProductDetailProps {
  product: IProduct | null;
  reviews: IReview[];
  reviewCount: number;
  averageRating: string;
}

export default function ProductDetailPage({ product, reviews, reviewCount, averageRating }: ProductDetailProps) {
  const { addToCart } = useCart()
  const [open, setOpen] = useState(false);
  const router = useRouter()

  // --- SSR-SAFE STATE INITIALIZATION ---
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const initialSelections: Record<string, string> = {};
    const tipoTapaGroup = product?.customizationGroups?.find(g => g.name === 'Tipo de Tapa');
    const tapaDuraOption = tipoTapaGroup?.options.find(o => o.name === 'Tapa Dura');
    if (tipoTapaGroup && tapaDuraOption) {
      initialSelections['Tipo de Tapa'] = 'Tapa Dura';
    }
    return initialSelections;
  });
  const [totalPrice, setTotalPrice] = useState(product?.basePrice || 0);
  const [activeImage, setActiveImage] = useState(
    product?.images?.[0] || product?.imageUrl || '/placeholder.png'
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

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
  // This effect now safely runs on the client after selections are made by the user
  useEffect(() => {
    if (!product) return;

    let currentPrice = product.basePrice || 0;
    let hasImageSelected = false;

    // Iterate through all selected options to calculate price
    product.customizationGroups?.forEach(group => {
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
    if (!hasImageSelected && activeImage !== (product.images?.[0] || product?.imageUrl || '/placeholder.png')) {
      handleImageChange(product.images?.[0] || product?.imageUrl || '/placeholder.png');
    }

  }, [selections, product, activeImage, handleImageChange]);


  const handleSelectionChange = (groupName: string, optionName: string) => {
    const trimmedGroupName = groupName.trim();
    const trimmedOptionName = optionName.trim();

    setSelections(prev => {
      const newSelections: Record<string, string> = {
        ...prev,
        [trimmedGroupName]: trimmedOptionName,
      };

      // Deselect options of dependent groups when the parent changes
      product?.customizationGroups?.forEach(group => {
        if (group.dependsOn?.groupName === trimmedGroupName && newSelections[group.name]) {
          delete newSelections[group.name];
        }
      });

      // Explicitly update activeImage if the newly selected option has one
      const group = product?.customizationGroups?.find(g => g.name.trim() === trimmedGroupName);
      const option = group?.options.find(o => o.name.trim() === trimmedOptionName);
      if (option?.image) {
        handleImageChange(option.image);
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
      }
    });

    return orderedGroups;
  }, [product?.customizationGroups]);


  const handleAddToCart = () => {
    if (product) {
      const itemToAdd = {
        _id: String(product._id),
        nombre: product.nombre,
        precio: totalPrice,
        imageUrl: activeImage,
        customizations: selections,
      }

      addToCart(itemToAdd)
      toast.success(
        `${product.nombre} ha sido agregado al carrito!`,
      )
    }
  }

  if (router.isFallback) {
    return <div>Cargando...</div>
  }

  if (!product)
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center pt-32">
          <p className="text-gray-500 text-xl">Producto no encontrado.</p>
        </main>
      </>
    )

  const shortDescription = product?.descripcion
    ? product.descripcion.length > 200
      ? product.descripcion.substring(0, 200) + '...'
      : product.descripcion
    : '';

  const pageTitle = product.seoTitle || `${product.nombre} | Kamaluso Papelería`
  const pageDescription =
    product.seoDescription ||
    product.descripcion ||
    'Encuentra los mejores artículos de papelería personalizada en Kamaluso.'
  const pageImage = product.images?.[0] || product.imageUrl || '/logo.webp'; // Use base image for SEO
  const canonicalUrl = `https://www.papeleriapersonalizada.uy/productos/${product.categoria}/${product.slug}`

  const productSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.nombre,
    image: pageImage,
    description: pageDescription,
    sku: product._id,
    offers: {
      '@type': 'AggregateOffer',
      url: canonicalUrl,
      priceCurrency: 'UYU',
      lowPrice: product.basePrice,
      highPrice: totalPrice, 
      offerCount: product.customizationGroups?.length || 1,
    },
  }

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={pageImage} />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={canonicalUrl} />
        <meta property="twitter:title" content={pageTitle} />
        <meta property="twitter:description" content={pageDescription} />
        <meta property="twitter:image" content={pageImage} />
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      </Head>

      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Breadcrumbs
              items={[
                { name: 'Inicio', href: '/' },
                {
                  name: product.categoria,
                  href: `/productos/${product.categoria}`,
                },
                {
                  name: product.nombre,
                  href: `/productos/${product.categoria}/${product.slug}`,
                },
              ]}
            />
          </div>
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
          {/* Imágenes */}
          <div className="lg:sticky lg:top-28">
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="block w-full aspect-square relative rounded-2xl overflow-hidden shadow-lg cursor-zoom-in"
              >
                <Image
                  key={activeImage} // Add key to force re-render
                  src={activeImage}
                  alt={product.alt || product.nombre}
                  fill
                  style={{ objectFit: 'cover' }}
                  className={`rounded-2xl transition-opacity duration-500 ease-in-out ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
                />
              </button>
            </div>

            <Lightbox
              open={open}
              close={() => setOpen(false)}
              slides={[{ src: activeImage }]}
            />
          </div>

          {/* Información del producto */}
          <div className="mt-10 lg:mt-0">
            <div>
              <h1 className="text-4xl font-bold mb-2">{product.nombre}</h1>
              {reviewCount > 0 && (
                <div className="flex items-center mb-4">
                  <StarRating rating={parseFloat(averageRating)} />
                  <span className="text-gray-600 ml-2">
                    ({reviewCount} {reviewCount === 1 ? 'opinión' : 'opiniones'})
                  </span>
                </div>
              )}
              <p key={totalPrice} className="text-pink-500 font-bold text-4xl mb-6 transition-all duration-300 ease-in-out animate-pulse-once">
                $U {totalPrice}
              </p>
              
              <div className="text-gray-600 space-y-2 mb-6">
                <p>
                  {isDescriptionExpanded ? product.descripcion : shortDescription}
                </p>
                {product.descripcion.length > 200 && (
                  <button 
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)} 
                    className="text-pink-500 font-semibold hover:underline text-sm"
                  >
                    {isDescriptionExpanded ? 'Ver menos' : 'Ver más'}
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {displayGroups.map((group) => {
                  const groupName = group.name.trim();

                  // --- NEW VISIBILITY LOGIC ---
                  if (group.dependsOn) {
                    const parentSelection = selections[group.dependsOn.groupName];
                    if (parentSelection !== group.dependsOn.optionName) {
                      return null; // Don't render if dependency not met
                    }
                  }

                  // --- RENDER LOGIC ---
                  // Special renderer for CoverDesignGallery
                  if (groupName.startsWith('Diseño de Tapa')) {
                    return (
                      <div key={groupName} className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {groupName}
                        </label>
                        <CoverDesignGallery
                          options={group.options}
                          selectedOption={selections[groupName]}
                          onSelectOption={(optionName) => handleSelectionChange(groupName, optionName)}
                        />
                      </div>
                    )
                  }

                  // Special renderer for InteriorDesignGallery
                  if (groupName === 'Interiores') {
                    return (
                      <div key={groupName} className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {groupName}
                        </label>
                        <InteriorDesignGallery
                          options={group.options}
                          selectedOption={selections[groupName]}
                          onSelectOption={(optionName) => handleSelectionChange(groupName, optionName)}
                        />
                      </div>
                    )
                  }

                  // Default renderer for all other groups
                  return (
                    <div key={groupName} className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {groupName}
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {group.options.map((option: any) => {
                          const isSelected = selections[groupName] === option.name.trim();
                          return (
                            <button
                              key={option.name}
                              type="button"
                              onClick={() => handleSelectionChange(groupName, option.name)}
                              className={`relative p-3 text-sm rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-2 text-center w-32 h-auto min-h-[120px] ${ 
                                isSelected
                                  ? 'border-pink-500 ring-2 ring-pink-500 shadow-md bg-pink-50 text-pink-800'
                                  : 'border-gray-300 bg-white text-gray-800 hover:border-pink-400 hover:shadow-sm'
                              }`}
                            >
                              {option.image && (
                                <div className="relative w-20 h-20 rounded-md overflow-hidden">
                                  <Image
                                    src={option.image}
                                    alt={option.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <span className="block font-medium">{option.name}</span>
                              {option.priceModifier > 0 && <span className="block text-xs font-normal">(+ $U {option.priceModifier})</span>}
                              {isSelected && (
                                <div className="absolute top-1 right-1 bg-pink-500 text-white rounded-full p-0.5">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

            </div>

            <div className="sticky bottom-0 left-0 right-0 z-10 bg-white py-3 px-4 shadow-lg border-t border-gray-200">
              <div className="flex items-center justify-between gap-3 mb-3">
                <p key={totalPrice} className="text-pink-500 font-bold text-2xl md:text-3xl transition-all duration-300 ease-in-out animate-pulse-once">
                  $U {totalPrice}
                </p>
                <button
                  onClick={handleAddToCart}
                  className="inline-flex items-center justify-center gap-2 bg-pink-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:bg-pink-700 transition text-base md:text-lg"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  Agregar al carrito
                </button>
              </div>
              <Link
                href={`/productos/${product.categoria}`}
                className="block text-center bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition text-sm md:text-base"
              >
                Volver a {product.categoria}
              </Link>
            </div>
          </div>
        </div>
      </div>

        {/* Reviews Section */}
        <section className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold mb-8 text-center">
            Opiniones de nuestros clientes
          </h2>
          <div className="space-y-12">
            <ReviewForm
              productId={product._id}
              onReviewSubmit={() => router.replace(router.asPath)} // Re-run getStaticProps
            />
            <ReviewList reviews={reviews} />
          </div>
        </section>

        {/* Productos relacionados */}
        <section className="mt-16">
          <h2 className="text-3xl font-semibold mb-8 text-center">
            Productos relacionados
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-6xl mx-auto">
            {/* Mapear productos relacionados si querés */}
          </div>
        </section>

        {/* B2B Callout Section */}
        <section className="max-w-6xl mx-auto mt-16 bg-pink-50 p-8 rounded-2xl shadow-inner text-center">
          <h2 className="text-2xl font-semibold mb-3 text-gray-800">
            ¿Buscas este producto para tu Empresa?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Ofrecemos personalización con tu logo y descuentos por volumen.
            Ideal para regalos corporativos, eventos o merchandising.
          </p>
          <Link
            href="/regalos-empresariales"
            className="inline-block bg-pink-500 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl font-semibold shadow-lg hover:bg-pink-600 transition-transform transform hover:scale-105"
          >
            Ver Opciones para Empresas
          </Link>
        </section>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  await connectDB()
  const products = await Product.find({
    slug: { $exists: true },
    categoria: { $exists: true },
  })
    .limit(200) // Increased limit for more paths
    .lean()

  const paths = products.map((product) => ({
    params: {
      categoria: String(product.categoria),
      slug: String(product.slug),
    },
  }))

  return {
    paths,
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { slug, categoria } = context.params

  try {
    await connectDB()
    const productData = await Product.findOne({ slug, categoria }).lean()

    if (!productData) {
      return { notFound: true }
    }

    const product = JSON.parse(JSON.stringify(productData));

    // Add custom design option to cover design group
    const coverDesignGroup = product.customizationGroups?.find((g: any) => g.name === 'Diseño de Tapa');
    if (coverDesignGroup) {

    }

    // Fetch approved reviews and calculate average rating
    const reviewsData = await Review.find({ product: product._id, isApproved: true }).sort({ createdAt: -1 }).lean();
    const reviews = JSON.parse(JSON.stringify(reviewsData));
    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0
      ? reviews.reduce((acc: number, item: any) => item.rating + acc, 0) / reviewCount
      : 0;

    return {
      props: {
        product,
        reviews,
        reviewCount,
        averageRating: averageRating.toFixed(1),
      },
      revalidate: 3600, // Revalidate every hour
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    return { notFound: true };
  }
};
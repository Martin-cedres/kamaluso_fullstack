import { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Navbar from '../../../components/Navbar'
import Link from 'next/link'
import { useCart } from '../../../context/CartContext';
import { useState, useEffect, useMemo, useCallback } from 'react';
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
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [totalPrice, setTotalPrice] = useState(product?.basePrice || 0);
  const [activeImage, setActiveImage] = useState(
    product?.images?.[0] || product?.imageUrl || '/placeholder.png'
  );
  const [isAnimating, setIsAnimating] = useState(false);

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
    let newImage = product.images?.[0] || product.imageUrl || '/placeholder.png';
    let imageChanged = false;

    // Recalculate price based on current selections
    product.customizationGroups?.forEach(group => {
      const selectedOptionName = selections[group.name];
      if (selectedOptionName) {
        const selectedOption = group.options.find(opt => opt.name === selectedOptionName);
        if (selectedOption) {
          currentPrice += selectedOption.priceModifier;
          if (selectedOption.image) {
            newImage = selectedOption.image;
            imageChanged = true;
          }
        }
      }
    });

    setTotalPrice(currentPrice);
    if(imageChanged) {
      handleImageChange(newImage);
    }

  }, [selections, product, handleImageChange]);


  const handleSelectionChange = (groupName: string, optionName: string) => {
    const trimmedGroupName = groupName.trim();
    const trimmedOptionName = optionName.trim();

    setSelections(prev => {
      const newSelections: Record<string, string> = {
        ...prev,
        [trimmedGroupName]: trimmedOptionName,
      };

      // When the main cover type changes, reset all dependent selections
      if (trimmedGroupName === 'Tipo de Tapa') {
        delete newSelections['Diseño Tapa Dura'];
        delete newSelections['Diseño Tapa Flexible'];
        delete newSelections['Textura'];
        delete newSelections['Elástico'];
      }

      return newSelections;
    });

    const group = product?.customizationGroups?.find(g => g.name.trim() === trimmedGroupName);
    const option = group?.options.find(o => o.name.trim() === trimmedOptionName);
    if (option?.image) {
      handleImageChange(option.image);
    }
  };

  const orderedDisplayGroups = useMemo(() => {
    if (!product?.customizationGroups) return [];

    const originalGroups = [...product.customizationGroups];
    const displayOrder: any[] = [];

    // 1. Add the main trigger group
    const tipoTapaGroup = originalGroups.find(g => g.name.trim() === 'Tipo de Tapa');
    if (tipoTapaGroup) {
        displayOrder.push(tipoTapaGroup);
    }

    // 2. Add placeholders for hardcoded groups
    displayOrder.push({
        name: 'Textura',
        isHardcoded: true,
        options: [{ name: 'Laminado Mate' }, { name: 'Laminado Brillo' }]
    });
    displayOrder.push({
        name: 'Elástico',
        isHardcoded: true,
        options: [{ name: 'Sí' }, { name: 'No' }]
    });

    // 3. Add the groups that are dependent on 'Tipo de Tapa'
    const disenoDuraGroup = originalGroups.find(g => g.name.trim() === 'Diseño Tapa Dura');
    if (disenoDuraGroup) {
        displayOrder.push(disenoDuraGroup);
    }
    const disenoFlexGroup = originalGroups.find(g => g.name.trim() === 'Diseño Tapa Flexible');
    if (disenoFlexGroup) {
        displayOrder.push(disenoFlexGroup);
    }

    // 4. Add all other groups
    const remainingGroups = originalGroups.filter(g => 
        g.name.trim() !== 'Tipo de Tapa' &&
        g.name.trim() !== 'Diseño Tapa Dura' &&
        g.name.trim() !== 'Diseño Tapa Flexible'
    );
    displayOrder.push(...remainingGroups);

    return displayOrder;
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
          <div className="flex flex-col lg:flex-row gap-12">
          {/* Imágenes */}
          <div className="flex-1">
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
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={() => {
                      const currentIndex = product.images.indexOf(activeImage);
                      const nextIndex = (currentIndex - 1 + product.images.length) % product.images.length;
                      handleImageChange(product.images[nextIndex]);
                    }}
                    className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button
                    onClick={() => {
                      const currentIndex = product.images.indexOf(activeImage);
                      const nextIndex = (currentIndex + 1) % product.images.length;
                      handleImageChange(product.images[nextIndex]);
                    }}
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </>
              )}
            </div>

            <Lightbox
              open={open}
              close={() => setOpen(false)}
              slides={product.images?.map((img) => ({ src: img }))}
            />

            {product.images && product.images.length > 1 && (
              <div className="flex w-full gap-4 mt-4 overflow-x-auto p-2">
                {product.images.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => handleImageChange(img)}
                    className={`relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer border-4 ${
                      activeImage === img
                        ? 'border-pink-500'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.alt || product.nombre} ${i + 1}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="rounded-xl"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="flex-1 flex flex-col justify-between">
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
              <p className="text-gray-600 mb-6">{product.descripcion}</p>

              {/* NEW Customization UI */}
              <div className="space-y-6">
                {orderedDisplayGroups.map((group) => {
                  const groupName = group.name.trim();
                  const selectedTapa = selections['Tipo de Tapa']?.trim();

                  // --- VISIBILITY LOGIC ---
                  if (groupName === 'Diseño Tapa Dura' && selectedTapa !== 'Tapa Dura') return null;
                  if (groupName === 'Diseño Tapa Flexible' && selectedTapa !== 'Tapa Flexible') return null;
                  if (groupName === 'Textura' && selectedTapa !== 'Tapa Dura') return null;
                  if (groupName === 'Elástico' && selectedTapa !== 'Tapa Dura') return null;

                  // --- RENDER LOGIC ---
                  // Renderer for hardcoded groups
                  if (group.isHardcoded) {
                    return (
                      <div key={groupName}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {groupName}
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {group.options.map((option: any) => {
                            const isSelected = selections[groupName] === option.name;
                            return (
                              <button
                                key={option.name}
                                type="button"
                                onClick={() => handleSelectionChange(groupName, option.name)}
                                className={`p-3 text-sm rounded-xl border transition-all duration-200 flex items-center justify-center text-center w-32 h-auto min-h-[60px] ${
                                  isSelected
                                    ? 'bg-pink-500 text-white border-pink-500 shadow-lg'
                                    : 'bg-white text-gray-800 border-gray-300 hover:border-pink-400 hover:shadow-md'
                                }`}
                              >
                                <span className="block font-medium">{option.name}</span>
                                {isSelected && (
                                  <div className="absolute top-1 right-1 bg-white rounded-full p-0.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )
                  }

                  // Special renderer for CoverDesignGallery
                  if (groupName === 'Diseño Tapa Dura' || groupName === 'Diseño Tapa Flexible') {
                    return (
                      <div key={groupName}>
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

                  // Default renderer for DB groups
                  return (
                    <div key={groupName}>
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
                              className={`p-3 text-sm rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-2 text-center w-32 h-auto min-h-[120px] ${ 
                                isSelected
                                  ? 'bg-pink-500 text-white border-pink-500 shadow-lg'
                                  : 'bg-white text-gray-800 border-gray-300 hover:border-pink-400 hover:shadow-md'
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
                                <div className="absolute top-1 right-1 bg-white rounded-full p-0.5">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
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

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button
                onClick={handleAddToCart}
                className="bg-pink-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:bg-pink-600 transition"
              >
                Agregar al carrito
              </button>
              <Link
                href={`/productos/${product.categoria}`}
                className="px-6 py-3 rounded-2xl border border-pink-500 text-pink-500 font-semibold text-center hover:bg-pink-50 transition"
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
      coverDesignGroup.options.push({
        name: 'Diseño Personalizado',
        priceModifier: 0,
        image: '/placeholder.png', // You can replace this with a more suitable image
      });
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
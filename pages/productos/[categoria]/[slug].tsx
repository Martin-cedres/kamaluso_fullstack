import { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import Navbar from '../../../components/Navbar'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '../../../context/CartContext';
import { useState } from 'react';
import toast from 'react-hot-toast';
import connectDB from '../../../lib/mongoose';
import Product, { IProduct } from '../../../models/Product';
import Review, { IReview } from '../../../models/Review'; // Import Review model and interface
import { useRouter } from 'next/router';
import StarRating from '../../../components/StarRating';
import ReviewList from '../../../components/ReviewList';
import ReviewForm from '../../../components/ReviewForm';

interface ProductDetailProps {
  product: IProduct | null;
  reviews: IReview[];
  reviewCount: number;
  averageRating: string;
  productVariants: IProduct[];
}

export default function ProductDetailPage({ product, reviews, reviewCount, averageRating, productVariants }: ProductDetailProps) {
  const { addToCart } = useCart()
  const [finish, setFinish] = useState<string | null>(null)
  const router = useRouter()

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
      if (product.tapa === 'Tapa Dura' && finish === null) {
        toast.error('Por favor, selecciona una textura para la tapa.')
        return
      }

      const priceToUse = displayPrice
      if (
        priceToUse === undefined ||
        priceToUse === null ||
        isNaN(priceToUse)
      ) {
        toast.error(
          'Este producto no se puede agregar al carrito porque no tiene un precio definido.',
        )
        return
      }

      const itemToAdd = {
        _id: String(product._id),
        nombre: product.nombre,
        precio: priceToUse,
        imageUrl: product.images?.[0] || product.imageUrl,
        finish: product.tapa === 'Tapa Dura' ? finish : undefined,
      }

      addToCart(itemToAdd)
      toast.success(
        `${product.nombre} ${itemToAdd.finish ? `(${itemToAdd.finish})` : ''} ha sido agregado al carrito!`,
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
  const pageImage = product.images?.[0] || product.imageUrl || '/logo.webp'
  const canonicalUrl = `https://www.papeleriapersonalizada.uy/productos/${product.categoria}/${product.slug}`

  const productSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.nombre,
    image: pageImage,
    description: pageDescription,
    sku: product._id,
    offers: {
      '@type': 'Offer',
      url: canonicalUrl,
      priceCurrency: 'UYU',
      price: displayPrice,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  }

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={pageImage} />

        {/* Twitter */}
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
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12">
          {/* Imágenes */}
          <div className="flex-1">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={product.images?.[0] || product.imageUrl || '/placeholder.png'}
                alt={product.alt || product.nombre}
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-2xl"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex w-full gap-4 mt-4 overflow-x-auto p-2">
                {product.images.map((img, i) => (
                  <div
                    key={i}
                    className={`relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer border-2 border-pink-500`}
                  >
                    <Image
                      src={img}
                      alt={product.alt || product.nombre}
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
              {displayPrice && (
                <p className="text-pink-500 font-semibold text-2xl mb-6">
                  $U {displayPrice}
                </p>
              )}
              <p className="text-gray-600 mb-6">{product.descripcion}</p>

              {/* Product Variants Section */}
              {productVariants && productVariants.length > 0 && (
                <section className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Variantes Disponibles</h3>
                  <div className="flex w-full gap-3 pb-2 overflow-x-auto">
                    {productVariants.map((variant) => (
                      <Link key={variant._id} href={`/productos/${variant.categoria}/${variant.slug}`} className="block flex-shrink-0 w-28">
                        <div className="bg-white rounded-lg border border-gray-200 hover:border-pink-500 hover:shadow-lg transition-all duration-300">
                          <div className="relative w-full aspect-square">
                            <Image
                              src={variant.imageUrl || '/placeholder.png'}
                              alt={variant.nombre}
                              fill
                              className="object-cover rounded-t-lg"
                            />
                          </div>
                          <div className="p-2">
                            <p className="text-xs font-medium text-gray-700 truncate">{variant.nombre.split('-').pop()}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Selector de Acabado Condicional */}
              {product.tapa === 'Tapa Dura' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Textura de tapas
                  </label>
                  <div className="flex rounded-xl shadow-sm">
                    <button
                      type="button"
                      onClick={() => setFinish('Brillo')}
                      className={`flex-1 px-4 py-2 text-sm rounded-xl border ${finish === 'Brillo' ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-700 border-gray-300'}`}
                    >
                      Brillo
                    </button>
                    <button
                      type="button"
                      onClick={() => setFinish('Mate')}
                      className={`flex-1 px-4 py-2 text-sm rounded-xl border ${finish === 'Mate' ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-700 border-gray-300'}`}
                    >
                      Mate
                    </button>
                  </div>
                </div>
              )}
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
    .limit(10)
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

    // Fetch approved reviews and calculate average rating
    const reviewsData = await Review.find({ product: product._id, isApproved: true }).sort({ createdAt: -1 }).lean();
    const reviews = JSON.parse(JSON.stringify(reviewsData));
    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0
      ? reviews.reduce((acc: number, item: any) => item.rating + acc, 0) / reviewCount
      : 0;

    // Fetch product variants if a group key exists
    let productVariants = [];
    if (product.claveDeGrupo) {
      const variantsData = await Product.find({
        claveDeGrupo: product.claveDeGrupo,
        _id: { $ne: product._id } // Exclude the current product
      }).lean();
      productVariants = JSON.parse(JSON.stringify(variantsData));
    }

    return {
      props: {
        product,
        reviews,
        reviewCount,
        averageRating: averageRating.toFixed(1),
        productVariants, // Pass variants to the page
      },
      revalidate: 3600, // Revalidate once per hour
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    return { notFound: true };
  }
};

import { GetStaticProps, GetStaticPaths } from 'next'
import Navbar from '../../../components/Navbar'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCart } from '../../../context/CartContext'
import { useState, useEffect } from 'react'
import SeoMeta from '../../../components/SeoMeta'
import toast from 'react-hot-toast'
import connectDB from '../../../lib/mongoose'
import Product, { IProduct } from '../../../models/Product'
import mongoose from 'mongoose'

// This interface is for the props passed to the component
interface ProductProp {
  _id: string
  nombre: string
  descripcion?: string
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
}

const getCardDisplayPrice = (product: ProductProp) => {
  if (product.precioDura) return product.precioDura
  if (product.precioFlex) return product.precioFlex
  if (product.precio) return product.precio
  return null
}

interface Props {
  product: ProductProp | null
  relatedProducts: ProductProp[]
}

export default function ProductDetailPage({ product, relatedProducts }: Props) {
  const { addToCart } = useCart()
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    undefined,
  )
  const [finish, setFinish] = useState<string | null>(null)

  useEffect(() => {
    if (product?.images?.[0]) {
      setSelectedImage(product.images[0])
    } else if (product?.imageUrl) {
      setSelectedImage(product.imageUrl)
    }
  }, [product?._id])

  const handlePrevImage = () => {
    if (!product?.images || product.images.length < 2) return
    const currentIndex = product.images.findIndex(
      (img) => img === selectedImage,
    )
    const prevIndex =
      (currentIndex - 1 + product.images.length) % product.images.length
    setSelectedImage(product.images[prevIndex])
  }

  const handleNextImage = () => {
    if (!product?.images || product.images.length < 2) return
    const currentIndex = product.images.findIndex(
      (img) => img === selectedImage,
    )
    const nextIndex = (currentIndex + 1) % product.images.length
    setSelectedImage(product.images[nextIndex])
  }

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
        _id: product._id,
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
  const canonicalUrl = `/productos/detail/${product._id}`

  return (
    <>
      <SeoMeta
        title={pageTitle}
        description={pageDescription}
        image={pageImage}
        url={canonicalUrl}
        type="product"
      />
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-32 px-6 pb-16">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12">
          <div className="flex-1">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={selectedImage || '/placeholder.png'}
                alt={product.alt || product.nombre}
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-2xl transition-opacity duration-300"
                key={selectedImage}
              />
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-40 hover:opacity-100 transition-opacity duration-300 z-10"
                    aria-label="Imagen anterior"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-40 hover:opacity-100 transition-opacity duration-300 z-10"
                    aria-label="Siguiente imagen"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 mt-4 overflow-x-auto p-2">
                {product.images.map((img, i) => (
                  <div
                    key={i}
                    className={`relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${selectedImage === img ? 'border-4 border-pink-500' : 'border-2 border-transparent hover:border-pink-300'}`}
                    onClick={() => setSelectedImage(img)}
                  >
                    <Image
                      src={img}
                      alt={`${product.alt || product.nombre} thumbnail ${i + 1}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-4">{product.nombre}</h1>
              {displayPrice && (
                <p className="text-pink-500 font-semibold text-2xl mb-6">
                  $U {displayPrice}
                </p>
              )}

              <p className="text-gray-600 mb-6">{product.descripcion}</p>
              {/* Solo mostrar selectores de textura para productos con Tapa Dura */}
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
              <button
                onClick={() => router.back()}
                className="px-6 py-3 rounded-2xl border border-pink-500 text-pink-500 font-semibold text-center hover:bg-pink-50 transition"
              >
                Ir atrás
              </button>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-3xl font-semibold mb-8 text-center">
              Productos relacionados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {relatedProducts.map((p) => (
                <Link
                  key={p._id}
                  href={`/productos/detail/${p._id}`}
                  className="block bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 group flex flex-col"
                >
                  <div className="relative w-full aspect-square">
                    <Image
                      src={p.images?.[0] || p.imageUrl || '/placeholder.png'}
                      alt={p.nombre}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-lg truncate text-gray-800 flex-grow">
                      {p.nombre}
                    </h3>
                    {getCardDisplayPrice(p) && (
                      <p className="text-pink-500 font-semibold mt-2">
                        $U {getCardDisplayPrice(p)}
                      </p>
                    )}
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
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  await connectDB()
  const products = await Product.find({}).limit(10).lean() // Pre-build 10 pages

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
      },
      revalidate: 3600, // Revalidate once per hour
    }
  } catch (error) {
    console.error(`Error fetching product details for id: ${id}`, error)
    return { notFound: true }
  }
}

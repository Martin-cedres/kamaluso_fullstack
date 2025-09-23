import Image from 'next/image'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import { getProductHref } from '../lib/utils'
import SeoMeta from '../components/SeoMeta'
import { categorias } from '../lib/categorias' // Importar categorías estáticas
import connectDB from '../lib/mongoose'
import Product from '../models/Product'
import { GetStaticProps } from 'next'

// Interfaces
interface Categoria {
  _id: string
  nombre: string
  slug: string
  imagen?: string
}

interface Product {
  _id: string
  nombre: string
  imageUrl?: string
  alt?: string
  categoria?: string
  slug?: string
  precio?: number
  precioFlex?: number
  precioDura?: number
  tapa?: string
}

interface HomeProps {
  destacados: Product[]
  categories: Categoria[]
}

export default function Home({ destacados, categories }: HomeProps) {
  const getCardPrice = (product: Product) => {
    if (product.precioDura && product.precioFlex) {
      return (
        <>
          <p className="text-pink-500 font-semibold text-lg mb-1">
            Dura: $U {product.precioDura}
          </p>
          <p className="text-pink-500 font-semibold text-lg mb-4">
            Flex: $U {product.precioFlex}
          </p>
        </>
      )
    }
    if (product.precioDura) {
      return (
        <p className="text-pink-500 font-semibold text-lg mb-4">
          $U {product.precioDura}
        </p>
      )
    }
    if (product.precioFlex) {
      return (
        <p className="text-pink-500 font-semibold text-lg mb-4">
          $U {product.precioFlex}
        </p>
      )
    }
    if (product.precio) {
      return (
        <p className="text-pink-500 font-semibold text-lg mb-4">
          $U {product.precio}
        </p>
      )
    }
    return null
  }

  return (
    <>
      <SeoMeta
        title="Papelería Personalizada en Uruguay | Agendas y Libretas | Kamaluso"
        description="Encuentra agendas, libretas y planners 100% personalizados en Kamaluso. Diseños únicos y materiales de alta calidad. ¡Enviamos a todo el Uruguay!"
      />

      <Navbar />

      <main className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
        {/* Hero */}
        <section className="flex flex-col items-center justify-center text-center px-6 py-24">
          <Image
            src="/logo.webp"
            alt="Logo Kamaluso"
            width={140}
            height={140}
            className="mb-6"
          />
          <h1 className="text-5xl font-bold mb-4">
            Papelería Personalizada en Uruguay
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Agendas, libretas y cuadernos únicos. <br /> ✨ Envíos a todo
            Uruguay ✨
          </p>
        </section>

        {/* Categorías Dinámicas */}
        <section className="px-6 py-12 bg-gray-50">
          <h2 className="text-3xl font-semibold text-center mb-10">
            Categorías
          </h2>
          <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/productos/${cat.slug}`}
                className="w-full sm:w-64 md:w-80 bg-white rounded-2xl overflow-hidden transform transition hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/50"
              >
                <div className="relative w-full h-64">
                  <Image
                    src={cat.imagen || '/placeholder.png'}
                    alt={cat.nombre}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-xl font-semibold">{cat.nombre}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Productos Destacados */}
        <section className="px-6 py-12">
          <h2 className="text-3xl font-semibold text-center mb-10">
            Productos Destacados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {destacados.length === 0 && (
              <p className="text-center col-span-full text-gray-500">
                No hay productos destacados
              </p>
            )}
            {destacados.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg hover:shadow-pink-500/50 transition transform hover:-translate-y-1 flex flex-col h-full overflow-hidden"
              >
                <div className="relative w-full aspect-square">
                  <Image
                    src={product.imageUrl || '/placeholder.png'}
                    alt={product.alt || product.nombre}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="p-4 flex flex-col flex-grow text-center">
                  <h3 className="font-semibold text-lg mb-2 flex-grow">
                    {product.nombre}
                  </h3>
                  <div className="mb-4">{getCardPrice(product)}</div>
                </div>
                <Link
                  href={getProductHref(product)}
                  className="block w-full bg-pink-500 text-white px-4 py-3 font-medium text-center shadow-md rounded-b-2xl"
                >
                  Ver más
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  await connectDB()

  // Fetch featured products
  const destacadosData = await Product.find({ destacado: true }).limit(4).lean()
  const destacados = JSON.parse(JSON.stringify(destacadosData))

  // Categories are static, but we pass them as props for consistency
  const categoriesData = categorias.map((cat) => ({ ...cat, _id: cat.id }))

  return {
    props: {
      destacados,
      categories: categoriesData,
    },
    revalidate: 3600, // Revalidate once per hour
  }
}

import { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head' // Importo Head
import Navbar from '../../components/Navbar'
import Image from 'next/image'
import Link from 'next/link'
import { getProductHref } from '../../lib/utils'
import { categorias } from '../../lib/categorias'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import SeoMeta from '../../components/SeoMeta'
import Breadcrumbs from '../../components/Breadcrumbs'
import connectDB from '../../lib/mongoose'
import Product from '../../models/Product'

// Interfaces
interface IProduct {
  _id: string
  nombre: string
  descripcion?: string
  precio?: number
  precioFlex?: number
  precioDura?: number
  categoria?: string
  destacado?: boolean
  imageUrl?: string
  images?: string[]
  alt?: string
  slug?: string
  tapa?: string
}

interface Category {
  id: string
  nombre: string
  descripcion: string
  tipoPrecios: string
  slug: string
  imagen: string
  keywords: string[]
}

interface CategoriaPageProps {
  category: Category | null
  initialProducts: IProduct[]
  initialTotalPages: number
}

// Componente principal
export default function CategoryPage({
  category,
  initialProducts,
  initialTotalPages,
}: CategoriaPageProps) {
  const router = useRouter()
  const { categoria: categorySlug } = router.query

  // Estados
  const [products, setProducts] = useState<IProduct[]>(initialProducts)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  // Debounce para el término de búsqueda
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1) // Reset page to 1 on new search
    }, 500)

    return () => {
      clearTimeout(timerId)
    }
  }, [searchTerm])

  // Efecto para cargar productos en paginación y búsqueda
  useEffect(() => {
    // No ejecutar en la carga inicial ya que tenemos los datos de getStaticProps
    if (currentPage === 1 && debouncedSearchTerm === '') {
      setProducts(initialProducts)
      setTotalPages(initialTotalPages)
      return
    }

    if (categorySlug) {
      setLoading(true)
      const fetchProducts = async () => {
        try {
          const res = await fetch(
            `/api/products/listar?categoria=${categorySlug}&page=${currentPage}&search=${debouncedSearchTerm}`,
          )
          const data = await res.json()
          if (data.products) {
            setProducts(data.products)
            setTotalPages(data.totalPages)
          }
        } catch (error) {
          console.error('Error fetching products:', error)
          setProducts([])
          setTotalPages(0)
        } finally {
          setLoading(false)
        }
      }

      fetchProducts()
    }
  }, [
    categorySlug,
    currentPage,
    debouncedSearchTerm,
    initialProducts,
    initialTotalPages,
  ])

  // Función para obtener el precio de la tarjeta
  const getCardPrice = (product: IProduct) => {
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
    if (product.precioDura)
      return (
        <p className="text-pink-500 font-semibold text-lg mb-4">
          $U {product.precioDura}
        </p>
      )
    if (product.precioFlex)
      return (
        <p className="text-pink-500 font-semibold text-lg mb-4">
          $U {product.precioFlex}
        </p>
      )
    if (product.precio)
      return (
        <p className="text-pink-500 font-semibold text-lg mb-4">
          $U {product.precio}
        </p>
      )
    return null
  }

  if (!category) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 pt-32 px-6">
          <h1 className="text-3xl font-semibold text-center mb-10">
            Categoría no encontrada
          </h1>
        </main>
      </>
    )
  }

  const pageTitle = `${category.nombre} Personalizadas en Uruguay | Kamaluso`
  const pageDescription = `${category.descripcion}. Calidad y diseño único con envío a todo Uruguay.`
  const canonicalUrl = `/productos/${category.slug}`
  const siteUrl = 'https://www.papeleriapersonalizada.uy'

  // --- Mis datos para los Breadcrumbs --- //
  const breadcrumbItems = [
    { name: 'Inicio', href: '/' },
    { name: category.nombre, href: `/productos/${category.slug}` },
  ]

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
        image={category.imagen || '/logo.webp'}
        url={canonicalUrl}
      />
      {/* Inyecto los datos estructurados de los breadcrumbs para que Google los lea */}
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
          key="breadcrumb-jsonld"
        />
      </Head>

      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-center mb-4">
            {category.nombre}
          </h1>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            {category.descripcion}
          </p>

          {/* Search Bar */}
          <div className="mb-8 max-w-lg mx-auto">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  className="w-5 h-5 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Buscar en esta categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Cargando productos...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl max-w-full mx-auto">
                {products.length === 0 && (
                  <p className="col-span-full text-center w-full text-gray-500">
                    No se encontraron productos para esta selección.
                  </p>
                )}

                {products.map((product) => (
                  <Link key={product._id} href={getProductHref(product)}>
                    <div className="bg-white rounded-2xl overflow-hidden transform transition hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/50 flex flex-col cursor-pointer h-full">
                      <div className="relative w-full aspect-square">
                        <Image
                          src={product.imageUrl || '/placeholder.png'}
                          alt={product.alt || product.nombre}
                          fill
                          style={{ objectFit: 'cover' }}
                          className=""
                        />
                      </div>
                      <div className="p-4 text-center flex flex-col flex-grow">
                        <h3 className="font-semibold text-lg mb-2 flex-grow">
                          {product.nombre}
                        </h3>
                        <div>{getCardPrice(product)}</div>
                      </div>
                      <div className="block w-full bg-pink-500 text-white px-4 py-3 font-medium text-center shadow-md rounded-b-2xl">
                        Ver más
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-10 gap-4">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg font-semibold transition bg-white text-gray-700 border border-gray-300 hover:bg-pink-50 hover:text-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <span className="text-gray-600">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg font-semibold transition bg-white text-gray-700 border border-gray-300 hover:bg-pink-50 hover:text-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = categorias.map((cat) => ({
    params: { categoria: cat.slug },
  }))

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { categoria } = context.params
  const category = categorias.find((c) => c.slug === categoria) || null

  if (!category) {
    return { notFound: true }
  }

  await connectDB()

  const page = 1
  const limit = 12 // O el número de productos por página que prefieras
  const query = { categoria: category.slug }

  const productsData = await Product.find(query)
    .limit(limit)
    .skip((page - 1) * limit)
    .lean()

  const totalProducts = await Product.countDocuments(query)

  const initialProducts = JSON.parse(JSON.stringify(productsData))
  const initialTotalPages = Math.ceil(totalProducts / limit)

  return {
    props: {
      category,
      initialProducts,
      initialTotalPages,
    },
    revalidate: 3600, // Revalidate once per hour
  }
}

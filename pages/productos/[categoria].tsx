import { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head' // Importo Head
import Navbar from '../../components/Navbar'
import Image from 'next/image'
import Link from 'next/link'
import { getProductHref } from '../../lib/utils'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import SeoMeta from '../../components/SeoMeta'
import Breadcrumbs from '../../components/Breadcrumbs';
import connectDB from '../../lib/mongoose';
import Product from '../../models/Product';
import Category from '@/models/Category';
import ProductCard from '../../components/ProductCard'; // Importar ProductCard

// Interfaces
interface IProduct {
  _id: string;
  nombre: string;
  descripcion?: string;
  basePrice?: number; // Nuevo
  precio?: number; // Antiguo
  precioFlex?: number; // Antiguo
  precioDura?: number; // Antiguo
  categoria?: string;
  destacado?: boolean;
  imageUrl?: string;
  images?: string[];
  alt?: string;
  slug?: string;
  tapa?: string;
  averageRating?: number;
  numReviews?: number;
  customizationGroups?: any[]; // Nuevo
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
  subCategories?: Category[]
  initialProducts: IProduct[]
  initialTotalPages: number
  breadcrumbItems: { name: string; href: string; }[];
}

// Componente principal
export default function CategoryPage({
  category,
  subCategories,
  initialProducts,
  initialTotalPages,
  breadcrumbItems,
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

  // Función para obtener el precio de la tarjeta (actualizada para compatibilidad)
  const getCardPrice = (product: IProduct) => {
    if (product.basePrice) {
      return (
        <p className="text-pink-500 font-semibold text-lg mb-4">
          Desde $U {product.basePrice}
        </p>
      )
    }
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

          {/* Sub-Categories Section */}
          {subCategories && subCategories.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-center mb-8">Explorar Subcategorías</h2>
              <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
                {subCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/productos/${cat.slug}`}
                    className="w-full sm:w-56 bg-white rounded-2xl overflow-hidden transform transition hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/50"
                  >
                    <div className="relative w-full h-48">
                      <Image
                        src={cat.imagen || '/placeholder.png'}
                        alt={cat.nombre}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="text-lg font-semibold">{cat.nombre}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

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
                  <ProductCard key={product._id} product={{
                    id: product._id,
                    nombre: product.nombre,
                    // Lógica de precio actualizada para compatibilidad
                    precio: product.basePrice || product.precioDura || product.precioFlex || product.precio || 0,
                    isBasePrice: !!product.basePrice, // Prop para indicar que es un precio "Desde"
                    // ... otros campos
                    categoria: product.categoria || '',
                    slug: product.slug || '',
                    imagen: product.imageUrl || '/placeholder.png',
                    averageRating: product.averageRating,
                    numReviews: product.numReviews,
                  }} />
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
  await connectDB();
  const categories = await Category.find({}).select('slug').lean();

  const paths = categories.map((cat) => ({
    params: { categoria: cat.slug },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { categoria: categorySlug } = context.params;

  try {
    await connectDB();
    const category = await Category.findOne({ slug: categorySlug }).lean();

    if (!category) {
      return { notFound: true };
    }

    const subCategoriesData = await Category.find({ parent: category._id }).lean();

    let initialProducts = [];
    let initialTotalPages = 0;

    // --- Construcción de Breadcrumbs ---
    let breadcrumbItems = [{ name: 'Inicio', href: '/' }];

    if (category.parent) {
      const parentCategory = await Category.findById(category.parent).lean();
      if (parentCategory) {
        breadcrumbItems.push({ name: parentCategory.nombre, href: `/productos/${parentCategory.slug}` });
      }
    }
    breadcrumbItems.push({ name: category.nombre, href: `/productos/${category.slug}` });
    // --- Fin Construcción de Breadcrumbs ---

    // Si la categoría NO tiene subcategorías, buscamos sus productos.
    if (subCategoriesData.length === 0) {
      const categorySlugsToQuery = [category.slug];
      const page = 1;
      const limit = 12;
      const query = {
        $or: [
          { categoria: { $in: categorySlugsToQuery } },
          { subCategoria: { $in: categorySlugsToQuery } },
        ],
      };

      const aggregationPipeline = [
        { $match: query },
        { $sort: { creadoEn: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
          $lookup: {
            from: 'reviews',
            localField: '_id',
            foreignField: 'product',
            as: 'reviews',
          },
        },
        {
          $addFields: {
            approvedReviews: {
              $filter: {
                input: '$reviews',
                as: 'review',
                cond: { $eq: ['$$review.isApproved', true] },
              },
            },
          },
        },
        {
          $addFields: {
            averageRating: { $avg: '$approvedReviews.rating' },
            numReviews: { $size: '$approvedReviews' },
          },
        },
        { $project: { reviews: 0, approvedReviews: 0 } },
      ];

      const productsData = await Product.aggregate(aggregationPipeline as any[]);
      const totalProducts = await Product.countDocuments(query);

      initialProducts = JSON.parse(JSON.stringify(productsData)).map((p:any) => ({
        ...p,
        averageRating: p.averageRating === null ? 0 : p.averageRating,
        numReviews: p.numReviews || 0,
      }));
      initialTotalPages = Math.ceil(totalProducts / limit);
    }

    return {
      props: {
        category: JSON.parse(JSON.stringify(category)),
        subCategories: JSON.parse(JSON.stringify(subCategoriesData)),
        initialProducts,
        initialTotalPages,
        breadcrumbItems: JSON.parse(JSON.stringify(breadcrumbItems)),
      },
      revalidate: 3600, // Revalidate once per hour
    };
  } catch (error) {
    console.error('Error fetching category or products:', error);
    return { notFound: true };
  }
};

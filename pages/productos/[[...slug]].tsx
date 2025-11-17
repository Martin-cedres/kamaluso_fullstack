import { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head' // Importo Head
import Image from 'next/image'
import Link from 'next/link'
import { getProductHref } from '../../lib/utils'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import SeoMeta from '../../components/SeoMeta'
import Breadcrumbs from '../../components/Breadcrumbs';
import { isValidObjectId } from 'mongoose';
import connectDB from '../../lib/mongoose';
import Product from '../../models/Product';
import Category from '@/models/Category';
import ProductCard from '../../components/ProductCard'; // Importar ProductCard

// Interfaces
interface IProduct {
  _id: string;
  nombre: string;
  descripcion?: string;
  descripcionBreve?: string;
  puntosClave?: string[];
  descripcionExtensa?: string;
  basePrice?: number; // Nuevo
  precio?: number; // Antiguo
  precioFlex?: number; // Antiguo
  precioDura?: number; // Antiguo
  categoria?: string; // Keep this for non-populated cases or other uses
  category?: Category; // Add this for the populated case
  destacado?: boolean;
  imageUrl?: string;
  images?: string[];
  alt?: string;
  slug?: string;
  tapa?: string;
  averageRating?: number;
  numReviews?: number;
  customizationGroups?: any[]; // Nuevo
  soloDestacado?: boolean; // Nuevo campo
}

interface Category {
  _id: string // Changed from 'id' to '_id'
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
  const { slug: slugArray } = router.query;
  const categorySlug = Array.isArray(slugArray) ? slugArray[slugArray.length - 1] : slugArray;

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

    const fetchProducts = async () => {
      setLoading(true)
      try {
        let apiUrl = `/api/products/listar?page=${currentPage}&search=${debouncedSearchTerm}`;
        if (categorySlug) {
          apiUrl += `&categoria=${categorySlug}`;
        }
        
        const res = await fetch(apiUrl);
        const data = await res.json();
        
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 0);
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
        setTotalPages(0)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
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
        
        <main className="min-h-screen bg-gray-50 px-6">
          <h1 className="text-3xl font-semibold text-center mb-10">
            Categoría no encontrada
          </h1>
        </main>
      </>
    )
  }

  const isAgendaCategory = category?.nombre.toLowerCase().includes('agenda');

  const pageTitle = isAgendaCategory
    ? `Agendas 2026 y Planners Personalizados en Uruguay | Kamaluso`
    : `${category.nombre} Personalizadas en Uruguay | Kamaluso`;

  const pageDescription = isAgendaCategory
    ? `Descubre nuestras agendas 2026, planners y cuadernos personalizados. Diseños únicos para organizar tu año. ¡Envíos a todo Uruguay!`
    : `${category.descripcion}. Calidad y diseño único con envío a todo Uruguay.`;

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

      
      <main className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 pt-24">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex md:hidden">
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
                    key={cat._id} // Changed from 'cat.id' to 'cat._id'
                    href={`/productos/${category.slug}/${cat.slug}`}
                    className="w-full sm:w-56 bg-white rounded-2xl overflow-hidden transform transition hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/50"
                  >
                    <div className="relative w-full h-48">
                      <Image
                        src={cat.imagen || '/placeholder.png'}
                        alt={cat.nombre}
                        fill
                        sizes="(max-width: 640px) 100vw, 224px"
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
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 max-w-full mx-auto">
                {products.length === 0 && (
                  <p className="col-span-full text-center w-full text-gray-500">
                    No se encontraron productos para esta selección.
                  </p>
                )}

                {products.map((product) => (
                  <ProductCard key={product._id} product={{
                    _id: product._id,
                    nombre: product.nombre,
                    // Lógica de precio actualizada para compatibilidad
                    precio: product.basePrice || product.precioDura || product.precioFlex || product.precio || 0,
                    soloDestacado: product.soloDestacado, // Pasar soloDestacado
                    alt: product.alt, // Pasar el alt
                    // ... otros campos
                    categoria: product.categoria || '',
                    slug: product.slug || '',
                    imagen: product.imageUrl || '/placeholder.png',
                    averageRating: product.averageRating,
                    numReviews: product.numReviews,
                    // Pasar los nuevos campos para el schema
                    descripcionBreve: product.descripcionBreve,
                    descripcionExtensa: product.descripcionExtensa,
                    puntosClave: product.puntosClave,
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
  const allCategories = await Category.find({}).lean(); // Fetch all categories

  const categorySlugMap = new Map<string, string>();
  allCategories.forEach(cat => {
    categorySlugMap.set(cat._id.toString(), cat.slug);
  });

  const paths = allCategories.map((cat: any) => {
    if (cat.parent) {
      const parentSlug = categorySlugMap.get(cat.parent.toString());
      if (parentSlug) {
        return {
          params: { slug: [parentSlug, cat.slug] },
        };
      }
    }
    // Fallback for main categories or if parent not found
    return {
      params: { slug: [cat.slug] },
    };
  });

  // Add the root /productos path
  paths.push({ params: { slug: [] } });

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const slug = context.params?.slug as string[] | undefined || [];

  // Handle the /productos route (no slug)
  if (slug.length === 0) {
    await connectDB();
    const page = 1;
    const limit = 12; // Productos por página
    const query = { soloDestacado: { $ne: true } };

    const productsData = await Product.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
      
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    const products = JSON.parse(JSON.stringify(productsData));

    const breadcrumbItems = [
      { name: 'Inicio', href: '/' },
      { name: 'Todos los Productos', href: '/productos' },
    ];

    return {
      props: {
        category: {
          _id: 'all-products',
          nombre: 'Todos los Productos',
          descripcion: 'Explora el catálogo completo de productos de Papelería Personalizada Kamaluso.',
          slug: '' // Slug vacío para identificar esta vista
        },
        subCategories: [],
        initialProducts: products,
        initialTotalPages: totalPages, // Pasar el total de páginas calculado
        breadcrumbItems,
      },
      revalidate: 3600,
    };
  }

  let currentCategorySlug: string;
  let parentCategorySlug: string | null = null;

  if (slug.length === 1) {
    currentCategorySlug = slug[0];
  } else if (slug.length === 2) {
    parentCategorySlug = slug[0];
    currentCategorySlug = slug[1];
  } else {
    console.log('getStaticProps: Returning 404 - Invalid slug length', slug);
    return { notFound: true };
  }

  try {
    await connectDB();

    const currentCategory = await Category.findOne({ slug: currentCategorySlug }).lean();

    if (!currentCategory) {
      // Si no se encuentra una categoría, podría ser una URL de producto antigua. Intentemos redirigir.
      const product = await Product.findOne({ slug: currentCategorySlug }).lean();
      if (product) {
        return {
          redirect: {
            destination: `/productos/detail/${product.slug}`,
            permanent: true, // Usar redirección permanente para SEO
          },
        };
      }

      console.log('getStaticProps: Returning 404 - currentCategory not found for slug:', currentCategorySlug);
      return { notFound: true };
    }

    let parentCategory = null;
    if (parentCategorySlug) {
      parentCategory = await Category.findOne({ slug: parentCategorySlug }).lean();
      if (!parentCategory) {
        console.log('getStaticProps: Returning 404 - parentCategory not found for slug:', parentCategorySlug);
        return { notFound: true };
      }
      // Check if the current category's parent matches the parent from the URL
      if (currentCategory.parent && parentCategory._id.toString() !== currentCategory.parent.toString()) {
        console.log('getStaticProps: Returning 404 - Parent mismatch. URL parent:', parentCategorySlug, 'Actual parent:', currentCategory.parent.toString());
        return { notFound: true };
      }
    } else if (currentCategory.parent) {
      // If no parent slug was provided in URL but the current category has a parent in DB
      console.log('getStaticProps: Returning 404 - URL incomplete. Category has parent but none in URL.', currentCategorySlug);
      return { notFound: true };
    }

    const subCategoriesData = await Category.find({ parent: currentCategory._id }).lean();

    let initialProducts = [];
    let initialTotalPages = 0;

    // --- Construcción de Breadcrumbs --- //
    let breadcrumbItems = [{ name: 'Inicio', href: '/' }];

    if (parentCategory) {
      breadcrumbItems.push({ name: parentCategory.nombre, href: `/productos/${parentCategory.slug}` });
    }
    breadcrumbItems.push({ name: currentCategory.nombre, href: `/productos/${slug.join('/')}` });
    // --- Fin Construcción de Breadcrumbs ---

    // Si la categoría actual NO tiene subcategorías, buscamos sus productos.
    // O si es una subcategoría (es decir, ya es un nodo hoja en la jerarquía de URL)
    if (subCategoriesData.length === 0 || slug.length === 2) {
      const categorySlugsToQuery = [currentCategory.slug];
      const page = 1;
      const limit = 12;
      const query: any = {
        $or: [
          { categoria: { $in: categorySlugsToQuery } },
          { subCategoria: { $in: categorySlugsToQuery } },
        ],
        soloDestacado: { $ne: true }, // Excluir productos soloDestacado
      };

      const aggregationPipeline = [
        { $match: query },
        { $sort: { order: 1, creadoEn: -1 } },
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
        category: JSON.parse(JSON.stringify(currentCategory)),
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

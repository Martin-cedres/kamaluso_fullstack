import Image from 'next/image'
import Link from 'next/link'
import Head from 'next/head' // Importo Head para añadir el schema
import SeoMeta from '../components/SeoMeta'; // Importar SeoMeta

import Product from '../models/Product'; // Importar el MODELO Product
import Review from '../models/Review'; // Importar el modelo Review
import Category from '../models/Category'; // Importar el MODELO Category
import connectDB from '../lib/mongoose' // Importar connectDB
import { GetStaticProps } from 'next' // Importar GetStaticProps
import FeaturedReviews from '../components/FeaturedReviews'; // Importar FeaturedReviews
import ProductCard from '../components/ProductCard'; // Importar ProductCard
import { IReview } from '../models/Review'; // Importar la interfaz IReview global

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
  basePrice?: number // Usar basePrice
  precio?: number // Antiguo
  precioFlex?: number // Antiguo
  precioDura?: number // Antiguo
  tapa?: string
  averageRating?: number; // Para el rating
  numReviews?: number; // Para el rating
}

interface HomeProps {
  destacados: Product[]
  categories: Categoria[]
  reviews: IReview[];
}

export default function Home({ destacados, categories, reviews }: HomeProps) {
  const getCardPrice = (product: Product) => {
    if (product.basePrice) {
      return (
        <p className="text-pink-500 font-semibold text-lg mb-4">
          $U {product.basePrice}
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

  // --- Mis datos para el Schema de Google --- //
  const siteUrl = 'https://www.papeleriapersonalizada.uy'
  // Aquí defino los datos de mi organización y sitio web para que Google los entienda.
  // Esto puede ayudar a que aparezca la caja de búsqueda de mi sitio en Google.
  const siteSchema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      url: siteUrl,
      logo: `${siteUrl}/logo.webp`,
      name: 'Kamaluso Papelería',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      url: siteUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl}/productos?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ]

  return (
    <>
      <SeoMeta
        title="Papelería Personalizada en Uruguay | Agendas y Libretas | Kamaluso"
        description="Encuentra agendas, libretas y planners 100% personalizados en Kamaluso. Diseños únicos y materiales de alta calidad. ¡Enviamos a todo el Uruguay!"
      />
      <Head>
        {/* Inyecto los datos estructurados de mi sitio para que Google los lea */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
          key="site-jsonld"
        />
      </Head>

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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
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
            Explora nuestras colecciones
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
                    sizes="(max-width: 639px) 90vw, (max-width: 767px) 256px, 320px"
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
        {destacados.length > 0 && (
          <section className="px-6 py-12">
            <h2 className="text-3xl font-semibold text-center mb-10">
              Los más elegidos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {destacados.map((product) => (
                <ProductCard key={product._id} product={{
                  _id: product._id,
                  nombre: product.nombre,
                  precio: product.basePrice || product.precio || 0,
                  imagen: product.imageUrl || '/placeholder.png',
                  alt: product.alt,
                  slug: product.slug || '',
                  categoria: product.categoria || '',
                  averageRating: product.averageRating,
                  numReviews: product.numReviews,
                }} />
              ))}
            </div>
          </section>
        )}

        {/* Reseñas Destacadas */}
        <FeaturedReviews reviews={reviews} />

        {/* Sección de Proceso de Compra */}
        <section className="px-6 py-12 bg-white">
          <h2 className="text-3xl font-semibold text-center mb-10">
            Así funciona tu compra personalizada
          </h2>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-pink-100 text-pink-500 text-3xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Elige y Personaliza</h3>
              <p className="text-gray-600">Selecciona tu producto y ajusta los detalles a tu gusto.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-pink-100 text-pink-500 text-3xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Paga Seguro</h3>
              <p className="text-gray-600">Completa tu compra con nuestros métodos de pago seguros.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-pink-100 text-pink-500 text-3xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Recibe en Casa</h3>
              <p className="text-gray-600">Tu pedido llega a la puerta de tu casa en todo Uruguay.</p>
            </div>
          </div>
          <div className="text-center mt-10">
            <Link
              href="/proceso-de-compra"
              className="inline-block bg-pink-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-pink-600 transition"
            >
              Ver Proceso Completo
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  await connectDB();

  // Aggregation pipeline to fetch featured products with review data
  const destacadosPipeline = [
    { $match: { destacado: true } },
    { $sort: { order: 1, createdAt: -1 } as any },
    { $limit: 4 },
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

  const destacadosData = await Product.aggregate(destacadosPipeline);
  const destacados = JSON.parse(JSON.stringify(destacadosData)).map((p:any) => ({
    ...p,
    averageRating: p.averageRating === null ? 0 : p.averageRating,
    numReviews: p.numReviews || 0,
  }));

  // Fetch categories (only root categories)
  const categoriesData = await Category.find({ parent: { $in: [null, undefined] } }).lean();
  const categories = JSON.parse(JSON.stringify(categoriesData));

  // Fetch recent reviews
  const reviewsData = await Review.find({ isApproved: true })
    .sort({ createdAt: -1 })
    .limit(15)
    .populate('user', 'name')
    .populate('product', 'nombre imageUrl _id slug')
    .lean();
  const reviews = JSON.parse(JSON.stringify(reviewsData));


  return {
    props: {
      destacados,
      categories,
      reviews,
    },
    revalidate: 3600, // Revalidate once per hour
  };
};
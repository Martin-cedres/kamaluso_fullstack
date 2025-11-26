import Image from 'next/image'
import Link from 'next/link'
import Head from 'next/head' // Importo Head para añadir el schema
import SeoMeta from '../components/SeoMeta'; // Importar SeoMeta

import { StarIcon } from '@heroicons/react/24/solid'; // Importar StarIcon
import Product from '../models/Product'; // Importar el MODELO Product
import Review from '../models/Review'; // Importar el modelo Review
import Category from '../models/Category'; // Importar el MODELO Category
import connectDB from '../lib/mongoose' // Importar connectDB
import { GetStaticProps } from 'next' // Importar GetStaticProps
import FeaturedReviews from '../components/FeaturedReviews'; // Importar FeaturedReviews
import ProductCard from '../components/ProductCard'; // Importar ProductCard
import { IReview } from '../models/Review'; // Importar la interfaz IReview global
import NewsletterForm from '../components/NewsletterForm'; // Importar NewsletterForm
import HowItWorks from '../components/HowItWorks'; // Importar HowItWorks
import RealResultsGallery from '../components/RealResultsGallery'; // Importar RealResultsGallery

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
  // Nuevos campos para el schema
  descripcionBreve?: string;
  descripcionExtensa?: string;
  puntosClave?: string[];
}

interface HomeProps {
  destacados: Product[]
  categories: Categoria[]
  reviews: IReview[];
}

export default function Home({ destacados, categories, reviews }: HomeProps) {
  // Calculate real average rating from reviews
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length)
    : 0;
  const totalReviews = reviews.length;

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
        {/* Hero Section - Rediseñado para Impacto */}
        <section className="relative bg-fondoClaro overflow-hidden">
          {/* Patrón de fondo sutil */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(#0F172A 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 lg:py-28 flex flex-col-reverse md:flex-row items-center justify-between gap-8 md:gap-12 relative z-10">

            {/* Texto Hero */}
            <div className="flex-1 text-center md:text-left space-y-8">

              {/* Badge de Confianza - DYNAMIC from real reviews - Clickable */}
              <a
                href="#reviews"
                className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 animate-fade-in-up hover:shadow-md hover:border-pink-200 transition-all duration-300 cursor-pointer group"
                title={`Basado en ${totalReviews} reseñas reales de clientes. Click para ver detalles.`}
              >
                <div className="flex text-amarillo">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-5 w-5 transition-transform group-hover:scale-110 ${i < Math.floor(averageRating)
                          ? 'text-amarillo'
                          : i < Math.ceil(averageRating) && averageRating % 1 >= 0.5
                            ? 'text-amarillo'
                            : 'text-gray-300'
                        }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-textoSecundario">
                  <span className="font-bold text-textoPrimario">{averageRating.toFixed(1)}/5</span>
                  <span className="text-xs text-pink-600 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">→ Ver reseñas</span>
                </span>
              </a>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-heading text-textoPrimario leading-tight tracking-tight">
                Tu Vida, <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rosa to-moradoClaro">
                  Organizada con Estilo.
                </span>
              </h1>

              <p className="text-xl text-textoSecundario max-w-2xl mx-auto md:mx-0 leading-relaxed">
                Deja el caos atrás con agendas y libretas 100% personalizadas.
                Diseñadas en Uruguay para quienes valoran su tiempo y su identidad.
              </p>

              <div className="flex flex-col items-center gap-4 justify-center md:justify-start pt-4">
                <Link
                  href="/productos"
                  className="group relative w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-rosa to-moradoClaro text-white rounded-2xl font-bold text-xl shadow-kamalusoPink hover:shadow-kamalusoPinkXl hover:-translate-y-2 transition-all duration-300 text-center overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    Explorar Productos
                    <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </Link>
                <p className="text-sm text-textoSecundario">
                  ✨ Personaliza tu agenda, libreta o planner ideal
                </p>
              </div>

              <div className="pt-8 flex items-center justify-center md:justify-start gap-8 text-sm text-textoSecundario font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-verde"></span>
                  Envíos a todo el país
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-verde"></span>
                  Calidad Premium
                </div>
              </div>
            </div>

            {/* Imagen Hero */}
            <div className="flex-1 w-full max-w-lg md:max-w-xl lg:max-w-2xl relative">
              <div className="relative aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl transform md:rotate-3 hover:rotate-0 transition-transform duration-500 isolate will-change-transform">
                <Image
                  src="/Agendas tapa dura y tapa flex papeleriapersonalizada.uy kamaluso.webp"
                  alt="Agendas Tapa Dura y Tapa Flex Personalizadas Uruguay - Kamaluso"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-700"
                />
                {/* Floating Card Effect */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-white/60 hidden sm:block">
                  {/* Header with Logo and Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <Image
                      src="/logo.webp"
                      alt="Kamaluso Logo"
                      width={40}
                      height={40}
                      className="rounded-lg"
                    />
                    <span className="bg-gradient-to-r from-rosa to-moradoClaro text-white text-xs font-bold px-3 py-1 rounded-full">
                      100% Tuya
                    </span>
                  </div>

                  {/* Title */}
                  <p className="font-bold text-textoPrimario text-lg mb-3">Personalización Real</p>

                  {/* Benefits */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-textoSecundario">
                      <span className="text-base">✨</span>
                      <span>Tapas + tu logo o diseño</span>
                    </div>
                    <div className="flex items-center gap-2 text-textoSecundario">
                      <span className="text-base">📖</span>
                      <span>Interiores premium</span>
                    </div>
                    <div className="flex items-center gap-2 text-textoSecundario">
                      <span className="text-base">💪</span>
                      <span>Tapa Dura o Flex</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative Elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-amarillo/20 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rosa/20 rounded-full blur-3xl -z-10"></div>
            </div>

          </div>
        </section>

        {/* Expectativas hechas realidad - MOVED UP for immediate social proof */}
        <RealResultsGallery />

        {/* Productos Destacados - MOVED UP to show products earlier */}
        {destacados.length > 0 && (
          <section className="px-6 py-16 bg-white">
            <h2 className="text-3xl font-semibold text-center mb-8">
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
                  descripcionBreve: product.descripcionBreve,
                  descripcionExtensa: product.descripcionExtensa,
                  puntosClave: product.puntosClave,
                }} />
              ))}
            </div>
          </section>
        )}

        {/* Cómo Funciona - MOVED DOWN after products */}
        <HowItWorks />

        {/* Categorías Dinámicas */}
        <section className="px-6 py-16 bg-gray-50">
          <h2 className="text-3xl font-semibold text-center mb-8">
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

        {/* Reseñas Destacadas - MOVED UP before newsletter */}
        <FeaturedReviews reviews={reviews} />

        {/* Newsletter Form */}
        <NewsletterForm />
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
    { $project: { reviews: 0, approvedReviews: 0, 'customizationGroups.options._id': 0 } },
  ];

  const destacadosData = await Product.aggregate(destacadosPipeline);
  const destacados = JSON.parse(JSON.stringify(destacadosData)).map((p: any) => ({
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
import Image from 'next/image'
import Link from 'next/link'
import Head from 'next/head'
import SeoMeta from '../components/SeoMeta';

import { StarIcon, ShieldCheckIcon, TruckIcon, SparklesIcon } from '@heroicons/react/24/solid';
import Product from '../models/Product';
import Review from '../models/Review';
import Category from '../models/Category';
import connectDB from '../lib/mongoose'
import { GetStaticProps } from 'next'
import FeaturedReviews from '../components/FeaturedReviews';
import ProductCarousel from '../components/ProductCarousel';
import { IReview } from '../models/Review';
import NewsletterForm from '../components/NewsletterForm';
import HowItWorks from '../components/HowItWorks';
import RealResultsGallery from '../components/RealResultsGallery';
import HeroTextRotator from '../components/HeroTextRotator';
import ScrollReveal from '../components/ScrollReveal';

// Interfaces
interface Categoria {
  _id: string
  nombre: string
  slug: string
  imagen?: string
}

interface ProductType {
  _id: string
  nombre: string
  imageUrl?: string
  alt?: string
  categoria?: string
  slug?: string
  basePrice?: number
  precio?: number
  precioFlex?: number
  precioDura?: number
  tapa?: string
  averageRating?: number
  numReviews?: number
  descripcionBreve?: string
  descripcionExtensa?: string
  puntosClave?: string[]
}

interface CategoryProducts {
  slug: string
  nombre: string
  products: ProductType[]
}

interface HomeProps {
  destacados: ProductType[]
  categories: Categoria[]
  reviews: IReview[]
  productsByCategory: CategoryProducts[]
}

export default function Home({ destacados, categories, reviews, productsByCategory }: HomeProps) {
  // Calculate real average rating from reviews
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length)
    : 0;
  const totalReviews = reviews.length;

  return (
    <>
      <SeoMeta
        title="Papelería Personalizada en Uruguay | Agendas y Libretas | Kamaluso"
        description="Encuentra agendas, libretas y planners 100% personalizados en Kamaluso. Diseños únicos y materiales de alta calidad. ¡Enviamos a todo el Uruguay!"
        keywords="agendas personalizadas, agendas 2026, papelería personalizada uruguay, libretas corporativas, regalos empresariales, planners"
      />

      <main className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">

        {/* ========== HERO COMPACTO (TIPOGRÁFICO) ========== */}
        <section className="relative bg-gradient-to-b from-[#FFFAF5] to-white overflow-hidden border-b border-slate-50">
          <div className="max-w-7xl mx-auto px-6 pt-10 pb-20 md:pt-24 md:pb-32 relative z-10 flex flex-col items-center">

            {/* Contenedor de Texto Hero - Centrado y Puro (Sin Botones) */}
            <div className="w-full flex flex-col items-center space-y-6 md:space-y-10 max-w-4xl text-center">

              {/* Trust Badge Minimalista */}
              <div className="flex items-center gap-1.5 mb-2 opacity-50">
                <div className="flex text-amarillo">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-3 w-3 fill-current" />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">+1000 clientes felices</span>
              </div>

              {/* Headline Elite */}
              <h1 className="text-3xl md:text-6xl lg:text-7xl font-bold font-heading text-slate-950 leading-[1.05] tracking-tight">
                Papelería personalizada <br className="hidden md:block" />
                premium para <br />
                <span className="inline-block overflow-visible relative font-serif italic text-slate-800 pt-2">
                  <HeroTextRotator />
                </span>
              </h1>

              {/* Beneficios ultra-compactos y elegantes */}
              <div className="flex flex-wrap justify-center gap-x-12 gap-y-3 text-[10px] md:text-xs text-slate-400 font-medium uppercase tracking-[0.3em] pt-2">
                <div className="flex items-center gap-2">
                  <span>Tapas Únicas</span>
                </div>
                <div className="flex items-center gap-2 border-l border-slate-200 pl-12 hidden md:flex">
                  <span>Interiores Premium</span>
                </div>
                <div className="flex items-center gap-2 border-l border-slate-200 pl-12 border-none md:border-solid">
                  <span>Hecho en Uruguay</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ========== CARRUSELES DE PRODUCTOS POR CATEGORÍA (EDITORIAL SYSTEM) ========== */}
        {
          productsByCategory.map((catGroup, idx) => {
            const isAgendas = catGroup.slug === 'agendas-tapa-dura';
            const isLibretas = catGroup.slug === 'libretas-y-cuadernos';
            const isSublimable = catGroup.slug === 'papeleria-sublimable';
            const displayNumber = (idx + 1).toString().padStart(2, '0');

            if (catGroup.products.length === 0) return null;

            return (
              <ScrollReveal key={catGroup.slug}>
                <section className={`px-6 ${idx === 0 ? 'pt-12 md:pt-20' : 'pt-16 md:pt-28'} pb-12 md:pb-24 overflow-hidden relative bg-white`}>
                  <div className="max-w-[1400px] mx-auto">

                    {/* Header Ultra-Limpio & Consistente - Aumento de Margen inferior para Serif */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-16 px-4 sm:px-8 gap-6 relative z-10">

                      <div className="flex items-center gap-4 md:gap-6">
                        <span className="text-xl md:text-3xl font-serif text-slate-300">{displayNumber}</span>

                        {/* Agendas: Ruta 1 - Serif Italiana */}
                        {isAgendas && (
                          <h2 className="text-5xl md:text-7xl lg:text-[5.5rem] font-serif italic text-slate-900 leading-none tracking-tight">
                            Agendas
                          </h2>
                        )}

                        {/* Libretas: Ruta 1 - Serif Italiana */}
                        {isLibretas && (
                          <h2 className="text-5xl md:text-7xl lg:text-[5.5rem] font-serif italic text-slate-900 leading-none tracking-tight">
                            Libretas y Cuadernos
                          </h2>
                        )}

                        {/* Sublimable: Ruta 1 - Serif Italiana (Ya tenía una base similar, la refinamos) */}
                        {isSublimable && (
                          <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-4">
                            <span className="text-4xl md:text-7xl lg:text-[5.5rem] font-serif italic text-slate-900 leading-none">
                              Papelería Sublimable
                            </span>
                          </div>
                        )}

                        {/* Default for others: Ruta 1 - Serif Italiana */}
                        {!isAgendas && !isLibretas && !isSublimable && (
                          <h2 className="text-5xl md:text-7xl lg:text-[5.5rem] font-serif italic text-slate-900 leading-none tracking-tight">
                            {catGroup.nombre}
                          </h2>
                        )}
                      </div>

                      <Link
                        href={`/productos/${catGroup.slug}`}
                        className={`group flex items-center gap-3 text-base md:text-xl font-serif italic pb-2 border-b transition-all duration-300 ${isSublimable ? 'text-slate-800 border-slate-800/20 hover:border-slate-800' : 'text-slate-950 border-slate-200 hover:border-slate-950'
                          }`}
                      >
                        Ver colección →
                        <svg
                          className={`w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 ${isSublimable ? 'text-slate-800' : 'text-slate-400'}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </div>

                    {/* Carrusel con padding para que asome la siguiente tarjeta */}
                    <div className="relative">
                      <ProductCarousel products={catGroup.products} />
                    </div>
                  </div>
                </section>
              </ScrollReveal>
            );
          })
        }

        {/* Reseñas Destacadas - Prueba social */}
        <ScrollReveal>
          <div className="bg-white py-12 md:py-32 border-t border-slate-50">
            <FeaturedReviews reviews={reviews} />
          </div>
        </ScrollReveal>

        {/* Expectativas hechas realidad - Galería de trabajos reales */}
        <ScrollReveal>
          <div className="bg-white pb-20 md:pb-32 pt-0">
            <RealResultsGallery />
          </div>
        </ScrollReveal>

        {/* ========== SECCIÓN B2B EMPRESARIAL ========== */}
        <ScrollReveal>
          <section className="relative bg-slate-900 py-16 md:py-40 px-6 overflow-hidden">
            {/* Patrón sutil de fondo */}
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }}
            />

            <div className="max-w-[1400px] mx-auto relative z-10">
              {/* Header Editorial B2B */}
              <div className="flex flex-col items-center text-center mb-16 md:mb-24">
                <span className="inline-block px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[10px] font-bold tracking-[0.3em] uppercase mb-8">
                  Servicio Corporativo
                </span>
                <h2 className="text-4xl md:text-7xl font-extrabold font-heading text-white mb-6 tracking-tight leading-none uppercase">
                  Regalos para <br />
                  <span className="font-serif italic text-amber-400 normal-case">tu empresa</span>
                </h2>
                <div className="w-20 h-[1px] bg-amber-400/40 mb-8"></div>
                <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                  Papelería personalizada con la identidad de tu marca.
                  <span className="text-white"> Sin mínimos</span> y con envíos a todo Uruguay.
                </p>
              </div>

              {/* Features Grid - Boutique Style */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-20 max-w-5xl mx-auto">
                {[
                  { icon: '🎨', title: 'Tu Logo', desc: 'Identidad fiel' },
                  { icon: '📦', title: 'Desde 1 unidad', desc: 'Flexibilidad total' },
                  { icon: '⚡', title: 'Cotización 24h', desc: 'Agilidad pro' },
                  { icon: '🇺🇾', title: 'Envíos Nacionales', desc: 'A todo el país' },
                ].map((feature, idx) => (
                  <div
                    key={idx}
                    className="group bg-slate-800/20 backdrop-blur-md border border-slate-700/50 rounded-[20px] p-6 md:p-8 text-center hover:border-amber-400/40 transition-all duration-500 hover:-translate-y-1"
                  >
                    <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-500">{feature.icon}</div>
                    <h3 className="text-white font-bold text-sm md:text-base uppercase tracking-wider mb-2">{feature.title}</h3>
                    <p className="text-slate-500 text-xs md:text-sm font-medium">{feature.desc}</p>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/regalos-empresariales"
                  className="group relative px-10 py-5 bg-white text-slate-900 rounded-xl font-bold text-lg hover:bg-amber-400 transition-all duration-500 flex items-center gap-3 overflow-hidden"
                >
                  Solicitar Cotización
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/preguntas-frecuentes-b2b"
                  className="px-10 py-5 border border-slate-700 text-slate-400 rounded-xl font-semibold hover:bg-slate-800 hover:text-white hover:border-slate-500 transition-all duration-500"
                >
                  Preguntas Frecuentes
                </Link>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Newsletter Form */}
        <ScrollReveal>
          <div className="bg-white py-20 md:py-32 border-t border-slate-50">
            <NewsletterForm />
          </div>
        </ScrollReveal>
      </main >
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  await connectDB();

  // Pipeline reutilizable para agregar datos de reviews a productos
  const reviewLookupStages = [
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

  // Fetch destacados (para compatible con otros usos)
  const destacadosPipeline = [
    { $match: { destacado: true } },
    { $sort: { order: 1, createdAt: -1 } as any },
    { $limit: 12 },
    ...reviewLookupStages,
  ];

  const destacadosData = await Product.aggregate(destacadosPipeline);
  const destacados = JSON.parse(JSON.stringify(destacadosData)).map((p: any) => ({
    ...p,
    averageRating: p.averageRating === null ? 0 : p.averageRating,
    numReviews: p.numReviews || 0,
  }));

  // Fetch categorías raíz
  const categoriesData = await Category.find({ parent: { $in: [null, undefined] } }).lean();
  const categories = JSON.parse(JSON.stringify(categoriesData));

  // Fetch productos agrupados por categoría para los carruseles
  // Necesitamos buscar por la categoría raíz Y todas sus subcategorías
  const allCategoriesData = await Category.find({}).lean();
  const allCats = JSON.parse(JSON.stringify(allCategoriesData));

  const productsByCategoryUnsorted: CategoryProducts[] = [];

  for (const cat of categories) {
    // Obtener slugs de esta categoría + todas sus subcategorías
    const subCatSlugs = allCats
      .filter((c: any) => c.parent && c.parent.toString() === cat._id.toString())
      .map((c: any) => c.slug);
    const allSlugs = [cat.slug, ...subCatSlugs];

    const productsPipeline = [
      {
        $match: {
          $or: [
            { categoria: { $in: allSlugs } },
            { subCategoria: { $in: allSlugs } }
          ],
          status: { $ne: 'inactivo' },
          soloDestacado: { $ne: true }
        }
      },
      { $sort: { order: 1, createdAt: -1 } as any },
      { $limit: 12 },
      ...reviewLookupStages,
    ];

    const productsData = await Product.aggregate(productsPipeline);
    const products = JSON.parse(JSON.stringify(productsData)).map((p: any) => ({
      ...p,
      averageRating: p.averageRating === null ? 0 : p.averageRating,
      numReviews: p.numReviews || 0,
    }));

    if (products.length > 0) {
      productsByCategoryUnsorted.push({
        slug: cat.slug,
        nombre: cat.nombre,
        products,
      });
    }
  }

  // Forzar orden: agendas-tapa-dura → libretas-y-cuadernos → papeleria-sublimable → resto
  const priorityOrder = ['agendas-tapa-dura', 'libretas-y-cuadernos', 'papeleria-sublimable'];
  const productsByCategory = [
    ...priorityOrder
      .map(slug => productsByCategoryUnsorted.find(c => c.slug === slug))
      .filter(Boolean) as CategoryProducts[],
    ...productsByCategoryUnsorted.filter(c => !priorityOrder.includes(c.slug)),
  ];

  // Fetch recent reviews
  const reviewsData = await Review.find({ isApproved: true })
    .sort({ createdAt: -1 })
    .limit(15)
    .populate('user', 'name')
    .populate('product', 'nombre imageUrl _id slug')
    .lean();

  const reviews = JSON.parse(JSON.stringify(reviewsData)).filter((r: any) => r.product != null);

  return {
    props: {
      destacados,
      categories,
      reviews,
      productsByCategory,
    },
    revalidate: 3600,
  };
};
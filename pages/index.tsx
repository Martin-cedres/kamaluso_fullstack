import Image from 'next/image'
import Link from 'next/link'
import Head from 'next/head' // Importo Head para añadir el schema
import SeoMeta from '../components/SeoMeta'; // Importar SeoMeta

import { StarIcon, ShieldCheckIcon, TruckIcon, SparklesIcon } from '@heroicons/react/24/solid'; // Importar StarIcon
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
import ProductCarousel from '../components/ProductCarousel'; // Importar ProductCarousel
import HeroTextRotator from '../components/HeroTextRotator'; // Importar HeroTextRotator
import { useState, useEffect } from 'react'; // Import hooks (needed later?)
import { motion, AnimatePresence } from 'framer-motion'; // Import framer-motion (needed later?)
import Marquee from '../components/Marquee'; // Import Marquee
import ScrollReveal from '../components/ScrollReveal'; // Import ScrollReveal
import OptimizedImage from '../components/OptimizedImage'; // Import OptimizedImage

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
  // ELIMINADO: Estado de Hero Text que causaba re-renders globales
  // const [heroTextIndex, setHeroTextIndex] = useState(0);
  // ... useEffect logic ...

  // Calculate real average rating from reviews
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length)
    : 0;
  // ...
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



  return (
    <>
      <SeoMeta
        title="Papelería Personalizada en Uruguay | Agendas y Libretas | Kamaluso"
        description="Encuentra agendas, libretas y planners 100% personalizados en Kamaluso. Diseños únicos y materiales de alta calidad. ¡Enviamos a todo el Uruguay!"
        keywords="agendas personalizadas, agendas 2026, papelería personalizada uruguay, libretas corporativas, regalos empresariales, planners"
      />


      <main className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
        {/* Hero Section - Rediseñado para Impacto */}
        <ScrollReveal>
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

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-heading text-slate-900 leading-tight tracking-tighter pb-6">
                  Organizá tu vida <br className="hidden md:block" />
                  <span className="block text-slate-500 mt-2 min-h-[130px] md:min-h-[150px] lg:min-h-[170px] overflow-visible pb-4 font-bold tracking-tight">
                    <span className="block overflow-visible mb-1 text-slate-900">
                      con productos para
                    </span>
                    <span className="inline-block overflow-visible text-slate-900 relative">
                      <HeroTextRotator />
                      <span className="absolute bottom-1 left-0 w-full h-3 bg-amber-400/30 -z-10"></span>
                    </span>
                  </span>
                </h1>

                <p className="text-xl text-textoSecundario max-w-2xl mx-auto md:mx-0 leading-relaxed">
                  Decile chau al caos. Obtené agendas y libretas 100% personalizadas, hechas en Uruguay para quienes quieren organización, estilo y una identidad única.
                </p>

                <div className="flex flex-col items-center gap-4 justify-center md:justify-start pt-4">
                  <Link
                    href="/productos"
                    className="group relative w-full sm:w-auto px-10 py-4 bg-slate-900 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:bg-black hover:-translate-y-1 transition-all duration-300 text-center overflow-hidden border border-slate-800"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      Ver Colección
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </Link>

                  {/* Micro Social Proof */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest pt-2">
                    <div className="flex items-center gap-1.5 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                      <span className="text-amber-500 text-sm">✓</span>
                      <span>+500 Clientes Felices</span>
                    </div>
                    <div className="flex items-center gap-1.5 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                      <span className="text-amber-500 text-sm">✓</span>
                      <span>Calidad Premium Artesanal</span>
                    </div>
                  </div>
                  <p className="text-sm text-textoSecundario">
                    ✨ Personaliza tu agenda, libreta o planner ideal
                  </p>
                </div>

                <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-x-8 gap-y-4 text-sm text-textoSecundario font-medium">
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="w-5 h-5 text-verde" />
                    <span>Compra 100% Segura</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TruckIcon className="w-5 h-5 text-azul" />
                    <span>Envíos a todo Uruguay</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-amarillo" />
                    <span>Calidad Garantizada</span>
                  </div>
                </div>
              </div>

              {/* Imagen Hero */}
              <div className="flex-1 w-full max-w-lg md:max-w-xl lg:max-w-2xl relative">
                <div className="relative aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl transform md:rotate-3 hover:rotate-0 transition-transform duration-500">
                  <Image
                    src="/Agendas%20tapa%20dura%20y%20tapa%20flex%20papeleriapersonalizada.uy%20kamaluso.webp"
                    alt="Agendas Tapa Dura Personalizadas Uruguay - Kamaluso"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectFit: 'cover' }}
                    className="z-0"
                  />
                  {/* Floating Card Effect */}
                  <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-white/60 hidden sm:block z-20">
                    {/* Header with Logo and Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <Image
                        src="/logo.webp"
                        alt="Kamaluso Logo"
                        width={40}
                        height={40}
                        className="rounded-lg"
                        unoptimized
                      />
                      <span className="bg-slate-900 text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full shadow-sm">
                        ✨ 100% Tuya
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
                        <span>Tapa Dura Laminada</span>
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
        </ScrollReveal>

        {/* Marquee Section */}
        <Marquee items={["Envíos a todo el país", "Calidad Premium", "100% Personalizado", "Hecho en Uruguay", "Compra Segura"]} />



        {/* Categorías Dinámicas */}
        <ScrollReveal>
          <section className="px-6 py-16 bg-gray-50">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-rosa uppercase tracking-widest mb-3">Explorá</p>
              <h2 className="text-4xl md:text-6xl font-bold font-heading text-slate-900 tracking-tighter">
                Categorías
              </h2>
            </div>
            <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">


              {categories
                .filter(cat => cat.slug !== 'papeleria-sublimable')
                .map((cat) => (
                  <Link
                    key={cat._id}
                    href={`/productos/${cat.slug}`}
                    className="w-full sm:w-64 md:w-80 bg-white rounded-2xl overflow-hidden transform transition hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/50"
                  >
                    <div className="relative w-full h-64">
                      <OptimizedImage
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

              {/* Tarjeta Especial: Sublimación */}
              <Link
                href="/productos/papeleria-sublimable"
                className="w-full sm:w-64 md:w-80 bg-gradient-to-br from-naranja via-orange-500 to-amarillo rounded-2xl overflow-hidden transform transition hover:-translate-y-2 hover:shadow-xl hover:shadow-orange-500/40 relative group"
              >
                <div className="absolute top-4 right-4 bg-white text-naranja text-xs font-bold px-3 py-1 rounded-full z-10">
                  Exclusivo Sublimadores
                </div>
                <div className="relative w-full h-64 flex items-center justify-center">
                  <div className="text-center text-white p-6">
                    {/* Icono textual o SVG si se prefiere, por ahora texto simple o nada para evitar emojis conflictivos */}
                    <span className="text-6xl mb-4 block group-hover:scale-110 transition-transform font-sans">📦</span>
                    <p className="text-lg font-medium opacity-90">Insumos para</p>
                  </div>
                </div>
                <div className="p-4 text-center bg-white/10 backdrop-blur-sm">
                  <h3 className="text-xl font-bold text-gray-900">Sublimación</h3>
                  <p className="text-gray-800 text-sm mt-1">Insumos Premium</p>
                </div>
              </Link>
            </div>
          </section>
        </ScrollReveal>

        {/* ========== SECCIÓN B2B EMPRESARIAL DEDICADA ========== */}
        <ScrollReveal>
          <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 px-6 overflow-hidden shadow-2xl">
            {/* Patrón sutil de fondo */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
                backgroundSize: '32px 32px'
              }}
            />

            <div className="max-w-6xl mx-auto relative z-10">
              {/* Header */}
              <div className="text-center mb-12">
                <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-widest uppercase mb-4">
                  Soluciones Corporativas
                </span>
                <h2 className="text-3xl md:text-5xl font-bold font-heading text-white mb-4 tracking-tighter">
                  ¿Buscás regalos para tu
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200"> empresa</span>?
                </h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                  Agendas, libretas y papelería personalizada con el logo de tu empresa.
                  Sin mínimo de compra. Envíos a todo Uruguay.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
                {[
                  { icon: '🎨', title: 'Tu Logo', desc: 'Personalización total' },
                  { icon: '📦', title: 'Sin Mínimo', desc: 'Desde 1 unidad' },
                  { icon: '⚡', title: 'Respuesta 24hs', desc: 'Cotización rápida' },
                  { icon: '🇺🇾', title: 'Todo Uruguay', desc: 'Envíos a cualquier punto' },
                ].map((feature, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 md:p-6 text-center hover:border-amber-500/30 transition-colors"
                  >
                    <div className="text-2xl md:text-3xl mb-2">{feature.icon}</div>
                    <h3 className="text-white font-semibold text-sm md:text-base">{feature.title}</h3>
                    <p className="text-slate-500 text-xs md:text-sm">{feature.desc}</p>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/regalos-empresariales"
                  className="group relative px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 rounded-xl font-bold text-lg shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center gap-3"
                >
                  Solicitar Cotización
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/preguntas-frecuentes-b2b"
                  className="px-8 py-4 border border-slate-600 text-slate-300 rounded-xl font-semibold hover:bg-slate-800 hover:text-white hover:border-slate-500 transition-all duration-300"
                >
                  Ver Preguntas Frecuentes
                </Link>
              </div>

              {/* Trust indicator */}
              <p className="text-center text-slate-500 text-sm mt-8">
                ✓ Facturación oficial &nbsp;•&nbsp; ✓ Mockup gratis &nbsp;•&nbsp; ✓ Calidad premium
              </p>
            </div>
          </section>
        </ScrollReveal>


        {/* Productos Destacados - MOVED UP to show products earlier */}
        {destacados.length > 0 && (
          <ScrollReveal>
            <section className="px-6 py-16 bg-white overflow-hidden">
              <div className="text-center mb-16">
                <p className="text-sm font-semibold text-rosa uppercase tracking-widest mb-3">Más vendidos</p>
                <h2 className="text-4xl md:text-6xl font-bold font-heading text-slate-900 tracking-tighter">
                  Los más elegidos
                </h2>
              </div>
              <div className="max-w-[1400px] mx-auto">
                <ProductCarousel products={destacados} />
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* Cómo Funciona - MOVED DOWN after products */}
        <ScrollReveal>
          <HowItWorks />
        </ScrollReveal>

        {/* Reseñas Destacadas - MOVED UP before newsletter */}
        <ScrollReveal>
          <FeaturedReviews reviews={reviews} />
        </ScrollReveal>

        {/* Expectativas hechas realidad */}
        <ScrollReveal>
          <RealResultsGallery />
        </ScrollReveal>

        {/* Newsletter Form */}
        <ScrollReveal>
          <NewsletterForm />
        </ScrollReveal>
      </main >
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  await connectDB();

  // Aggregation pipeline to fetch featured products with review data
  const destacadosPipeline = [
    { $match: { destacado: true } },
    { $sort: { order: 1, createdAt: -1 } as any },
    { $limit: 12 },
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

  // Filter out reviews where the product was deleted
  const reviews = JSON.parse(JSON.stringify(reviewsData)).filter((r: any) => r.product != null);


  return {
    props: {
      destacados,
      categories,
      reviews,
    },
    revalidate: 3600, // Revalidate once per hour
  };
};
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { CartProvider } from '../context/CartContext'
import { CategoryProvider } from '../context/CategoryContext'
import Navbar from '../components/Navbar'
import TopBar from '../components/TopBar'
import Head from 'next/head'
import Script from 'next/script'
import dynamic from 'next/dynamic'
import { Toaster } from 'react-hot-toast'
import { Inter, Outfit } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { useRouter } from 'next/router'

// Dynamically import components
const DynamicFooter = dynamic(() => import('../components/Footer'))
const DynamicWhatsAppButton = dynamic(
  () => import('../components/WhatsAppButton'),
  {
    ssr: false,
  },
)

// Setup next/font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const canonicalUrl = `https://www.papeleriapersonalizada.uy${router.asPath}`

  return (
    <SessionProvider session={pageProps.session}>
      <Head>
        {/* Favicon */}
        <link rel="icon" href="/logo.webp" type="image/webp" />

        {/* Google Fonts are now in _document.tsx */}

        {/* Canonical link */}
        <link rel="canonical" href={canonicalUrl} />

        {/* SEO básico */}
        <title>Papelería Personalizada | Kamaluso</title>
        <meta
          name="description"
          content="Papelería personalizada en Uruguay. Agendas, cuadernos y libretas únicas, con tapa dura, hechas a tu medida."
        />
        <meta name="google-site-verification" content="flCBkjVQOhBSoOP_IBxyt7jdN4HJFIn3vmnInkUckqY" />

        {/* Open Graph (para redes y Google) */}
        <meta property="og:title" content="Papelería Personalizada | Kamaluso" />
        <meta
          property="og:description"
          content="Diseñamos papelería personalizada para empresas, escuelas y particulares en Uruguay. Envíos a todo el país."
        />
        <meta
          property="og:image"
          content="https://www.papeleriapersonalizada.uy/og-image.jpg"
        />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Papelería Personalizada" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Papelería Personalizada | Kamaluso" />
        <meta
          name="twitter:description"
          content="Papelería personalizada en Uruguay. Agendas, cuadernos y libretas únicas hechas a tu medida."
        />
        <meta
          name="twitter:image"
          content="https://www.papeleriapersonalizada.uy/og-image.jpg"
        />

        {/* Idioma y localización */}
        <meta httpEquiv="Content-Language" content="es-UY" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Papelería Personalizada | Kamaluso" />

        {/* Limpieza de referencias a Vercel */}
        <meta name="application-name" content="Papelería Personalizada" />
        <meta name="generator" content="Next.js" />
      </Head>

      {/* Google Analytics */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />

      <CartProvider>
        <CategoryProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 5000,
              success: {
                style: {
                  background: '#ec4899', // pink-500
                  color: '#fff',
                  borderRadius: '1rem', // rounded-2xl equivalent
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#ec4899',
                },
              },
              error: {
                style: {
                  background: '#ef4444', // red-500
                  color: '#fff',
                  borderRadius: '1rem',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#ef4444',
                },
              },
            }}
          />
          {/* Apply the font class to the main container */}
          <div
            className={`${inter.variable} ${outfit.variable} font-sans flex flex-col min-h-screen`}
          >
            <TopBar />
            <Navbar />
            <main className="flex-grow pb-24 transition-all duration-300" style={{ paddingTop: 'calc(var(--topbar-height, 0px) + 4rem)' }}>
              <Component {...pageProps} />
              <Analytics />
              <SpeedInsights />
              {router.pathname !== '/productos/detail/[slug]' && <DynamicWhatsAppButton />}
              <DynamicFooter />
            </main>
          </div>
        </CategoryProvider>
      </CartProvider>
    </SessionProvider>
  )
}

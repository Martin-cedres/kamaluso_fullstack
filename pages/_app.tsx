
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '../context/CartContext';
import { CategoryProvider } from '../context/CategoryContext';
import Navbar from '../components/Navbar';
import Head from 'next/head';
import Script from 'next/script';
import dynamic from 'next/dynamic';
import { Toaster } from 'react-hot-toast';
import { Inter } from 'next/font/google';

// Dynamically import components
const DynamicFooter = dynamic(() => import('../components/Footer'));
const DynamicWhatsAppButton = dynamic(() => import('../components/WhatsAppButton'), {
  ssr: false,
});

// Setup next/font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <Head>
        <link rel="icon" href="/logo.webp" type="image/webp" />
      </Head>
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
          <div className={`${inter.variable} font-sans flex flex-col min-h-screen`}>
            <Navbar />
            <main className="flex-grow">
              <Component {...pageProps} />
            </main>
            <DynamicWhatsAppButton />
            <DynamicFooter />
          </div>
        </CategoryProvider>
      </CartProvider>
    </SessionProvider>
  );
}

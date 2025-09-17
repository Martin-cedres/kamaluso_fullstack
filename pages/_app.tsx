import '../styles/globals.css'
import type { AppProps } from 'next/app'

import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '../context/CartContext';
import { CategoryProvider } from '../context/CategoryContext'; // Import CategoryProvider
import Navbar from '../components/Navbar';
import Head from 'next/head'; // Import Head

import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <Head> {/* Added Head component */}
        <link rel="icon" href="/logo.webp" type="image/webp" />
      </Head>
      <CartProvider>
        <CategoryProvider> {/* Wrap with CategoryProvider */}
          <Toaster
            position="top-right"
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
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Component {...pageProps} />
            </main>
            <WhatsAppButton />
            <Footer />
          </div>
        </CategoryProvider>
      </CartProvider>
    </SessionProvider>
  );
}
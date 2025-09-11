import '../styles/globals.css'
import type { AppProps } from 'next/app'

import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Head from 'next/head'; // Import Head

import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <Head> {/* Added Head component */}
        <link rel="icon" href="/logo.webp" type="image/webp" />
      </Head>
      <CartProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Component {...pageProps} />
          </main>
          <WhatsAppButton />
          <Footer />
        </div>
      </CartProvider>
    </SessionProvider>
  );
}
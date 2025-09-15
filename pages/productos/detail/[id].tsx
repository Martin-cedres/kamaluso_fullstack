import { GetServerSideProps } from 'next';
import Navbar from "../../../components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCart } from "../../../context/CartContext";
import { useState, useEffect } from 'react';
import SeoMeta from '../../../components/SeoMeta';

interface Product {
  _id: string;
  nombre: string;
  descripcion?: string;
  precio?: number;
  precioDura?: number;
  categoria?: string;
  destacado?: boolean;
  imageUrl?: string;
  images?: string[];
  alt?: string;
  slug?: string;
  tapa?: string;
  seoTitle?: string;
  seoDescription?: string;
  precioFlex?: number;
}

// Helper function to get the display price for a product card
const getCardDisplayPrice = (product: Product) => {
  if (product.precioDura) return product.precioDura;
  if (product.precioFlex) return product.precioFlex;
  if (product.precio) return product.precio;
  return null;
};

interface Props {
  product: Product | null;
  relatedProducts: Product[];
}

export default function ProductDetailPage({ product, relatedProducts }: Props) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const [finish, setFinish] = useState('Brillo'); // Estado para el acabado

  useEffect(() => {
    if (product?.images?.[0]) {
      setSelectedImage(product.images[0]);
    } else if (product?.imageUrl) {
      setSelectedImage(product.imageUrl);
    }
  }, [product?._id]);

  const handlePrevImage = () => {
    if (!product?.images || product.images.length < 2) return;
    const currentIndex = product.images.findIndex(img => img === selectedImage);
    const prevIndex = (currentIndex - 1 + product.images.length) % product.images.length;
    setSelectedImage(product.images[prevIndex]);
  };

  const handleNextImage = () => {
    if (!product?.images || product.images.length < 2) return;
    const currentIndex = product.images.findIndex(img => img === selectedImage);
    const nextIndex = (currentIndex + 1) % product.images.length;
    setSelectedImage(product.images[nextIndex]);
  };

  const getDisplayPrice = () => {
    if (!product) return null;
    if (product.precioDura) return product.precioDura;
    if (product.precioFlex) return product.precioFlex;
    if (product.precio) return product.precio;
    return null;
  };

  const displayPrice = getDisplayPrice();

  const handleAddToCart = () => {
    if (product) {
      const priceToUse = displayPrice;
      if (priceToUse === undefined || priceToUse === null || isNaN(priceToUse)) {
        alert("Este producto no se puede agregar al carrito porque no tiene un precio definido.");
        return;
      }
      
      const itemToAdd = {
        _id: product._id,
        nombre: product.nombre,
        precio: priceToUse,
        imageUrl: product.images?.[0] || product.imageUrl,
        finish: product.tapa === 'Tapa Dura' ? finish : undefined,
      };

      addToCart(itemToAdd);
      alert(`${product.nombre} ${itemToAdd.finish ? `(${itemToAdd.finish})` : ''} ha sido agregado al carrito!`);
    }
  };

  if (!product) return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center pt-32">
        <p className="text-gray-500 text-xl">Producto no encontrado.</p>
      </main>
    </>
  );

  const pageTitle = product.seoTitle || `${product.nombre} | Kamaluso Papelería`;
  const pageDescription = product.seoDescription || product.descripcion || "Encuentra los mejores artículos de papelería personalizada en Kamaluso.";
  const pageImage = product.images?.[0] || product.imageUrl || "/logo.webp";
  const canonicalUrl = `/productos/detail/${product._id}`;

  return (
    <>
      <SeoMeta 
        title={pageTitle}
        description={pageDescription}
        image={pageImage}
        url={canonicalUrl}
        type="product"
      />

      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-32 px-6 pb-16">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12">

          {/* Imágenes */}
          <div className="flex-1">
            <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={selectedImage || "/placeholder.png"}
                alt={product.alt || product.nombre}
                fill
                style={{ objectFit: "contain" }}
                className="rounded-2xl transition-opacity duration-300"
                key={selectedImage}
              />
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-40 hover:opacity-100 transition-opacity duration-300 z-10"
                    aria-label="Imagen anterior"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-40 hover:opacity-100 transition-opacity duration-300 z-10"
                    aria-label="Siguiente imagen"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 mt-4 overflow-x-auto p-2">
                {product.images.map((img, i) => (
                  <div 
                    key={i} 
                    className={`relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${selectedImage === img ? 'border-4 border-pink-500' : 'border-2 border-transparent hover:border-pink-300'}`}
                    onClick={() => setSelectedImage(img)}
                  >
                    <Image
                      src={img}
                      alt={`${product.alt || product.nombre} thumbnail ${i + 1}`}
                      fill
                      style={{ objectFit: "contain" }}
                      className="rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-4">{product.nombre}</h1>
              {displayPrice && (
                <p className="text-pink-500 font-semibold text-2xl mb-6">
                  $U {displayPrice}
                </p>
              )}
              {product.tapa && (
                <p className="mb-4 text-gray-700 font-medium">
                  Tapa: <span className="font-semibold">{product.tapa}</span>
                </p>
              )}
              <p className="text-gray-600 mb-6">{product.descripcion}</p>

              {/* Selector de Acabado Condicional */}
              {product.tapa === 'Tapa Dura' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Acabado</label>
                  <div className="flex rounded-md shadow-sm">
                    <button
                      type="button"
                      onClick={() => setFinish('Brillo')}
                      className={`flex-1 px-4 py-2 text-sm rounded-l-md border ${finish === 'Brillo' ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-700 border-gray-300'}`}
                    >
                      Brillo
                    </button>
                    <button
                      type="button"
                      onClick={() => setFinish('Mate')}
                      className={`flex-1 px-4 py-2 text-sm rounded-r-md border border-l-0 ${finish === 'Mate' ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-700 border-gray-300'}`}
                    >
                      Mate
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button 
                onClick={handleAddToCart}
                className="bg-pink-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:bg-pink-600 transition"
              >
                Agregar al carrito
              </button>
              <button
                onClick={() => router.back()}
                className="px-6 py-3 rounded-2xl border border-pink-500 text-pink-500 font-semibold text-center hover:bg-pink-50 transition"
              >
                Ir atrás
              </button>
            </div>
          </div>
        </div>

        {/* Productos relacionados */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-3xl font-semibold mb-8 text-center">Productos relacionados</h2>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-6xl mx-auto">
              {relatedProducts.map((p) => {
                const cardPrice = getCardDisplayPrice(p);
                return (
                  <Link key={p._id} href={`/productos/detail/${p._id}`} className="block bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 group">
                      <div className="relative w-full h-56">
                        <Image 
                          src={p.images?.[0] || p.imageUrl || '/placeholder.png'} 
                          alt={p.nombre} 
                          fill
                          style={{ objectFit: "contain" }}
                          className="group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg truncate text-gray-800">{p.nombre}</h3>
                        {cardPrice && (
                          <p className="text-pink-500 font-semibold mt-2">$U {cardPrice}</p>
                        )}
                      </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  let product: Product | null = null;
  let relatedProducts: Product[] = [];

  try {
    const productRes = await fetch(`${baseUrl}/api/products/listar?_id=${id}`);
    if (productRes.ok) {
      const data = await productRes.json();
      product = data[0] || null;
    } else {
      // If product fetch fails, return immediately with empty props
      return { props: { product: null, relatedProducts: [] } };
    }

    // If product was found and has a category, fetch related products
    if (product && product.categoria) {
      const categoryParam = encodeURIComponent(product.categoria);
      const relatedRes = await fetch(`${baseUrl}/api/products/listar?categoria=${categoryParam}&limit=5`);
      
      if (relatedRes.ok) {
        const allRelated = await relatedRes.json();
        // Ensure the API response is an array before processing
        if (Array.isArray(allRelated)) {
          relatedProducts = allRelated
            .filter((p: Product) => p._id !== product?._id) // Exclude the current product
            .slice(0, 4); // Limit to 4
        }
      }
    }

    return {
      props: { product, relatedProducts },
    };
  } catch (error) {
    console.error('Error fetching product details:', error);
    return {
      props: { product: null, relatedProducts: [] }, // Return empty props on any error
    };
  }
};

import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Navbar from "../../../components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../../../context/CartContext";
import { useState } from 'react';
import toast from 'react-hot-toast';

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

interface Props {
  product: Product | null;
}

export default function ProductDetailPage({ product }: Props) {
  const { addToCart } = useCart();
  const [finish, setFinish] = useState<string | null>(null); // Estado para el acabado

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
      if (product.tapa === 'Tapa Dura' && finish === null) {
        toast.error("Por favor, selecciona una textura para la tapa.");
        return;
      }

      const priceToUse = displayPrice;
      if (priceToUse === undefined || priceToUse === null || isNaN(priceToUse)) {
        toast.error("Este producto no se puede agregar al carrito porque no tiene un precio definido.");
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
      toast.success(`${product.nombre} ${itemToAdd.finish ? `(${itemToAdd.finish})` : ''} ha sido agregado al carrito!`);
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
  const canonicalUrl = `https://www.papeleriapersonalizada.uy/productos/${product.categoria}/${product.slug}`;

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.nombre,
    "image": pageImage,
    "description": pageDescription,
    "sku": product._id,
    "offers": {
      "@type": "Offer",
      "url": canonicalUrl,
      "priceCurrency": "UYU",
      "price": displayPrice,
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition"
    }
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={pageImage} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={canonicalUrl} />
        <meta property="twitter:title" content={pageTitle} />
        <meta property="twitter:description" content={pageDescription} />
        <meta property="twitter:image" content={pageImage} />

        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      </Head>

      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-32 px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12">

          {/* Imágenes */}
          <div className="flex-1">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={product.images?.[0] || product.imageUrl || "/placeholder.png"}
                alt={product.alt || product.nombre}
                fill
                style={{ objectFit: "cover" }}
                className="rounded-2xl"
              />
            </div>

            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 mt-4 overflow-x-auto">
                {product.images.map((img, i) => (
                  <div key={i} className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer border-2 border-pink-500">
                    <Image
                      src={img}
                      alt={product.alt || product.nombre}
                      fill
                      style={{ objectFit: "cover" }}
                      className="rounded-xl"
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

              <p className="text-gray-600 mb-6">{product.descripcion}</p>

              {/* Selector de Acabado Condicional */}
              {product.tapa === 'Tapa Dura' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Textura de tapas</label>
                  <div className="flex rounded-xl shadow-sm">
                    <button
                      type="button"
                      onClick={() => setFinish('Brillo')}
                      className={`flex-1 px-4 py-2 text-sm rounded-xl border ${finish === 'Brillo' ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-700 border-gray-300'}`}
                    >
                      Brillo
                    </button>
                    <button
                      type="button"
                      onClick={() => setFinish('Mate')}
                      className={`flex-1 px-4 py-2 text-sm rounded-xl border ${finish === 'Mate' ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-700 border-gray-300'}`}
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
              <Link
                href={`/productos/${product.categoria}`}
                className="px-6 py-3 rounded-2xl border border-pink-500 text-pink-500 font-semibold text-center hover:bg-pink-50 transition"
              >
                Volver a {product.categoria}
              </Link>
            </div>
          </div>
        </div>

        {/* Productos relacionados */}
        <section className="mt-16">
          <h2 className="text-3xl font-semibold mb-8 text-center">Productos relacionados</h2>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-6xl mx-auto">
            {/* Mapear productos relacionados si querés */}
          </div>
        </section>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug, categoria } = context.query;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  try {
    const res = await fetch(`${baseUrl}/api/products/listar?slug=${slug}&categoria=${categoria}`);
    if (!res.ok) {
      return { props: { product: null } };
    }
    const data = await res.json();
    const product = data[0] || null;

    return {
      props: { product },
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return {
      props: { product: null },
    };
  }
};

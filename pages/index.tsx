import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";

const CATEGORIES = [
  { title: "Sublimables", href: "/productos?sublimables=true", img: "/categorias/sublimables.jpg" },
  { title: "Personalizados", href: "/productos?personalizados=true", img: "/categorias/personalizados.jpg" },
  { title: "ImprimeYa", href: "/imprimeya", img: "/categorias/imprimeya.jpg" },
];

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/products/listar")
      .then(res => res.json())
      .then(data => {
        const destacados = data.filter((p: any) => p.destacado).slice(0, 4);
        setProducts(destacados);
      })
      .catch(() => setProducts([]));
  }, []);

  return (
    <>
      <Head>
        <title>Kamaluso | Papelería Personalizada en San José de Mayo</title>
        <meta name="description" content="Kamaluso ofrece agendas, libretas, blocks y cuadernos personalizables en San José de Mayo. Envíos a todo Uruguay." />
        <meta name="keywords" content="papelería personalizada Uruguay, agendas personalizadas, libretas sublimadas, tienda de papelería San José, productos personalizados Uruguay, regalos personalizados Uruguay, sublimación San José de Mayo" />
      </Head>

      <main className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
        <Navbar />

        {/* Hero */}
        <section className="flex flex-col items-center justify-center text-center px-6 py-24">
          <Image src="/logo.webp" alt="Logo Kamaluso" width={140} height={140} className="mb-6" />
          <h1 className="text-5xl font-bold mb-4">Papelería Sublimable y Personalizada</h1>
          <p className="text-lg text-gray-600 mb-8">
            Agendas, libretas y cuadernos únicos. <br />
            ✨ Envíos a todo Uruguay desde San José de Mayo ✨
          </p>
        </section>

        {/* Categorías */}
        <section className="px-6 py-12 bg-gray-50">
          <h2 className="text-3xl font-semibold text-center mb-10">Categorías</h2>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 max-w-6xl mx-auto">
            {CATEGORIES.map(cat => (
              <Link key={cat.title} href={cat.href} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition transform hover:-translate-y-1">
                <div className="relative w-full h-48">
                  <Image src={cat.img} alt={cat.title} fill className="object-cover" />
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-xl font-semibold">{cat.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Productos Destacados */}
        <section className="px-6 py-12">
          <h2 className="text-3xl font-semibold text-center mb-10">Productos Destacados</h2>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-6xl mx-auto">
            {products.length === 0 && (
              <p className="text-center col-span-full text-gray-500">No hay productos destacados</p>
            )}
            {products.map(product => (
              <div key={product._id} className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition transform hover:-translate-y-1">
                {product.imagen ? (
                  <Image
                    src={product.imagen}
                    alt={product.alt || product.nombre}
                    width={300}
                    height={200}
                    className="rounded-xl object-cover w-full h-48 mb-4"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-xl mb-4 grid place-items-center text-gray-500">
                    Sin imagen
                  </div>
                )}
                <h3 className="font-semibold text-lg mb-2">{product.nombre}</h3>
                <p className="text-gray-500 text-sm mb-3">{product.descripcion || "Papelería única y personalizable. Envíos a todo Uruguay."}</p>
                <Link href={`/productos/${product.slug || product._id}`} className="inline-block bg-pink-500 text-white px-4 py-2 rounded-xl shadow hover:bg-pink-600 transition">
                  Ver más
                </Link>
              </div>
            ))}
          </div>
        </section>

        <footer className="bg-gray-100 text-center py-6 mt-10 border-t">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Kamaluso · San José de Mayo · Envíos a todo Uruguay</p>
        </footer>
      </main>
    </>
  );
}


import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { getProductHref } from "../lib/utils"; // Importar la función de utilidad
import SeoMeta from "../components/SeoMeta"; // Importar el nuevo componente SEO

// Definir una interfaz para los objetos de categoría y producto para mayor seguridad de tipos
interface Categoria {
  _id: string;
  nombre: string;
  slug: string;
  imagen?: string;
}

interface Product {
  _id: string;
  nombre: string;
  imageUrl?: string;
  alt?: string;
  categoria?: string; // Add this line
  slug?: string; // Add this line
  precio?: number; // Add this line
  precioFlex?: number; // Add this line
  precioDura?: number; // Add this line
  tapa?: string; // Add this line
  // Añade otros campos de producto que necesites
}

export default function Home() {
  const [destacados, setDestacados] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);

  useEffect(() => {
    // Cargar productos destacados
    fetch("/api/products/listar?destacado=true")
      .then((res) => res.json())
      .then((data) => {
        setDestacados(data.slice(0, 4)); // Mostrar solo los primeros 4
      })
      .catch((err) => {
        console.error("Error cargando destacados:", err);
        setDestacados([]);
      });

    // Cargar categorías
    fetch("/api/categorias/listar")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => {
        console.error("Error cargando categorías:", err);
        setCategories([]);
      });
  }, []);

  const getCardPrice = (product: Product) => {
    if (product.precioDura && product.precioFlex) {
      return (
        <>
          <p className="text-pink-500 font-semibold text-lg mb-1">Dura: $U {product.precioDura}</p>
          <p className="text-pink-500 font-semibold text-lg mb-4">Flex: $U {product.precioFlex}</p>
        </>
      );
    }
    if (product.precioDura) {
      return <p className="text-pink-500 font-semibold text-lg mb-4">$U {product.precioDura}</p>;
    }
    if (product.precioFlex) {
      return <p className="text-pink-500 font-semibold text-lg mb-4">$U {product.precioFlex}</p>;
    }
    if (product.precio) {
      return <p className="text-pink-500 font-semibold text-lg mb-4">$U {product.precio}</p>;
    }
    return null;
  };

  return (
    <>
      <SeoMeta />

      <Navbar />

      <main className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
        {/* Hero */}
        <section className="flex flex-col items-center justify-center text-center px-6 py-24">
          <Image src="/logo.webp" alt="Logo Kamaluso" width={140} height={140} className="mb-6" />
          <h1 className="text-5xl font-bold mb-4">Papelería Personalizada</h1>
          <p className="text-lg text-gray-600 mb-8">Agendas, libretas y cuadernos únicos. <br /> ✨ Envíos a todo Uruguay ✨</p>
        </section>

        {/* Categorías Dinámicas */}
        <section className="px-6 py-12 bg-gray-50">
          <h2 className="text-3xl font-semibold text-center mb-10">Categorías</h2>
          <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/productos/${cat.slug}`}
                className="w-full sm:w-64 md:w-80 bg-white rounded-2xl overflow-hidden transform transition hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/50"
              >
                <div className="relative w-full h-48">
                  <Image src={cat.imagen || "/placeholder.png"} alt={cat.nombre} fill style={{ objectFit: "cover" }} />
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-xl font-semibold">{cat.nombre}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Productos Destacados */}
        <section className="px-6 py-12">
          <h2 className="text-3xl font-semibold text-center mb-10">Productos Destacados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {destacados.length === 0 && <p className="text-center col-span-full text-gray-500">No hay productos destacados</p>}
            {destacados.map((product) => (
              <div
                key={product._id}
                className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg hover:shadow-pink-500/50 transition transform hover:-translate-y-1"
              >
                {product.imageUrl ? (
                  <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden">
                    <Image
                      src={product.imageUrl}
                      alt={product.alt || product.nombre}
                      fill
                      style={{ objectFit: "cover" }}
                      className="rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-xl mb-4 grid place-items-center text-gray-500">Sin imagen</div>
                )}
                <h3 className="font-semibold text-lg mb-4">{product.nombre}</h3>
                <div>
                  {getCardPrice(product)}
                </div>
                <Link
                  href={getProductHref(product)}
                  className="inline-block bg-pink-500 text-white px-4 py-2 rounded-xl shadow"
                >
                  Ver más
                </Link>
              </div>
            ))}
          </div>
        </section>

        </main>
    </>
  );
}

import { GetServerSideProps } from 'next';
import Navbar from "../../components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { getProductHref } from "../../lib/utils";
import { categorias } from '../../lib/categorias'; // Import categories
import { useState } from 'react';
import SeoMeta from '../../components/SeoMeta'; // Importar el componente SEO

interface Product {
  _id: string;
  nombre: string;
  descripcion?: string;
  precio?: number;
  precioFlex?: number;
  precioDura?: number;
  categoria?: string;
  destacado?: boolean;
  imageUrl?: string;
  images?: string[];
  alt?: string;
  slug?: string;
  tapa?: string;
}

interface Category {
    id: string;
    nombre: string;
    descripcion: string;
    tipoPrecios: string;
    slug: string;
    imagen: string;
    keywords: string[];
}

interface CategoriaPageProps {
  initialProducts: Product[];
  initialCategory: Category | null;
}

const ITEMS_PER_PAGE = 16;

export default function CategoryPage({ initialProducts, initialCategory }: CategoriaPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(initialCategory);
  const [currentPage, setCurrentPage] = useState(1); // Add this line

  if (!selectedCategory) {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50 pt-32 px-6">
                <h1 className="text-3xl font-semibold text-center mb-10">Categoría no encontrada</h1>
            </main>
        </>
    );
  }

  const indexOfLast = currentPage * ITEMS_PER_PAGE;
  const indexOfFirst = indexOfLast - ITEMS_PER_PAGE;
  const currentProducts = initialProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(initialProducts.length / ITEMS_PER_PAGE);

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

  const pageTitle = `${selectedCategory.nombre} | Kamaluso Papelería`;
  const pageDescription = selectedCategory.descripcion;
  const canonicalUrl = `/productos/${selectedCategory.slug}`;

  return (
    <>
      <SeoMeta 
        title={pageTitle}
        description={pageDescription}
        image={selectedCategory.imagen}
        url={canonicalUrl}
      />

      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-32 px-6">
        <h1 className="text-3xl font-semibold text-center mb-4">{selectedCategory.nombre}</h1>
        <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">{selectedCategory.descripcion}</p>

        <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
          {currentProducts.length === 0 && (
            <p className="text-center w-full text-gray-500">No se encontraron productos para esta selección.</p>
          )}

          {currentProducts.map((product) => (
            <Link key={product._id} href={getProductHref(product)}>
              <div className="w-64 bg-white rounded-2xl overflow-hidden transform transition hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/50 flex flex-col cursor-pointer">
                <div className="relative w-full h-48">
                  <Image
                    src={product.imageUrl || "/placeholder.png"}
                    alt={product.alt || product.nombre}
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-xl"
                  />
                </div>

                <div className="p-4 text-center flex flex-col flex-grow">
                  <h3 className="font-semibold text-lg mb-2">{product.nombre}</h3>

                  <div>{getCardPrice(product)}</div>

                  <div className="inline-block bg-pink-500 text-white px-4 py-2 rounded-xl shadow mt-auto">
                    Ver más
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  currentPage === i + 1
                    ? "bg-pink-500 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-pink-50 hover:text-pink-500"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { categoria } = context.query;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const category = categorias.find(c => c.slug === categoria) || null;

  try {
    const res = await fetch(`${baseUrl}/api/products/listar?categoria=${categoria}`);
    const products = await res.json();

    return {
      props: { initialProducts: products, initialCategory: category, baseUrl },
    };
  } catch (error) {
    console.error('Error fetching products for category:', error);
    return {
      props: { initialProducts: [], initialCategory: category, baseUrl },
    };
  }
};

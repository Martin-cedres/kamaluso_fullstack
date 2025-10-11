import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../../components/Navbar'
import Image from 'next/image'
import Link from 'next/link'
import { getProductHref } from '../../lib/utils';
import SeoMeta from '../../components/SeoMeta';
import ProductCard from '../../components/ProductCard'; // Importar ProductCard

interface Product {
  _id: string;
  nombre: string;
  precio?: number;
  precioFlex?: number;
  precioDura?: number;
  basePrice?: number; // Añadir esta prop
  categoria?: string;
  slug?: string;
  imageUrl?: string;
  averageRating?: number;
  numReviews?: number;
  tapa?: string;
  soloDestacado?: boolean; // Nuevo campo
}

const ITEMS_PER_PAGE = 16;

export default function ProductsPage() {
  const router = useRouter();
  const { categoria, subCategoria } = router.query;

  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [title, setTitle] = useState('Productos');

  useEffect(() => {
    if (!router.isReady) return;

    let apiUrl = '/api/products/listar';
    const queryParams = new URLSearchParams();
    queryParams.append('soloDestacado', 'false'); // Excluir productos solo destacados

    if (categoria) {
      queryParams.append('categoria', categoria as string);
      setTitle(categoria as string);
    }
    if (subCategoria) {
      queryParams.append('subCategoria', subCategoria as string);
      setTitle(subCategoria as string);
    }

    if (queryParams.toString()) {
      apiUrl += `?${queryParams.toString()}`;
    }

    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []))
      .catch(() => setProducts([]));
  }, [router.isReady, categoria, subCategoria]);

  const indexOfLast = currentPage * ITEMS_PER_PAGE;
  const indexOfFirst = indexOfLast - ITEMS_PER_PAGE;
  const currentProducts = products.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  const formattedTitle =
    typeof title === 'string'
      ? title.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Productos';

  return (
    <>
      <SeoMeta
        title="Nuestros Productos | Kamaluso Papelería"
        description="Explora todos nuestros productos de papelería personalizada: agendas, cuadernos, libretas y más."
        url="/productos"
      />
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-32 px-6">
        <h1 className="text-3xl font-semibold text-center mb-10">
          {formattedTitle}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {currentProducts.length === 0 && (
            <p className="text-center w-full col-span-full text-gray-500">
              No se encontraron productos para esta selección.
            </p>
          )}

          {currentProducts.map((product) => (
            <ProductCard key={product._id} product={{
              _id: product._id,
              nombre: product.nombre,
              precio: product.precioDura || product.precioFlex || product.precio || 0,
              soloDestacado: product.soloDestacado, // Pasar soloDestacado
              categoria: product.categoria || '',
              slug: product.slug || '',
              imagen: product.imageUrl || '/placeholder.png',
              averageRating: product.averageRating,
              numReviews: product.numReviews,
            }} />
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
                    ? 'bg-pink-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-pink-50 hover:text-pink-500'
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

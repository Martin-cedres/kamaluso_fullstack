
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../../components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { getProductHref } from "../../lib/utils"; // Usamos la utilidad de URL
import SeoMeta from "../../components/SeoMeta";

interface Product {
  _id: string;
  nombre: string;
  descripcion?: string;
  precio?: number;
  precioFlex?: number;
  precioDura?: number;
  categoria?: string;
  subCategoria?: string;
  destacado?: boolean;
  imageUrl?: string;
  images?: string[];
  alt?: string;
  slug?: string;
  tapa?: string;
}

const ITEMS_PER_PAGE = 16;

export default function ProductsPage() {
  const router = useRouter();
  const { categoria, subCategoria } = router.query;

  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [title, setTitle] = useState("Productos");

  useEffect(() => {
    if (!router.isReady) return;

    let apiUrl = "/api/products/listar";
    const queryParams = new URLSearchParams();

    if (categoria) {
      queryParams.append("categoria", categoria as string);
      setTitle(categoria as string);
    }
    if (subCategoria) {
      queryParams.append("subCategoria", subCategoria as string);
      // Si hay subcategoría, el título es más específico
      setTitle(subCategoria as string);
    }

    if (queryParams.toString()) {
      apiUrl += `?${queryParams.toString()}`;
    }

    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => setProducts([]));

  }, [router.isReady, categoria, subCategoria]);

  const indexOfLast = currentPage * ITEMS_PER_PAGE;
  const indexOfFirst = indexOfLast - ITEMS_PER_PAGE;
  const currentProducts = products.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

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

  const formattedTitle =
    typeof title === "string"
      ? title.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "Productos";

  return (
    <>
      <SeoMeta 
        title="Nuestros Productos | Kamaluso Papelería"
        description="Explora todos nuestros productos de papelería personalizada: agendas, cuadernos, libretas y más."
        url="/productos"
      />
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-32 px-6">
        <h1 className="text-3xl font-semibold text-center mb-10">{formattedTitle}</h1>

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

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import StarRating from './StarRating'; // Importar StarRating

export interface Product {
  _id: string;
  nombre: string;
  precio: number;
  categoria: string;
  slug: string;
  imagen: string;
  alt?: string; // Añadido para el texto alternativo
  averageRating?: number;
  numReviews?: number;
  soloDestacado?: boolean; // Nuevo: para indicar si es un producto solo destacado
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const productUrl = `/productos/detail/${product._id}`;

  return (
    <div className="flex flex-col h-full rounded-2xl border border-transparent overflow-hidden shadow-md transition-shadow hover:shadow-lg hover:shadow-pink-500/50 hover:border-2 hover:border-pink-500/50">
      {/* Imagen como enlace */}
      <Link href={productUrl} className="block relative w-full aspect-square">
        <Image
          src={product.imagen}
          alt={product.alt || product.nombre}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transform transition-transform duration-500 hover:scale-105"
        />
      </Link>

      {/* Contenido */}
      <div className="flex flex-col flex-grow p-4">
        <Link href={productUrl}>
          <h2 className="text-lg font-bold text-gray-800 line-clamp-2 hover:text-pink-600">
            {product.nombre}
          </h2>
        </Link>
        
        {/* Rating de Estrellas */}
        {product.numReviews && product.numReviews > 0 && product.averageRating ? (
          <div className="flex items-center my-0"> {/* Reducido de my-1 a my-0 */}
            <StarRating rating={product.averageRating} />
            <span className="text-xs text-gray-500 ml-2">
              ({product.numReviews})
            </span>
          </div>
        ) : (
          <div className="my-0 h-6">{/* Placeholder to keep height consistent y reducido de my-1 a my-0 */ }</div>
        )}

        <p className="text-xl font-semibold text-pink-500 mb-0 mt-auto">
          {product.soloDestacado ? 'Desde ' : ''}$U {product.precio}
        </p>
      </div>

      {/* Botón como enlace */}
      <Link href={productUrl} className="block w-full text-center bg-pink-500 text-white py-3 font-medium shadow-md hover:border-2 hover:border-pink-400 hover:shadow-lg transition rounded-b-2xl mt-auto">
        Ver detalles
      </Link>
    </div>
  );
};

export default ProductCard;

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import StarRating from './StarRating'; // Importar StarRating

export interface Product {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  slug: string;
  imagen: string;
  averageRating?: number;
  numReviews?: number;
  isBasePrice?: boolean; // Nuevo: para indicar si es un precio base
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="flex flex-col h-full rounded-2xl border border-transparent overflow-hidden shadow-md transition-shadow hover:shadow-lg hover:shadow-pink-500/50 hover:border-2 hover:border-pink-500/50">
      <Link
        href={{
          pathname: '/productos/[categoria]/[slug]',
          query: { categoria: product.categoria, slug: product.slug },
        }}
        className="flex flex-col h-full"
      >
        {/* Imagen */}
        <div className="relative w-full aspect-square">
          <Image
            src={product.imagen}
            alt={product.nombre}
            fill
            className="object-cover transform transition-transform duration-500 hover:scale-105"
          />
        </div>

        {/* Contenido */}
        <div className="flex flex-col flex-grow p-4">
          <h2 className="text-lg font-bold text-gray-800 mb-1 line-clamp-2">
            {product.nombre}
          </h2>
          
          {/* Rating de Estrellas */}
          {product.numReviews && product.numReviews > 0 && product.averageRating ? (
            <div className="flex items-center my-2">
              <StarRating rating={product.averageRating} />
              <span className="text-xs text-gray-500 ml-2">
                ({product.numReviews})
              </span>
            </div>
          ) : (
            <div className="my-2 h-6">{/* Placeholder to keep height consistent */ }</div>
          )}

          <p className="text-xl font-semibold text-pink-500 mb-0">
            {product.isBasePrice ? 'Desde ' : ''}$U {product.precio}
          </p>
        </div>

        {/* Botón pegado al borde inferior y laterales */}
        <span className="block w-full text-center bg-pink-500 text-white py-3 font-medium shadow-md hover:border-2 hover:border-pink-400 hover:shadow-lg transition rounded-b-2xl">
          Ver detalles
        </span>
      </Link>
    </div>
  );
};

export default ProductCard;

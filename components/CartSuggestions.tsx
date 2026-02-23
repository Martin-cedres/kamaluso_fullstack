import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

interface ProductSuggestion {
    _id: string;
    nombre: string;
    basePrice: number;
    precio?: number;
    imageUrl: string;
    slug: string;
}

const CartSuggestions = () => {
    const { cartItems, addToCart } = useCart();
    const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (cartItems.length === 0) {
                setSuggestions([]);
                return;
            }

            // Encontrar el precio más alto en el carrito para sugerir algo de igual o menor valor
            const maxPriceInCart = Math.max(...cartItems.map(item => item.precio));

            // Evitar ids que ya están en el carrito
            const excludedIds = cartItems.map(item => item._id);

            setLoading(true);
            try {
                // Pedimos productos con precio <= maxPriceInCart
                // Limitamos a 4 sugerencias
                const res = await fetch(`/api/products/listar?limit=6&maxPrice=${maxPriceInCart}`);
                if (res.ok) {
                    const data = await res.json();
                    let products = data.products as ProductSuggestion[];

                    // Filtrar cliente-side los que ya están en el carrito
                    products = products.filter(p => !excludedIds.includes(p._id));

                    setSuggestions(products.slice(0, 4));
                }
            } catch (error) {
                console.error("Error fetching suggestions:", error);
            } finally {
                setLoading(false);
            }
        };

        // Solo llamamos una vez al montar el componente (cuando se abre el carrito)
        fetchSuggestions();

    }, []); // Dependencia vacía para estabilidad visual

    if (cartItems.length === 0) return null;

    if (loading) {
        return (
            <div className="mt-4 pt-4 border-t border-gray-100 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-3"></div>
                <div className="flex gap-3 overflow-hidden">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="min-w-[140px] h-32 bg-gray-50 rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (suggestions.length === 0) return null;

    return (
        <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-bold text-gray-700 mb-3">
                🔥 Completá tu pedido con 10% OFF
            </h4>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {suggestions.map((p) => {
                    const price = p.basePrice || p.precio || 0;
                    return (
                        <div key={p._id} className="min-w-[140px] w-[140px] bg-white border border-gray-200 rounded-lg p-2 flex flex-col relative group hover:border-pink-300 transition-all">
                            <Link href={`/productos/detail/${p.slug}`} className="relative h-24 w-full mb-2 bg-gray-50 rounded-md overflow-hidden block">
                                <Image
                                    src={p.imageUrl || '/placeholder.png'}
                                    alt={p.nombre}
                                    fill
                                    className="object-cover"
                                    sizes="140px"
                                />
                            </Link>
                            <Link href={`/productos/detail/${p.slug}`}>
                                <h5 className="text-xs font-medium text-gray-800 line-clamp-2 min-h-[2.5em] mb-1 group-hover:text-pink-600 transition-colors">
                                    {p.nombre}
                                </h5>
                            </Link>
                            <div className="mt-auto flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-900">${price}</span>
                                <button
                                    onClick={() => addToCart({
                                        _id: p._id,
                                        nombre: p.nombre,
                                        precio: price,
                                        imageUrl: p.imageUrl,
                                    })}
                                    className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center hover:bg-pink-500 hover:text-white transition-colors"
                                    title="Agregar al carrito"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default CartSuggestions;

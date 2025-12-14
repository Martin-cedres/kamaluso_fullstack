import React, { useRef } from 'react';
import ProductCard from './ProductCard';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

interface Product {
    _id: string;
    nombre: string;
    imageUrl?: string;
    alt?: string;
    categoria?: string;
    slug?: string;
    basePrice?: number;
    precio?: number;
    averageRating?: number;
    numReviews?: number;
    descripcionBreve?: string;
    descripcionExtensa?: string;
    puntosClave?: string[];
}

interface ProductCarouselProps {
    products: Product[];
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ products }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    if (!products || products.length === 0) return null;

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollAmount = container.clientWidth * 0.75; // Scroll 75% of view width
            const targetScroll = direction === 'left'
                ? container.scrollLeft - scrollAmount
                : container.scrollLeft + scrollAmount;

            container.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="relative group px-4 sm:px-8">
            {/* Navigation Buttons */}
            <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 p-3 rounded-full shadow-lg text-rosa opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hidden md:block focus:outline-none focus:ring-2 focus:ring-rosa/50"
                aria-label="Anterior"
            >
                <ChevronLeftIcon className="w-6 h-6" />
            </button>

            <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 p-3 rounded-full shadow-lg text-rosa opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hidden md:block focus:outline-none focus:ring-2 focus:ring-rosa/50"
                aria-label="Siguiente"
            >
                <ChevronRightIcon className="w-6 h-6" />
            </button>

            {/* Scroll Container */}
            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto gap-6 pb-12 snap-x snap-mandatory scroll-smooth hide-scrollbar"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    // Force flex row layout to guarantee side-by-side
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'nowrap'
                }}
            >
                {products.map((product) => (
                    <div
                        key={product._id}
                        className="snap-start flex-shrink-0 w-[85%] sm:w-[45%] md:w-[30%] lg:w-[23%] xl:w-[23%]"
                    >
                        <div className="h-full py-2">
                            <ProductCard product={{
                                _id: product._id,
                                nombre: product.nombre,
                                precio: product.basePrice || product.precio || 0,
                                imagen: product.imageUrl || '/placeholder.png',
                                alt: product.alt,
                                slug: product.slug || '',
                                categoria: product.categoria || '',
                                averageRating: product.averageRating,
                                numReviews: product.numReviews,
                                descripcionBreve: product.descripcionBreve,
                                descripcionExtensa: product.descripcionExtensa,
                                puntosClave: product.puntosClave,
                            }} />
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default ProductCarousel;

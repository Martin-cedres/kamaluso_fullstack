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
    videoUrl?: string;
    videoPreviewUrl?: string;
}

interface ProductCarouselProps {
    products: Product[];
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ products }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [scrollProgress, setScrollProgress] = React.useState(0);

    if (!products || products.length === 0) return null;

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            const scrollableWidth = scrollWidth - clientWidth;
            if (scrollableWidth > 0) {
                const progress = (scrollLeft / scrollableWidth) * 100;
                setScrollProgress(progress);
            }
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollAmount = container.clientWidth * 0.75;
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
        <div className="relative group/carousel px-2 sm:px-8">
            {/* Navigation Buttons - Semi-visible for intuitiveness */}
            <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 p-3 rounded-full shadow-sm text-slate-400 opacity-20 md:opacity-40 group-hover/carousel:opacity-100 transition-all duration-500 hover:scale-110 hidden md:block border border-slate-100"
                aria-label="Anterior"
            >
                <ChevronLeftIcon className="w-5 h-5" />
            </button>

            <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 p-3 rounded-full shadow-sm text-slate-400 opacity-20 md:opacity-40 group-hover/carousel:opacity-100 transition-all duration-500 hover:scale-110 hidden md:block border border-slate-100"
                aria-label="Siguiente"
            >
                <ChevronRightIcon className="w-5 h-5" />
            </button>

            {/* Scroll Container */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 snap-x snap-mandatory scroll-smooth hide-scrollbar"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'nowrap'
                }}
            >
                {products.map((product) => (
                    <div
                        key={product._id}
                        className="snap-start flex-shrink-0 w-[82%] sm:w-[45%] md:w-[30%] lg:w-[23%]"
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
                                videoUrl: product.videoUrl,
                                videoPreviewUrl: product.videoPreviewUrl,
                            }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Mobile/Small Screen Progress Bar Indicator */}
            <div className="md:hidden mt-2 px-6">
                <div className="h-[2px] w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-rosa transition-all duration-300 ease-out rounded-full"
                        style={{ width: `${Math.max(15, scrollProgress)}%`, marginLeft: `${(scrollProgress * (100 - Math.max(15, scrollProgress))) / 100}%` }}
                    />
                </div>
                <div className="mt-2 flex justify-center">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                       Desliza para ver más <span className="animate-pulse">→</span>
                   </span>
                </div>
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

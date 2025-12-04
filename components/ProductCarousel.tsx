import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import ProductCard from './ProductCard';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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
    if (!products || products.length === 0) return null;

    return (
        <div className="product-carousel-container relative px-4 sm:px-8">
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={24}
                slidesPerView={1.2} // Mobile default: show part of next slide
                centeredSlides={false}
                navigation
                pagination={{ clickable: true, dynamicBullets: true }}
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true
                }}
                breakpoints={{
                    // Mobile landscape / Small tablets
                    640: {
                        slidesPerView: 2.2,
                        spaceBetween: 20,
                    },
                    // Tablets
                    768: {
                        slidesPerView: 3,
                        spaceBetween: 24,
                    },
                    // Desktop
                    1024: {
                        slidesPerView: 4,
                        spaceBetween: 30,
                    },
                }}
                className="pb-12" // Add padding for pagination
            >
                {products.map((product) => (
                    <SwiperSlide key={product._id} className="h-auto">
                        <div className="h-full py-2"> {/* Padding for hover effects */}
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
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Custom styles for navigation buttons if needed */}
            <style jsx global>{`
                .swiper-button-next,
                .swiper-button-prev {
                    color: #ec4899; /* pink-500 */
                    background: rgba(255, 255, 255, 0.8);
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                }
                .swiper-button-next:hover,
                .swiper-button-prev:hover {
                    background: white;
                    transform: scale(1.1);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }
                .swiper-button-next::after,
                .swiper-button-prev::after {
                    font-size: 18px;
                    font-weight: bold;
                }
                .swiper-pagination-bullet-active {
                    background: #ec4899;
                }
            `}</style>
        </div>
    );
};

export default ProductCarousel;

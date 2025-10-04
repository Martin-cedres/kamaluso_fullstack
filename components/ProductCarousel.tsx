import { useState } from 'react';
import Image from 'next/image';

interface ProductCarouselProps {
  images: string[];
  alt: string;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ images, alt }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square w-full bg-gray-100 rounded-2xl flex items-center justify-center">
        <p className="text-gray-500">No hay imágenes</p>
      </div>
    );
  }

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-lg">
        <Image
          key={activeIndex} // Force re-render on change
          src={images[activeIndex]}
          alt={alt}
          fill
          className="object-cover transition-opacity duration-300 ease-in-out"
          priority={true} // Prioritize loading of the main image
        />
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-5 gap-2">
        {images.map((src, index) => (
          <button
            key={index}
            onClick={() => handleThumbnailClick(index)}
            className={`relative aspect-square w-full rounded-lg overflow-hidden border-2 transition-all ${activeIndex === index ? 'border-pink-500 ring-2 ring-pink-300' : 'border-transparent hover:border-pink-400'}`}>
            <Image
              src={src}
              alt={`Thumbnail ${index + 1}`}
              fill
              className="object-cover"
            />
            {activeIndex === index && <div className="absolute inset-0 bg-white opacity-40"></div>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductCarousel;
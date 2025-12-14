'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import OptimizedImage from './OptimizedImage';
import StarRating from './StarRating';

import { IReview } from '../models/Review';

interface ReviewCardProps {
  review: IReview;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const [imageStyle, setImageStyle] = useState<React.CSSProperties>({ objectFit: 'cover' });

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (naturalHeight > naturalWidth) {
      setImageStyle({ objectFit: 'contain' });
    }
  };



  return (
    <div className="h-full flex flex-col justify-between p-6 bg-white rounded-2xl shadow-md border border-gray-200 hover:shadow-xl hover:-translate-y-2 hover:border-pink-200 transition-all duration-300 group">
      <div>
        {review.imageUrl && (
          <div className="mb-4 w-full h-48 relative rounded-lg overflow-hidden bg-gray-100 group-hover:scale-105 transition-transform duration-300">
            <OptimizedImage
              src={review.imageUrl}
              alt={`Imagen de reseña de ${review.user.name}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={imageStyle}
              className="rounded-lg"
              onLoad={handleImageLoad}
            />
          </div>
        )}
        <div className="flex items-center mb-4">
          <StarRating rating={review.rating} />
        </div>
        <p className="text-gray-600 italic mb-4 line-clamp-3">&ldquo;{review.comment}&rdquo;</p>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-100">
        <p className="font-semibold text-gray-800 mb-1">{review.user.name}</p>

        {/* Enhanced Product Link with Thumbnail */}
        <Link
          href={`/productos/detail/${review.product.slug}`}
          className="flex items-center gap-3 p-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors group/link"
        >
          {review.product.imageUrl && (
            <div className="relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden border border-pink-200">
              <Image
                src={review.product.imageUrl}
                alt={review.product.nombre}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-0.5">Opinión sobre:</p>
            <p className="text-sm font-medium text-blue-600 group-hover/link:underline truncate">
              {review.product.nombre} →
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ReviewCard;
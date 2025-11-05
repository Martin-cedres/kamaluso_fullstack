'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    <div className="h-full min-h-[460px] flex flex-col justify-between p-6 bg-white rounded-2xl shadow-md border border-gray-200">
      <div>
        {review.imageUrl && ( // Conditionally render image
          <div className="mb-4 w-full h-48 relative rounded-lg overflow-hidden bg-gray-100">
            <Image
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
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="font-semibold text-gray-800">{review.user.name}</p>
        <Link href={`/productos/detail/${review.product.slug}`} className="text-sm text-pink-500 hover:text-pink-500 hover:underline truncate block">
          Opinión sobre: {review.product.nombre}
        </Link>
      </div>
    </div>
  );
};

export default ReviewCard;
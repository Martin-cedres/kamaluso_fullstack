import React from 'react';
import { IReview } from '../models/Review';
import StarRating from './StarRating';
import Image from 'next/image';

interface ReviewListProps {
  reviews: IReview[];
}

const ReviewList = ({ reviews }: ReviewListProps) => {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-lg font-semibold">¡Sé el primero en dejar tu opinión sobre este producto!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {reviews.map((review) => (
        <div key={review._id} className="flex space-x-4 p-4 border-b border-gray-200">
          <div className="flex-shrink-0">
            <Image
              src={review.user.image || '/default-avatar.png'} // TODO: Add a default avatar image to the public folder
              alt={review.user.name}
              width={48}
              height={48}
              className="rounded-full"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-800">{review.user.name}</h4>
              <span className="text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString('es-UY', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="my-1">
              <StarRating rating={review.rating} />
            </div>
            <p className="text-gray-600 whitespace-pre-wrap">{review.comment}</p>
            {review.imageUrl && (
              <div className="mt-4">
                <Image
                  src={review.imageUrl}
                  alt={`Imagen de la reseña de ${review.user.name}`}
                  width={200} // Un tamaño razonable para la vista de lista
                  height={200}
                  className="rounded-lg object-cover"
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;

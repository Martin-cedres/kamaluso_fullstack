import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import StarRating from './StarRating';

interface IReview {
  _id: string;
  user: { name: string };
  product: { _id: string; nombre: string; imageUrl?: string };
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewCardProps {
  review: IReview;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <div className="h-full flex flex-col justify-between p-6 bg-white rounded-2xl shadow-md border border-gray-200">
      <div>
        <div className="flex items-center mb-4">
          <StarRating rating={review.rating} />
        </div>
        <p className="text-gray-600 italic mb-4">&ldquo;{review.comment}&rdquo;</p>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="font-semibold text-gray-800">{review.user.name}</p>
        <Link href={`/productos/detail/${review.product._id}`} className="text-sm text-pink-500 hover:underline">
          Opinión sobre: {review.product.nombre}
        </Link>
      </div>
    </div>
  );
};

export default ReviewCard;

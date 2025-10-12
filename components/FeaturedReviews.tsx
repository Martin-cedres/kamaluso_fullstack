import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import ReviewCard from './ReviewCard';
import Head from 'next/head';

interface IReview {
  _id: string;
  user: { name: string };
  product: { _id: string; nombre: string; imageUrl?: string };
  rating: number;
  comment: string;
  createdAt: string;
}

interface FeaturedReviewsProps {
  reviews: IReview[];
}

const FeaturedReviews: React.FC<FeaturedReviewsProps> = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  const siteUrl = 'https://www.papeleriapersonalizada.uy';

  const reviewSchema = reviews.map(review => ({
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Product',
      name: review.product.nombre,
      image: review.product.imageUrl ? `${siteUrl}${review.product.imageUrl}` : `${siteUrl}/logo.webp`,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating.toString(),
      bestRating: '5',
      worstRating: '1',
    },
    author: {
      '@type': 'Person',
      name: review.user.name,
    },
    reviewBody: review.comment,
    datePublished: new Date(review.createdAt).toISOString(),
  }));

  return (
    <section className="px-6 py-12 bg-gray-50">
        <Head>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
                key="reviews-jsonld"
            />
        </Head>
      <h2 className="text-3xl font-semibold text-center mb-10">
        Lo que dicen nuestros clientes
      </h2>
      <div className="max-w-6xl mx-auto">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={reviews.length >= 3}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 30,
            },
          }}
          className="pb-12"
        >
          {reviews.map((review) => (
            <SwiperSlide key={review._id}>
              <ReviewCard review={review} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default FeaturedReviews;

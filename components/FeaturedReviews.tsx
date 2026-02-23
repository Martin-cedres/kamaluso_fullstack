import React, { useRef } from 'react';
import ReviewCard from './ReviewCard';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { IReview } from '../models/Review';
import Head from 'next/head';

interface FeaturedReviewsProps {
  reviews: IReview[];
}

const FeaturedReviews: React.FC<FeaturedReviewsProps> = ({ reviews }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!reviews || reviews.length === 0) {
    return null;
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.75;
      const targetScroll =
        direction === 'left'
          ? container.scrollLeft - scrollAmount
          : container.scrollLeft + scrollAmount;

      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      });
    }
  };

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
    <section id="reviews" className="px-6 py-12 bg-white scroll-mt-20">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
          key="reviews-jsonld"
        />
      </Head>
      <div className="text-center mb-16">
        <p className="text-sm font-semibold text-rosa uppercase tracking-widest mb-3">Testimonios</p>
        <h2 className="text-4xl md:text-6xl font-bold font-heading text-slate-900 tracking-tighter">
          Lo que dicen nuestros clientes
        </h2>
      </div>

      <div className="relative group max-w-7xl mx-auto px-4 sm:px-8">
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
          }}
        >
          {reviews.map((review) => (
            <div
              key={review._id}
              className="snap-start flex-shrink-0 w-[85%] sm:w-[45%] md:w-[40%] lg:w-[31%] xl:w-[31%]" // Adjusted widths for review cards
            >
              <div className="h-full py-2">
                <ReviewCard review={review} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default FeaturedReviews;

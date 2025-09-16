import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Image from 'next/image';
import { StarIcon } from '@heroicons/react/20/solid';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import type { IReview } from '../models/Review';

interface ProductReviewSectionProps {
  productId: string;
  initialReviews: IReview[];
  totalReviews: number;
}

const ProductReviewSection: React.FC<ProductReviewSectionProps> = ({ productId, initialReviews, totalReviews }) => {
  const { data: session } = useSession();

  const [reviews, setReviews] = useState<IReview[]>(initialReviews);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lightbox, setLightbox] = useState({ open: false, index: 0, slides: [] as { src: string }[] });

  // Form state
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewImages, setNewReviewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmittedMessage, setReviewSubmittedMessage] = useState('');

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const res = await fetch(`/api/reviews/product/${productId}?page=${nextPage}`);
      if (res.ok) {
        const newReviews: IReview[] = await res.json();
        setReviews((prev) => [...prev, ...newReviews]);
        setPage(nextPage);
      } else {
        console.error('Failed to fetch more reviews');
      }
    } catch (error) {
      console.error('Error fetching more reviews:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const openLightbox = (images: string[], index: number) => {
    setLightbox({ open: true, index, slides: images.map(url => ({ src: url })) });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (newReviewImages.length + filesArray.length > 3) {
        alert('Puedes subir un máximo de 3 imágenes.');
        return;
      }
      setNewReviewImages((prev) => [...prev, ...filesArray]);
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setNewReviewImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!session) { signIn('google'); return; }
    if (newReviewRating === 0 || !newReviewComment.trim()) {
      alert('Por favor, completa la calificación y el comentario.');
      return;
    }
    setSubmittingReview(true);
    setReviewSubmittedMessage('');
    try {
      let uploadedImageUrls: string[] = [];
      if (newReviewImages.length > 0) {
        const formData = new FormData();
        newReviewImages.forEach((file) => formData.append('images', file));
        const uploadRes = await fetch('/api/reviews/upload-image', { method: 'POST', body: formData });
        if (!uploadRes.ok) throw new Error('Failed to upload images');
        const uploadData = await uploadRes.json();
        uploadedImageUrls = uploadData.urls;
      }
      const reviewRes = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating: newReviewRating, comment: newReviewComment, imageUrls: uploadedImageUrls }),
      });
      if (!reviewRes.ok) throw new Error('Failed to submit review');
      setReviewSubmittedMessage('Tu reseña ha sido recibida. Estará visible una vez que sea aprobada.');
      setNewReviewRating(0);
      setNewReviewComment('');
      setNewReviewImages([]);
      setImagePreviews([]);
    } catch (error) {
      console.error('Error submitting review:', error);
      setReviewSubmittedMessage('Error al enviar tu reseña. Por favor, inténtalo de nuevo.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating: number, setRating?: (r: number) => void) => (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <StarIcon key={i} className={`h-5 w-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'} ${setRating ? 'cursor-pointer' : ''}`} onClick={() => setRating && setRating(i + 1)} />
      ))}
    </div>
  );

  return (
    <section className="mt-12 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Reseñas de Clientes ({totalReviews})</h2>

      {reviews.length === 0 ? (
        <p className="text-gray-600 py-4">Sé el primero en dejar una reseña para este producto.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {reviews.map((review) => (
            <div key={review._id.toString()} className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              {/* Card Header */}
              <div className="flex items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-lg mr-4 flex-shrink-0">
                  {review.userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{review.userName}</p>
                  {renderStars(review.rating)}
                </div>
                <p className="text-sm text-gray-500 whitespace-nowrap">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>

              {/* Card Body */}
              <p className="text-gray-700 whitespace-pre-wrap mb-4">{review.comment}</p>

              {/* Card Images */}
              {review.imageUrls && review.imageUrls.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {review.imageUrls.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      className="relative w-20 h-20 rounded-md overflow-hidden hover:opacity-80 transition-opacity duration-200"
                      onClick={() => openLightbox(review.imageUrls!, i)}
                    >
                      <Image src={url} alt={`Imagen de reseña ${i + 1}`} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 10vw, 5vw" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {reviews.length < totalReviews && (
        <div className="text-center mt-8">
          <button onClick={handleLoadMore} disabled={loadingMore} className="bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
            {loadingMore ? 'Cargando...' : 'Cargar más reseñas'}
          </button>
        </div>
      )}

      <Lightbox open={lightbox.open} close={() => setLightbox(prev => ({ ...prev, open: false }))} index={lightbox.index} slides={lightbox.slides} />

      {/* Review Form */}
      <div className="mt-10 pt-8 border-t">
        <h3 className="text-xl font-bold mb-4">Deja tu reseña</h3>
        {!session ? (
          <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-gray-50">
            <p className="text-gray-700 mb-4">Inicia sesión para dejar una reseña.</p>
            <button onClick={() => signIn('google')} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center">
              Iniciar sesión con Google
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {reviewSubmittedMessage && (
              <div className={`p-3 rounded-md ${reviewSubmittedMessage.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {reviewSubmittedMessage}
              </div>
            )}
            <p className="text-gray-700">Estás dejando una reseña como <span className="font-semibold">{session.user?.name || session.user?.email}</span></p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tu calificación</label>
              {renderStars(newReviewRating, setNewReviewRating)}
            </div>
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">Tu comentario</label>
              <textarea id="comment" rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" value={newReviewComment} onChange={(e) => setNewReviewComment(e.target.value)} required></textarea>
            </div>
            <div>
              <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">Añadir fotos (máx. 3)</label>
              <input type="file" id="images" accept="image/*" multiple onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100" />
              {imagePreviews.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative w-24 h-24 rounded-md overflow-hidden border border-gray-200">
                      <Image src={preview} alt={`Preview ${index + 1}`} fill style={{ objectFit: 'cover' }} />
                      <button type="button" onClick={() => removeImage(index)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">X</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" disabled={submittingReview} className="bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {submittingReview ? 'Enviando...' : 'Enviar reseña'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default ProductReviewSection;

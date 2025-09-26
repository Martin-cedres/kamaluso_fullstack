import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import StarRatingInput from './StarRatingInput';
import toast from 'react-hot-toast';
import Link from 'next/link'; // Import Link

interface ReviewFormProps {
  productId: string;
  onReviewSubmit: () => void; // A callback to refetch reviews
}

const ReviewForm = ({ productId, onReviewSubmit }: ReviewFormProps) => {
  const { data: session, status } = useSession();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || comment.trim() === '') {
      toast.error('Por favor, selecciona una valoración y escribe un comentario.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/reviews/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, comment }),
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(data.message || '¡Gracias por tu comentario!');
        setRating(0);
        setComment('');
        onReviewSubmit(); // Trigger refetch
      } else {
        const data = await res.json();
        toast.error(data.error || 'No se pudo enviar el comentario.');
      }
    } catch (error) {
      toast.error('Ocurrió un error al enviar tu comentario.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return null; // Don't show anything while session is loading
  }

  if (status === 'unauthenticated') {
    return (
      <div className="text-center py-6 bg-gray-100 rounded-lg">
        <p className="text-gray-600">
          Para dejar un comentario, por favor{' '}
          <Link href="/api/auth/signin/google" className="text-pink-500 font-semibold hover:underline">
            inicia sesión
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-2xl shadow-md space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">Escribe tu opinión</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tu valoración</label>
        <StarRatingInput rating={rating} setRating={setRating} />
      </div>
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
          Tu comentario
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
          placeholder="¿Qué te ha parecido el producto?"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-pink-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:bg-pink-600 transition disabled:bg-gray-400"
      >
        {loading ? 'Enviando...' : 'Enviar comentario'}
      </button>
    </form>
  );
};

export default ReviewForm;

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import StarRatingInput from './StarRatingInput';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image'; // Importar Image para el preview

interface ReviewFormProps {
  productId: string;
  onReviewSubmit: () => void; // A callback to refetch reviews
}

const ReviewForm = ({ productId, onReviewSubmit }: ReviewFormProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || comment.trim() === '') {
      toast.error('Por favor, selecciona una valoración y escribe un comentario.');
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append('productId', productId);
    formData.append('rating', String(rating));
    formData.append('comment', comment);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const res = await fetch('/api/reviews/crear', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(data.message || '¡Gracias por tu comentario!');
        setRating(0);
        setComment('');
        setImageFile(null);
        setPreview(null);
        onReviewSubmit(); // Trigger refetch
      } else {
        const data = await res.json();
        // Mostrar error detallado si está disponible
        const errorMessage = data.debug || data.error || 'No se pudo enviar el comentario.';
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error('Ocurrió un error al enviar tu comentario.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return null;
  }

  if (status === 'unauthenticated') {
    const signInUrl = `/api/auth/signin/google?callbackUrl=${encodeURIComponent(router.asPath)}`;
    return (
      <div className="text-center py-6 bg-gray-100 rounded-lg">
        <p className="text-gray-600">
          Para dejar un comentario, por favor{' '}
          <Link href={signInUrl} className="text-pink-500 font-semibold hover:underline">
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

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
          Añadir una foto (opcional)
        </label>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
        />
        {preview && (
          <div className="mt-4">
            <Image src={preview} alt="Vista previa de la imagen" width={100} height={100} className="rounded-lg object-cover" />
          </div>
        )}
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

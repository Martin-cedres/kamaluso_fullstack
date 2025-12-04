
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import AdminLayout from '../../../components/AdminLayout';
import StarRating from '../../../components/StarRating';
import toast from 'react-hot-toast';

// Enhanced type for frontend with product details and imageUrl
type TReview = {
  _id: string;
  product: {
    _id: string;
    nombre: string;
    slug?: string;
  };
  user: {
    id: string;
    name: string;
    image?: string;
  };
  rating: number;
  comment: string;
  imageUrl?: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
};

const AdminReviewsPage = () => {

  const [reviews, setReviews] = useState<TReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingImage, setCheckingImage] = useState<string | null>(null);
  const [uploadingReviewId, setUploadingReviewId] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const triggerUpload = (reviewId: string) => {
    setUploadingReviewId(reviewId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingReviewId) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('reviewId', uploadingReviewId);

    const toastId = toast.loading('Subiendo y procesando imagen...');

    try {
      const res = await fetch('/api/admin/reviews/reupload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Imagen actualizada correctamente', { id: toastId });
        // Update local state
        setReviews(reviews.map(r => r._id === uploadingReviewId ? { ...r, imageUrl: data.imageUrl } : r));
      } else {
        toast.error(data.error || 'Error al subir imagen', { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error('Error de conexión', { id: toastId });
    } finally {
      setUploadingReviewId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/admin/reviews');
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      } else {
        toast.error('No se pudieron cargar las reseñas.');
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApproval = async (reviewId: string, isApproved: boolean) => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, isApproved }),
      });

      if (res.ok) {
        toast.success(`Reseña ${isApproved ? 'aprobada' : 'desaprobada'}.`);
        setReviews(reviews.map(r => r._id === reviewId ? { ...r, isApproved } : r));
      } else {
        toast.error('No se pudo actualizar la reseña.');
      }
    } catch (error) {
      toast.error('Error al actualizar la reseña.');
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta reseña? Esta acción es irreversible.')) {
      try {
        const res = await fetch('/api/admin/reviews', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reviewId }),
        });

        if (res.ok) {
          toast.success('Reseña eliminada.');
          setReviews(reviews.filter(r => r._id !== reviewId));
        } else {
          toast.error('No se pudo eliminar la reseña.');
        }
      } catch (error) {
        toast.error('Error al eliminar la reseña.');
      }
    }
  };

  const handleCheckImage = async (imageUrl: string, reviewId: string) => {
    setCheckingImage(reviewId);
    try {
      const res = await fetch('/api/admin/reviews/check-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.retriggered) {
          const method = data.method === 'download-and-reupload'
            ? '📥 Imagen re-subida automáticamente.'
            : '📋 Base WebP copiada.';
          toast.success(`✅ Lambda re-activada. ${method}\nLas variantes se generarán en 2-16 segundos.\nFaltaban: ${data.missingVariants.map((v: any) => v.size + 'w').join(', ')}`);
        } else if (data.missingVariants.length === 0) {
          toast.success('✅ Todas las variantes WebP existen (480w, 800w, 1200w, 1920w)');
        } else {
          toast.error(`❌ Error: Faltan variantes pero no se pudo re-activar Lambda.\nFaltan: ${data.missingVariants.map((v: any) => v.size + 'w').join(', ')}`);
        }
        console.log('Image check result:', data);
      } else {
        toast.error(data.error || 'Error al verificar la imagen');
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor.');
      console.error(error);
    } finally {
      setCheckingImage(null);
    }
  };

  if (loading) {
    return <AdminLayout><div className="p-6">Cargando reseñas...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Gestionar Reseñas</h1>
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valoración</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comentario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reviews.map(review => (
              <tr key={review._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {review.imageUrl ? (
                    <div className="flex flex-col gap-2">
                      <div
                        className="relative w-20 h-20 rounded overflow-hidden border border-gray-200"
                        onMouseEnter={() => console.log('Image URL:', review.imageUrl)}
                      >
                        <Image
                          src={review.imageUrl}
                          alt={`Review by ${review.user.name}`}
                          fill
                          sizes="80px"
                          className="object-cover"
                          unoptimized
                          onError={(e) => {
                            console.error('Image failed to load:', review.imageUrl);
                            e.currentTarget.style.border = '2px solid red';
                          }}
                        />
                      </div>
                      <button
                        onClick={() => handleCheckImage(review.imageUrl!, review._id)}
                        disabled={checkingImage === review._id}
                        className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 disabled:opacity-50"
                        title="Verificar si existen todas las variantes WebP (480w, 800w, 1200w, 1920w) y re-generar si faltan"
                      >
                        {checkingImage === review._id ? '...' : '🔍 Check'}
                      </button>
                      <a
                        href={review.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-500 hover:text-blue-600 truncate max-w-[80px]"
                        title={review.imageUrl}
                      >
                        Ver URL
                      </a>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-gray-400">Sin imagen</span>
                      <button
                        onClick={() => triggerUpload(review._id)}
                        className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100"
                      >
                        📤 Subir
                      </button>
                    </div>
                  )}
                  {review.imageUrl && (
                    <button
                      onClick={() => triggerUpload(review._id)}
                      className="mt-2 text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 w-full"
                    >
                      🔄 Re-subir
                    </button>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{review.user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-col">
                    <span className="font-medium">{review.product.nombre}</span>
                    {review.product.slug && (
                      <span className="text-xs text-gray-400">{review.product.slug}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap"><StarRating rating={review.rating} /></td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{review.comment}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${review.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {review.isApproved ? 'Aprobado' : 'Pendiente'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex flex-col gap-2">
                    {!review.isApproved ? (
                      <button onClick={() => handleApproval(review._id, true)} className="text-indigo-600 hover:text-indigo-900">Aprobar</button>
                    ) : (
                      <button onClick={() => handleApproval(review._id, false)} className="text-yellow-600 hover:text-yellow-900">Desaprobar</button>
                    )}
                    <button onClick={() => handleDelete(review._id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
    </AdminLayout >
  );
};

export default AdminReviewsPage;

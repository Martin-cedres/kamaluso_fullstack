import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import Image from 'next/image';
import { StarIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';

interface Review {
  _id: string;
  productId: { _id: string; nombre: string; imageUrl: string };
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  imageUrls?: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const AdminReviewsPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin'); // Redirigir si no es admin
    }
  }, [session, status, router]);

  const fetchReviews = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const query = filterStatus === 'all' ? '' : `?status=${filterStatus}`;
      const res = await fetch(`/api/admin/reviews${query}`);
      if (!res.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const data = await res.json();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setMessage({ type: 'error', text: 'Error al cargar las reseñas.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchReviews();
    }
  }, [session, filterStatus]);

  const handleAction = async (reviewId: string, action: 'approve' | 'reject' | 'delete') => {
    setMessage(null);
    try {
      let res;
      if (action === 'delete') {
        res = await fetch(`/api/admin/reviews/${reviewId}`, {
          method: 'DELETE',
        });
      } else {
        res = await fetch(`/api/admin/reviews/${action}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reviewId }),
        });
      }

      if (!res.ok) {
        throw new Error(`Failed to ${action} review`);
      }
      setMessage({ type: 'success', text: `Reseña ${action === 'approve' ? 'aprobada' : action === 'reject' ? 'rechazada' : 'eliminada'} correctamente.` });
      fetchReviews(); // Refrescar la lista
    } catch (error) {
      console.error(`Error ${action} review:`, error);
      setMessage({ type: 'error', text: `Error al ${action === 'approve' ? 'aprobar' : action === 'reject' ? 'rechazar' : 'eliminar'} la reseña.` });
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={`h-5 w-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  if (status === 'loading' || !session || session.user?.role !== 'admin') {
    return (
      <AdminLayout>
        <p>Cargando o no autorizado...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Moderación de Reseñas</h1>

      {message && (
        <div className={`p-3 mb-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="mb-6 flex space-x-4">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-md ${filterStatus === 'all' ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-4 py-2 rounded-md ${filterStatus === 'pending' ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Pendientes
        </button>
        <button
          onClick={() => setFilterStatus('approved')}
          className={`px-4 py-2 rounded-md ${filterStatus === 'approved' ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Aprobadas
        </button>
        <button
          onClick={() => setFilterStatus('rejected')}
          className={`px-4 py-2 rounded-md ${filterStatus === 'rejected' ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Rechazadas
        </button>
      </div>

      {loading ? (
        <p>Cargando reseñas...</p>
      ) : reviews.length === 0 ? (
        <p>No hay reseñas para mostrar.</p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-lg">{review.userName} ({review.userEmail})</p>
                  <p className="text-sm text-gray-500">Producto: <Link href={`/productos/detail/${review.productId._id}`} className="text-blue-600 hover:underline">{review.productId.nombre}</Link></p>
                  <p className="text-sm text-gray-500">Enviada el: {new Date(review.createdAt).toLocaleDateString()}</p>
                  {renderStars(review.rating)}
                </div>
                <div className="flex space-x-2">
                  {review.status === 'pending' && (
                    <button
                      onClick={() => handleAction(review._id, 'approve')}
                      className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600"
                    >
                      Aprobar
                    </button>
                  )}
                  {review.status !== 'rejected' && (
                    <button
                      onClick={() => handleAction(review._id, 'reject')}
                      className="bg-yellow-500 text-white px-3 py-1 rounded-md text-sm hover:bg-yellow-600"
                    >
                      Rechazar
                    </button>
                  )}
                  <button
                    onClick={() => handleAction(review._id, 'delete')}
                    className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              <p className="text-gray-700 mb-3">{review.comment}</p>
              {review.imageUrls && review.imageUrls.length > 0 && (
                <div className="flex space-x-2 mt-2">
                  {review.imageUrls.map((url, i) => (
                    <Image key={i} src={url} alt={`Review image ${i + 1}`} width={100} height={100} className="rounded-md object-cover" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminReviewsPage;

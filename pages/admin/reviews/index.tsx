
import React, { useState, useEffect } from 'react';

import AdminLayout from '../../../components/AdminLayout';
import StarRating from '../../../components/StarRating';
import toast from 'react-hot-toast';

// Plain type for frontend, decoupled from Mongoose
type TReview = {
  _id: string;
  product: string; // Assuming product ID is a string
  user: {
    id: string;
    name: string;
    image?: string;
  };
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string; // Dates are strings after JSON serialization
  updatedAt: string;
};

const AdminReviewsPage = () => {

  const [reviews, setReviews] = useState<TReview[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <AdminLayout><div>Cargando reseñas...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Gestionar Reseñas</h1>
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valoración</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comentario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reviews.map(review => (
              <tr key={review._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{review.user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{review.product}</td>
                <td className="px-6 py-4 whitespace-nowrap"><StarRating rating={review.rating} /></td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{review.comment}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${review.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {review.isApproved ? 'Aprobado' : 'Pendiente'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                  {!review.isApproved ? (
                    <button onClick={() => handleApproval(review._id, true)} className="text-indigo-600 hover:text-indigo-900">Aprobar</button>
                  ) : (
                    <button onClick={() => handleApproval(review._id, false)} className="text-yellow-600 hover:text-yellow-900">Desaprobar</button>
                  )}
                  <button onClick={() => handleDelete(review._id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminReviewsPage;

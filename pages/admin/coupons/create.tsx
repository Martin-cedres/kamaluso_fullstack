import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import AdminLayout from '../../../components/AdminLayout';
import CouponForm from './form';

export default function AdminCouponCreate() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return <AdminLayout><p>Cargando...</p></AdminLayout>;
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (formData: any) => {
    try {
      const res = await fetch('/api/coupons/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al crear el cupón');
      }

      alert('Cupón creado con éxito!');
      router.push('/admin/coupons'); // Redirect to coupons list
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Crear Nuevo Cupón</h1>
      <CouponForm onSubmit={handleSubmit} />
    </AdminLayout>
  );
}

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

// Define a type for the order for better type safety
interface Order {
  _id: string;
  name: string;
  shippingMethod: 'delivery' | 'pickup';
  address: string;
  items: any[];
  total: number;
  paymentMethod: string;
  email?: string;
  createdAt: string;
  status: string;
}

const AdminPedidosPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { data: session, status } = useSession();
  const router = useRouter();

  const fetchOrders = async () => {
    const res = await fetch('/api/orders/listar');
    const data = await res.json();
    setOrders(data);
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    } else if (status === 'authenticated') {
      fetchOrders();
    }
  }, [status, router]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/orders/actualizar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (res.ok) {
        fetchOrders(); // Refresh the orders list
      } else {
        console.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center text-xl font-semibold">Cargando...</div>;
  }

  if (status === 'unauthenticated') {
    return null; // Or a login form
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold my-4">Administración de Pedidos</h1>
      <table className="min-w-full bg-white mt-4">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID del Pedido</th>
            <th className="py-2 px-4 border-b">Nombre</th>
            <th className="py-2 px-4 border-b">Total</th>
            <th className="py-2 px-4 border-b">Método de Pago</th>
            <th className="py-2 px-4 border-b">Estado</th>
            <th className="py-2 px-4 border-b">Fecha</th>
            <th className="py-2 px-4 border-b">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td className="py-2 px-4 border-b">{order._id}</td>
              <td className="py-2 px-4 border-b">{order.name}</td>
              <td className="py-2 px-4 border-b">${order.total}</td>
              <td className="py-2 px-4 border-b">{order.paymentMethod}</td>
              <td className="py-2 px-4 border-b">{order.status}</td>
              <td className="py-2 px-4 border-b">{new Date(order.createdAt).toLocaleString()}</td>
              <td className="py-2 px-4 border-b">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="enviado">Enviado</option>
                  <option value="entregado">Entregado</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPedidosPage;

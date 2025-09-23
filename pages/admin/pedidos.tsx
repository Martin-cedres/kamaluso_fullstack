import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import AdminLayout from '../../components/AdminLayout'
import { debounce } from 'lodash'

// Tipos más detallados
interface CartItem {
  _id: string
  nombre: string
  quantity: number
  precio: number
  finish?: string
}

interface Order {
  _id: string
  name: string
  email?: string
  phone?: string
  shippingDetails: {
    method: string
    address: string
    notes?: string
  }
  items: CartItem[]
  total: number
  paymentMethod: string
  createdAt: string
  status: string
  notes?: string // General order notes
}

// Componente para el Modal de Detalles del Pedido
const OrderDetailModal = ({
  order,
  onClose,
}: {
  order: Order
  onClose: () => void
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
    <div className="bg-white p-6 rounded-2xl shadow-xl max-w-2xl w-full max-h-full overflow-y-auto">
      <div className="flex justify-between items-start">
        <h2 className="text-2xl font-bold mb-4">Detalles del Pedido</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
          &times;
        </button>
      </div>
      <div className="space-y-2 text-sm">
        <p>
          <strong>ID:</strong> {order._id}
        </p>
        <p>
          <strong>Cliente:</strong> {order.name}
        </p>
        <p>
          <strong>Email:</strong> {order.email}
        </p>
        <p>
          <strong>Teléfono:</strong> {order.phone}
        </p>
        <p>
          <strong>Total:</strong> ${order.total.toFixed(2)}
        </p>
        <p>
          <strong>Método de Pago:</strong> {order.paymentMethod}
        </p>
        <p>
          <strong>Estado:</strong>{' '}
          <span className="capitalize font-medium">{order.status}</span>
        </p>
        <p>
          <strong>Fecha:</strong> {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="mt-4 pt-4 border-t">
        <h3 className="font-bold text-lg">Detalles de Envío</h3>
        <div className="space-y-1 text-sm mt-2">
          <p>
            <strong>Método:</strong> {order.shippingDetails.method}
          </p>
          {order.shippingDetails.address &&
            order.shippingDetails.address !== 'Retiro en Local' && (
              <p>
                <strong>Dirección:</strong> {order.shippingDetails.address}
              </p>
            )}
          {order.shippingDetails.notes && (
            <p>
              <strong>Notas de Envío:</strong> {order.shippingDetails.notes}
            </p>
          )}
        </div>
      </div>

      {order.notes && (
        <div className="mt-4 pt-4 border-t">
          <h3 className="font-bold text-lg">Notas Generales del Pedido:</h3>
          <p className="p-2 bg-gray-100 rounded-md text-sm mt-2">
            {order.notes}
          </p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t">
        <h3 className="font-bold text-lg">Productos:</h3>
        <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
          {order.items.map((item) => (
            <li key={item._id}>
              {item.nombre} (x{item.quantity})
              {item.finish && (
                <span className="text-gray-600"> - Acabado: {item.finish}</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="text-right mt-6">
        <button
          onClick={onClose}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
)

const AdminPedidosPage = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const { data: session, status } = useSession()
  const router = useRouter()

  const fetchOrders = useCallback(
    debounce(async (page: number, status: string, search: string) => {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
      })
      if (status) params.append('status', status)
      if (search) params.append('search', search)

      const res = await fetch(`/api/orders/listar?${params.toString()}`)
      const data = await res.json()
      setOrders(data.orders)
      setTotalPages(data.totalPages)
      setCurrentPage(data.currentPage)
    }, 300),
    [],
  )

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/api/auth/signin')
    } else if (status === 'authenticated') {
      fetchOrders(currentPage, statusFilter, searchTerm)
    }
  }, [status, router, currentPage, statusFilter, searchTerm, fetchOrders])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/orders/actualizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      })
      if (res.ok) {
        fetchOrders(currentPage, statusFilter, searchTerm)
      } else {
        console.error('Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const handleFilterChange = (newStatus: string) => {
    setCurrentPage(1)
    setStatusFilter(newStatus)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPage(1)
    setSearchTerm(e.target.value)
  }

  if (status === 'loading') {
    return (
      <AdminLayout>
        <div className="text-xl font-semibold">Cargando...</div>
      </AdminLayout>
    )
  }

  if (!session) {
    return null
  }

  const statusOptions = ['pendiente', 'enviado', 'entregado']

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Administración de Pedidos</h1>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div className="flex items-center gap-2 bg-gray-200 p-1 rounded-lg">
          <button
            onClick={() => handleFilterChange('')}
            className={`px-3 py-1 rounded-md text-sm ${statusFilter === '' ? 'bg-white shadow' : ''}`}
          >
            Todos
          </button>
          {statusOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => handleFilterChange(opt)}
              className={`px-3 py-1 rounded-md text-sm capitalize ${statusFilter === opt ? 'bg-white shadow' : ''}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left">Cliente</th>
                <th className="py-3 px-4 text-left">Total</th>
                <th className="py-3 px-4 text-left">Estado</th>
                <th className="py-3 px-4 text-left">Fecha</th>
                <th className="py-3 px-4 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="py-4 px-4 whitespace-nowrap">{order.name}</td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    {order.status}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap flex gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600"
                    >
                      Ver Detalles
                    </button>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order._id, e.target.value)
                      }
                      className="border rounded-lg px-2 py-1 text-sm"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt} value={opt} className="capitalize">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Anterior
          </button>
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </AdminLayout>
  )
}

export default AdminPedidosPage

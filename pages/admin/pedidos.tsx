import { useState, useEffect, useCallback, useMemo } from 'react'

import AdminLayout from '../../components/AdminLayout'
import { debounce } from 'lodash'
import OrderAssistantModal from '../../components/admin/OrderAssistantModal'
import ShippingLabel from '../../components/admin/ShippingLabel'
import OrderReceipt from '../../components/admin/OrderReceipt'

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
  onRefresh,
}: {
  order: Order
  onClose: () => void
  onRefresh: () => void
}) => {
  const [showLabel, setShowLabel] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    name: order.name,
    phone: order.phone || '',
    email: order.email || '',
    shippingDetails: {
      method: order.shippingDetails.method,
      address: order.shippingDetails.address,
      notes: order.shippingDetails.notes || ''
    }
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/orders/actualizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order._id,
          ...editData
        }),
      });

      if (res.ok) {
        setIsEditing(false);
        onRefresh();
      } else {
        alert('Error al guardar los cambios');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error de conexión al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className={`bg-white p-6 rounded-2xl shadow-xl w-full max-h-full overflow-y-auto transition-all duration-500 ${(showLabel || showReceipt) ? 'max-w-5xl' : 'max-w-2xl'}`}>
        <div className="flex justify-between items-start border-b pb-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold">Detalles del Pedido</h2>
            <p className="text-xs text-gray-500 font-mono mt-1">ID: {order._id}</p>
          </div>
          <div className="flex gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg border border-blue-600 text-sm font-bold transition"
              >
                Editar Datos
              </button>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl px-2">
              &times;
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información del Cliente */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider">Información del Cliente</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 block uppercase">Nombre</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                ) : (
                  <p className="font-medium">{order.name}</p>
                )}
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 block uppercase">Teléfono</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.phone}
                    onChange={e => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                ) : (
                  <p className="font-medium">{order.phone || 'No especificado'}</p>
                )}
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 block uppercase">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editData.email}
                    onChange={e => setEditData({ ...editData, email: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                ) : (
                  <p className="font-medium">{order.email || 'No especificado'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Información de Envío */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider">Detalles de Envío</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 block uppercase">Método / Agencia</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.shippingDetails.method}
                    onChange={e => setEditData({
                      ...editData,
                      shippingDetails: { ...editData.shippingDetails, method: e.target.value }
                    })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Ej: DAC, Retiro, Correo..."
                  />
                ) : (
                  <p className="font-medium">{order.shippingDetails.method}</p>
                )}
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 block uppercase">Dirección</label>
                {isEditing ? (
                  <textarea
                    value={editData.shippingDetails.address}
                    onChange={e => setEditData({
                      ...editData,
                      shippingDetails: { ...editData.shippingDetails, address: e.target.value }
                    })}
                    rows={2}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                ) : (
                  <p className="font-medium">{order.shippingDetails.address}</p>
                )}
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 block uppercase">Notas de Envío</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.shippingDetails.notes}
                    onChange={e => setEditData({
                      ...editData,
                      shippingDetails: { ...editData.shippingDetails, notes: e.target.value }
                    })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Ej: Portón blanco, entre calles..."
                  />
                ) : (
                  <p className="text-sm italic">{order.shippingDetails.notes || 'Sin notas'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Resumen Económico (Siempre Lectura) */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Total Pedido</p>
            <p className="text-2xl font-black text-blue-900">${(order.total || 0).toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Estado / Pago</p>
            <p className="font-bold text-gray-700 capitalize">{order.status} / {order.paymentMethod}</p>
          </div>
        </div>

        {order.notes && !isEditing && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="font-bold text-lg mb-2">Notas Generales:</h3>
            <p className="p-3 bg-yellow-50 border-l-4 border-yellow-400 text-sm">
              {order.notes}
            </p>
          </div>
        )}

        {/* Lista de Productos */}
        {!isEditing && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="font-bold text-lg mb-2">Productos:</h3>
            <ul className="space-y-2">
              {order.items.map((item) => (
                <li key={item._id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg">
                  <span>
                    <span className="font-bold">{item.nombre}</span>
                    {item.finish && <span className="text-gray-500 ml-2">({item.finish})</span>}
                  </span>
                  <span className="font-bold">x{item.quantity} - ${(item.precio || 0).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap justify-between items-center mt-8 pt-6 border-t gap-3">
          {isEditing ? (
            <div className="flex gap-3 w-full">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-grow bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 text-sm"
              >
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditData({
                    name: order.name,
                    phone: order.phone || '',
                    email: order.email || '',
                    shippingDetails: {
                      method: order.shippingDetails.method,
                      address: order.shippingDetails.address,
                      notes: order.shippingDetails.notes || ''
                    }
                  });
                }}
                className="bg-gray-200 text-gray-800 px-5 py-2.5 rounded-xl font-bold hover:bg-gray-300 transition text-sm"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setShowLabel(!showLabel);
                    if (!showLabel) setShowReceipt(false);
                  }}
                  className="bg-green-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-green-700 transition shadow-sm flex items-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                  {showLabel ? 'Ocultar' : 'Etiqueta'}
                </button>
                <button
                  onClick={() => {
                    setShowReceipt(!showReceipt);
                    if (!showReceipt) setShowLabel(false);
                  }}
                  className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-sm flex items-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  {showReceipt ? 'Ocultar' : 'Nota de Pedido'}
                </button>
              </div>
              <button
                onClick={onClose}
                className="bg-gray-100 text-gray-500 px-5 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition text-sm"
              >
                Cerrar
              </button>
            </>
          )}
        </div>

        {showLabel && !isEditing && (
          <div className="mt-8 border-t pt-6 bg-slate-50 -mx-6 px-6 pb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-blue-900 font-black uppercase tracking-tighter">Vista Previa: Etiqueta de Envío</h3>
              <button
                onClick={() => window.print()}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition flex items-center gap-2 font-bold shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                Imprimir Etiqueta
              </button>
            </div>
            <div className="flex justify-center p-4">
              <ShippingLabel order={{ ...order, ...editData }} />
            </div>
          </div>
        )}

        {showReceipt && !isEditing && (
          <div className="mt-8 border-t pt-6 bg-slate-50 -mx-6 px-6 pb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-blue-900 font-black uppercase tracking-tighter">Vista Previa: Nota de Pedido</h3>
              <button
                onClick={() => {
                  const content = document.querySelector('.receipt-preview-wrapper')?.innerHTML;
                  if (content) {
                    // Importamos la función dinámicamente o asumimos que está disponible
                    import('../../lib/print-utils').then(mod => {
                      mod.printHtmlContent(content);
                    });
                  }
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition flex items-center gap-2 font-bold shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                Imprimir Nota
              </button>
            </div>
            <div className="bg-gray-100 rounded-xl border border-gray-200 p-8 flex justify-center overflow-hidden receipt-preview-container">
              <div style={{
                transform: 'scale(var(--receipt-scale, 0.75))',
                transformOrigin: 'top center',
                width: '21cm',
                height: 'calc(29.7cm * var(--receipt-scale, 0.75))',
                minHeight: '29.7cm'
              }} className="shadow-2xl transition-all duration-500 bg-white receipt-preview-wrapper">
                <OrderReceipt order={{ ...order, ...editData }} />
              </div>
            </div>

            <style jsx>{`
              @media (max-width: 640px) { div { --receipt-scale: 0.45; } }
              @media (min-width: 641px) and (max-width: 1024px) { div { --receipt-scale: 0.65; } }
              @media (min-width: 1025px) { div { --receipt-scale: 0.85; } }
              
              @media print {
                .receipt-preview-container {
                  background: none !important;
                  border: none !important;
                  border-radius: 0 !important;
                  padding: 0 !important;
                  margin: 0 !important;
                }
                
                .receipt-preview-wrapper {
                  transform: none !important;
                  scale: 1 !important;
                  width: 100% !important;
                  height: auto !important;
                  min-height: auto !important;
                  box-shadow: none !important;
                  margin: 0 !important;
                  padding: 0 !important;
                }
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  );
}

const AdminPedidosPage = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)



  const debouncedFetchOrders = useMemo(
    () =>
      debounce(async (page: number, status: string, search: string) => {
        const params = new URLSearchParams({
          page: String(page),
          limit: '20',
        })
        if (status) params.append('status', status)
        if (search) params.append('search', search)

        try {
          const res = await fetch(`/api/orders/listar?${params.toString()}`)
          const data = await res.json()
          setOrders(data.orders)
          setTotalPages(data.totalPages)
          setCurrentPage(data.currentPage)
        } catch (error) {
          console.error("Error fetching orders:", error)
        }
      }, 300),
    [], // useMemo dependency array is empty to create the debounced function only once
  )

  useEffect(() => {
    debouncedFetchOrders(currentPage, statusFilter, searchTerm)
    // Cleanup on unmount
    return () => {
      debouncedFetchOrders.cancel()
    }
  }, [currentPage, statusFilter, searchTerm, debouncedFetchOrders])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/orders/actualizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      })
      if (res.ok) {
        debouncedFetchOrders(currentPage, statusFilter, searchTerm)
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

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
      return;
    }

    try {
      const res = await fetch('/api/orders/eliminar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      if (res.ok) {
        debouncedFetchOrders(currentPage, statusFilter, searchTerm);
      } else {
        alert('Error al eliminar el pedido');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Error de conexión al eliminar');
    }
  }

  const statusOptions = ['pendiente', 'pagado', 'enviado', 'entregado']

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Administración de Pedidos</h1>
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
        >
          <span>✨</span> Nuevo Pedido con IA
        </button>
      </div>

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
                    ${(order.total || 0).toFixed(2)}
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
                      className="border rounded-lg px-2 py-1 text-sm mr-2"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt} value={opt} className="capitalize">
                          {opt}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDeleteOrder(order._id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors"
                      title="Eliminar Pedido"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
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
          onRefresh={() => debouncedFetchOrders(currentPage, statusFilter, searchTerm)}
        />
      )}

      {isAssistantOpen && (
        <OrderAssistantModal
          onClose={() => setIsAssistantOpen(false)}
          onOrderCreated={() => debouncedFetchOrders(currentPage, statusFilter, searchTerm)}
        />
      )}
    </AdminLayout>
  )
}

export default AdminPedidosPage

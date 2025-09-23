import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import AdminLayout from '../../../components/AdminLayout'
import toast from 'react-hot-toast'

interface Coupon {
  _id: string
  code: string
  discountType: 'percentage' | 'fixed'
  value: number
  expirationDate: string // ISO Date string
  maxUses: number
  usedCount: number
  applicableTo: 'all' | 'products' | 'categories'
  applicableItems?: string[]
  minPurchaseAmount?: number
}

export default function AdminCouponsIndex() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin')
    }
  }, [session, status, router])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/coupons/listar')
      if (!res.ok) {
        throw new Error(`Error fetching coupons: ${res.statusText}`)
      }
      const data = await res.json()
      setCoupons(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCoupons()
    }
  }, [status])

  const handleDelete = async (code: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este cupón?')) {
      return
    }
    try {
      const res = await fetch(`/api/coupons/eliminar?code=${code}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(
          data.message || `Error deleting coupon: ${res.statusText}`,
        )
      }
      toast.success('Cupón eliminado con éxito')
      setCoupons(coupons.filter((coupon) => coupon.code !== code))
    } catch (err: any) {
      toast.error(`Error al eliminar el cupón: ${err.message}`)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <p>Cargando...</p>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <p className="text-red-500">Error: {error}</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Administrar Cupones</h1>
      <Link
        href="/admin/coupons/create"
        className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 transition mb-6 inline-block"
      >
        Crear Nuevo Cupón
      </Link>

      {coupons.length === 0 ? (
        <p>No hay cupones creados.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Código
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Tipo
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Valor
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Expira
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Usos
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Aplica a
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coupons.map((coupon) => (
                <tr key={coupon._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {coupon.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {coupon.discountType === 'percentage'
                      ? 'Porcentaje'
                      : 'Monto Fijo'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {coupon.discountType === 'percentage'
                      ? `${coupon.value}%`
                      : `$U ${coupon.value}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(coupon.expirationDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {coupon.usedCount} / {coupon.maxUses}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {coupon.applicableTo === 'all'
                      ? 'Todos'
                      : coupon.applicableTo === 'products'
                        ? `Productos (${coupon.applicableItems?.length || 0})`
                        : `Categorías (${coupon.applicableItems?.length || 0})`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/coupons/edit/${coupon.code}`}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(coupon.code)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}

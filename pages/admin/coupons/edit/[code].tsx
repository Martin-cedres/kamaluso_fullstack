import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import AdminLayout from '../../../../components/AdminLayout'
import CouponForm from '../form'
import { ICoupon } from '@/models/Coupon'
import toast from 'react-hot-toast'

export default function AdminCouponEdit() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { code } = router.query // Coupon code from URL
  const [coupon, setCoupon] = useState<ICoupon | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin')
    }
  }, [session, status, router])

  const fetchCoupon = useCallback(async () => {
    try {
      setLoading(true)
      // Fetch coupon by code (assuming listar endpoint can filter by code)
      const res = await fetch(`/api/coupons/listar?code=${code}`)
      if (!res.ok) {
        throw new Error(`Error fetching coupon: ${res.statusText}`)
      }
      const data = await res.json()
      if (data && data.length > 0) {
        setCoupon(data[0])
      } else {
        setError('Cupón no encontrado.')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [code])

  useEffect(() => {
    if (status === 'authenticated' && code) {
      fetchCoupon()
    }
  }, [status, code, fetchCoupon])

  const handleSubmit = async (formData: any) => {
    try {
      const res = await fetch('/api/coupons/editar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Error al actualizar el cupón')
      }

      toast.success('Cupón actualizado con éxito!')
      router.push('/admin/coupons') // Redirect to coupons list
    } catch (err: any) {
      toast.error(`Error: ${err.message}`)
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

  if (!coupon) {
    return (
      <AdminLayout>
        <p>Cupón no encontrado.</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Editar Cupón</h1>
      <CouponForm
        initialData={coupon}
        onSubmit={handleSubmit}
        isEditMode={true}
      />
    </AdminLayout>
  )
}

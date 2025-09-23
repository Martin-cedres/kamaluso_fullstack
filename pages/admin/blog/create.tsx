import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import AdminLayout from '../../../components/AdminLayout'
import BlogForm from './form'
import toast from 'react-hot-toast'

export default function AdminBlogCreate() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return (
      <AdminLayout>
        <p>Cargando...</p>
      </AdminLayout>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/api/auth/signin')
    return null
  }

  const handleSubmit = async (formData: any) => {
    try {
      const res = await fetch('/api/blog/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Error al crear el artículo')
      }

      toast.success('Artículo creado con éxito!')
      router.push('/admin/blog') // Redirect to blog list
    } catch (err: any) {
      toast.error(`Error: ${err.message}`)
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Crear Nuevo Artículo del Blog</h1>
      <BlogForm onSubmit={handleSubmit} />
    </AdminLayout>
  )
}

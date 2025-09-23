import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import AdminLayout from '../../../../components/AdminLayout'
import BlogForm from '../form'
import toast from 'react-hot-toast'

interface Post {
  _id: string
  title: string
  subtitle?: string
  content: string
  slug: string
  excerpt?: string
  createdAt: string
  tags?: string[]
}

export default function AdminBlogEdit() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { slug } = router.query
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin')
    }
  }, [session, status, router])

  useEffect(() => {
    if (status === 'authenticated' && slug) {
      const fetchPost = async () => {
        try {
          setLoading(true)
          const res = await fetch(`/api/blog/listar?slug=${slug}`)
          if (!res.ok) {
            throw new Error(`Error fetching post: ${res.statusText}`)
          }
          const data = await res.json()
          if (data && data.length > 0) {
            setPost(data[0])
          } else {
            setError('Artículo no encontrado.')
          }
        } catch (err: any) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      }
      fetchPost()
    }
  }, [status, slug])

  const handleSubmit = async (formData: any) => {
    try {
      const res = await fetch('/api/blog/editar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Error al actualizar el artículo')
      }

      toast.success('Artículo actualizado con éxito!')
      router.push('/admin/blog') // Redirect to blog list
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

  if (!post) {
    return (
      <AdminLayout>
        <p>Artículo no encontrado.</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Editar Artículo del Blog</h1>
      <BlogForm initialData={post} onSubmit={handleSubmit} isEditMode={true} />
    </AdminLayout>
  )
}

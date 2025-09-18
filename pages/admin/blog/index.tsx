import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import AdminLayout from '../../../components/AdminLayout'; // Corrected import path
import toast from 'react-hot-toast';

interface Post {
  _id: string;
  title: string;
  subtitle?: string;
  slug: string;
  excerpt?: string;
  createdAt: string;
  tags?: string[];
}

export default function AdminBlogIndex() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      const fetchPosts = async () => {
        try {
          setLoading(true);
          const res = await fetch('/api/blog/listar');
          if (!res.ok) {
            throw new Error(`Error fetching posts: ${res.statusText}`);
          }
          const data = await res.json();
          setPosts(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchPosts();
    }
  }, [status]);

  const handleDelete = async (slug: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este artículo?')) {
      return;
    }
    try {
      const res = await fetch(`/api/blog/eliminar?slug=${slug}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || `Error deleting post: ${res.statusText}`);
      }
      toast.success('Artículo eliminado con éxito');
      setPosts(posts.filter(post => post.slug !== slug));
    } catch (err: any) {
      toast.error(`Error al eliminar el artículo: ${err.message}`);
    }
  };

  if (status === 'loading' || loading) {
    return <AdminLayout><p>Cargando...</p></AdminLayout>;
  }

  if (error) {
    return <AdminLayout><p className="text-red-500">Error: {error}</p></AdminLayout>;
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Administrar Artículos del Blog</h1>
      <Link href="/admin/blog/create" className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 transition mb-6 inline-block">
        Crear Nuevo Artículo
      </Link>

      {posts.length === 0 ? (
        <p>No hay artículos en el blog.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Creación</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{post.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.slug}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/blog/edit/${post.slug}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                      Editar
                    </Link>
                    <button onClick={() => handleDelete(post.slug)} className="text-red-600 hover:text-red-900">
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
  );
}

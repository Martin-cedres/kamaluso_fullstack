import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '../../../components/AdminLayout';
import toast from 'react-hot-toast';

// --- Interfaces ---
interface Post {
  _id: string;
  title: string;
  slug: string;
  createdAt: string;
}

interface Idea {
  title: string;
  targetKeyword: string;
  audience: string;
  angle: string;
}

export default function AdminBlogIndex() {
  // --- Estados para la lista de posts existentes ---
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);

  // --- Estados para la Fábrica de Ideas ---
  const [theme, setTheme] = useState('');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [ideasError, setIdeasError] = useState<string | null>(null);

  // Efecto para cargar los posts existentes
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setPostsLoading(true);
        const res = await fetch('/api/blog/listar');
        if (!res.ok) throw new Error(`Error fetching posts: ${res.statusText}`);
        const data = await res.json();
        setPosts(data);
      } catch (err: any) {
        setPostsError(err.message);
      } finally {
        setPostsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Función para manejar la eliminación de un post
  const handleDelete = async (slug: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este artículo?')) return;
    try {
      const res = await fetch(`/api/blog/eliminar?slug=${slug}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || `Error deleting post: ${res.statusText}`);
      }
      toast.success('Artículo eliminado con éxito');
      setPosts(posts.filter((post) => post.slug !== slug));
    } catch (err: any) {
      toast.error(`Error al eliminar el artículo: ${err.message}`);
    }
  };

  // Función para generar ideas de blog
  const handleGenerateIdeas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme) {
      toast.error('Por favor, introduce un tema para generar ideas.');
      return;
    }
    setIdeasLoading(true);
    setIdeas([]);
    setIdeasError(null);
    try {
      const res = await fetch('/api/admin/blog/generate-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Ocurrió un error en la API.');
      }
      const data = await res.json();
      if (!data.ideas || data.ideas.length === 0) {
        toast.success('La IA no generó ideas esta vez. ¡Intenta con un tema más específico!');
      }
      setIdeas(data.ideas);
    } catch (err: any) {
      setIdeasError(err.message);
      toast.error(`Error al generar ideas: ${err.message}`);
    } finally {
      setIdeasLoading(false);
    }
  };

  return (
    <AdminLayout>
      {/* --- Sección Fábrica de Ideas --- */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8 border border-pink-200">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">💡 Fábrica de Ideas para el Blog</h2>
        <p className="text-gray-600 mb-4">¿No sabes sobre qué escribir? Introduce un tema general y deja que la IA genere ideas de alto potencial para ti.</p>
        <form onSubmit={handleGenerateIdeas}>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Ej: Regalos para empresas, Bullet journal, Agendas 2026..."
              className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
              disabled={ideasLoading}
            />
            <button
              type="submit"
              className="bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600 transition disabled:bg-gray-400"
              disabled={ideasLoading}
            >
              {ideasLoading ? 'Generando...' : 'Generar Ideas'}
            </button>
          </div>
        </form>
        {ideasLoading && <p className="text-center mt-4 text-gray-500">Buscando inspiración...</p>}
        {ideasError && <p className="text-center mt-4 text-red-500">Error: {ideasError}</p>}
        {ideas.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {ideas.map((idea, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg border flex flex-col">
                <div className="flex-grow">
                  <h3 className="font-bold text-lg text-gray-800">{idea.title}</h3>
                  <p className="text-sm text-gray-600 mt-1"><strong className="font-medium">🎯 Keyword:</strong> {idea.targetKeyword}</p>
                  <p className="text-sm text-gray-600"><strong className="font-medium">👤 Público:</strong> {idea.audience}</p>
                  <p className="text-sm text-gray-600"><strong className="font-medium">✨ Ángulo:</strong> {idea.angle}</p>
                </div>
                <div className="mt-4">
                  <Link
                    href={{
                      pathname: '/admin/blog/create',
                      query: {
                        title: idea.title,
                        targetKeyword: idea.targetKeyword,
                        audience: idea.audience,
                        angle: idea.angle,
                      },
                    }}
                    className="inline-block w-full text-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition text-sm font-semibold"
                  >
                    Usar esta Idea
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Sección Administrar Artículos --- */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Administrar Artículos</h1>
        <Link
          href="/admin/blog/create"
          className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 transition"
        >
          Crear Nuevo Artículo
        </Link>
      </div>

      {postsLoading && <p>Cargando artículos existentes...</p>}
      {postsError && <p className="text-red-500">Error: {postsError}</p>}

      {!postsLoading && !postsError && posts.length === 0 ? (
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
                    <Link href={`/admin/blog/edit/${post.slug}`} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</Link>
                    <button onClick={() => handleDelete(post.slug)} className="text-red-600 hover:text-red-900">Eliminar</button>
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

// Use SSR for admin pages
export async function getServerSideProps() {
  return {
    props: {},
  };
}

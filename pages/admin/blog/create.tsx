import { useRouter } from 'next/router';
import AdminLayout from '../../../components/AdminLayout';
import BlogForm from '../../../components/BlogForm';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';

// Defino un tipo para los datos iniciales del formulario
type InitialData = {
  title: string;
  content: string;
  seoTitle: string;
  tags: string[];
};

export default function AdminBlogCreate() {
  const router = useRouter();
  const { query } = router;

  const [initialData, setInitialData] = useState<InitialData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Solo actuar si vienen datos de la idea en la URL
    if (query.title) {
      setIsLoading(true);
      setError(null);

      const ideaDetails = {
        title: query.title as string,
        targetKeyword: query.targetKeyword as string,
        audience: query.audience as string,
        angle: query.angle as string,
      };

      const generateOutline = async () => {
        try {
          toast.loading('Generando esquema con IA...', { id: 'outline-toast' });
          
          const res = await fetch('/api/admin/blog/generate-outline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ideaDetails),
          });

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Error al generar el esquema.');
          }

          const { outlineHtml } = await res.json();

          // Preparamos los datos para el formulario con el esquema recibido
          setInitialData({
            title: ideaDetails.title,
            content: outlineHtml,
            seoTitle: ideaDetails.title,
            tags: [ideaDetails.targetKeyword],
          });

          toast.success('Esquema generado con éxito.', { id: 'outline-toast' });

        } catch (err: any) {
          setError(err.message);
          toast.error(`Error: ${err.message}`, { id: 'outline-toast' });
          // Si falla, al menos pre-rellenamos con lo básico
          setInitialData({
            title: ideaDetails.title,
            content: `<p>Error al generar el esquema. Por favor, desarrolla el artículo aquí.</p>`,
            seoTitle: ideaDetails.title,
            tags: [ideaDetails.targetKeyword],
          });
        } finally {
          setIsLoading(false);
        }
      };

      generateOutline();
    } else {
      // Si no hay query params, es una creación manual
      setIsLoading(false);
    }
  }, [query]);

  const handleSubmit = async (formData: FormData) => {
    try {
      const res = await fetch('/api/blog/crear', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al crear el artículo');
      }

      toast.success('Artículo creado con éxito!');
      router.push('/admin/blog');
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Crear Nuevo Artículo del Blog</h1>
      
      {isLoading ? (
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <p className="text-lg text-gray-600">🤖 Arquitecto de Contenidos trabajando...</p>
          <p className="mt-2 text-sm text-gray-500">Generando un esquema SEO detallado para tu artículo. Por favor, espera un momento.</p>
        </div>
      ) : error ? (
         <div className="text-center p-8 bg-red-50 rounded-lg shadow-md border border-red-200">
          <p className="text-lg text-red-700">❌ Error al generar el esquema</p>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <p className="mt-4 text-sm text-gray-500">Puedes continuar y escribir el artículo manualmente.</p>
          <BlogForm onSubmit={handleSubmit} initialData={initialData} />
        </div>
      ) : (
        <BlogForm onSubmit={handleSubmit} initialData={initialData} />
      )}
    </AdminLayout>
  );
}

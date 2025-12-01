import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { IPillarPage, IPillarPageDTO } from '../../models/PillarPage'; // Importar las interfaces

// Componente de Formulario para la Página Pilar
const PillarPageForm = ({ onSubmit, initialData, onCancel, onGenerateAIContent, isGeneratingAIContent, setIsGeneratingAIContent }: {
  onSubmit: (data: any) => void;
  initialData?: IPillarPageDTO | null;
  onCancel: () => void;
  onGenerateAIContent: (data: { id?: string; topic: string; title: string }) => Promise<void>;
  isGeneratingAIContent: boolean;
  setIsGeneratingAIContent: (isLoading: boolean) => void;
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    topic: initialData?.topic || '',
    slug: initialData?.slug || '',
    content: initialData?.content || '',
    seoTitle: initialData?.seoTitle || '',
    seoDescription: initialData?.seoDescription || '',
    // Si hay proposedContent, usarlo como valor inicial para content si content está vacío
    // Esto permite que el usuario vea el contenido generado por IA directamente en el editor
    proposedContent: initialData?.proposedContent || '',
    status: initialData?.status || 'published',
  });

  useEffect(() => {
    // Generar slug automáticamente si no estamos en modo edición
    if (!initialData) {
      const newSlug = formData.title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');
      setFormData(f => ({ ...f, slug: newSlug }));
    }
    // Si hay proposedContent en initialData y es un nuevo formulario o el contenido principal está vacío,
    // precargar el contenido propuesto por IA en el campo de contenido.
    if (initialData?.proposedContent && !initialData.content && !formData.content) {
      setFormData(f => ({ ...f, content: initialData.proposedContent }));
    }
  }, [formData.title, initialData, initialData?.proposedContent, formData.content]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, _id: initialData?._id });
  };

  const handleGenerateClick = async () => {
    if (!formData.topic || !formData.title) {
      toast.error('El Título y el Tema Principal son necesarios para generar contenido con IA.');
      return;
    }
    setIsGeneratingAIContent(true);
    try {
      await onGenerateAIContent({
        id: initialData?._id as string | undefined, // Puede que aún no tenga ID si es nuevo
        topic: formData.topic,
        title: formData.title,
      });
      // El contenido generado se cargará a través de fetchPillarPages y setEditingPage
    } finally {
      setIsGeneratingAIContent(false);
    }
  };

  const showAIGenerateButton = !initialData || (initialData && initialData.status === 'published'); // Solo si es nuevo o ya publicado
  const canGenerateAIContent = formData.topic.trim() !== '' && formData.title.trim() !== '';

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8 animate-fade-in-down">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {initialData ? 'Editar Página Pilar' : 'Crear Nueva Página Pilar'}
        </h2>

        {/* --- Información Principal --- */}
        <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Título de la Página Pilar</label>
            <input id="title" name="title" type="text" value={formData.title} onChange={handleChange} required placeholder="Ej: La Guía Definitiva de Agendas Personalizadas" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" />
          </div>
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">Tema Principal del Cluster</label>
            <input id="topic" name="topic" type="text" value={formData.topic} onChange={handleChange} required placeholder="Ej: Agendas Personalizadas" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" />
          </div>
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
            <input id="slug" name="slug" type="text" value={formData.slug} onChange={handleChange} className="w-full rounded-lg border-gray-300 shadow-sm bg-gray-100" readOnly />
          </div>
        </div>

        {/* --- Contenido --- */}
        <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Contenido Principal
            {formData.status === 'pending_review' && (
              <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-orange-800 bg-orange-100 rounded-full">
                Pendiente de Revisión (IA)
              </span>
            )}
          </label>
          <textarea id="content" name="content" value={formData.content} onChange={handleChange} rows={15} className="w-full rounded-lg border-gray-300 shadow-sm" placeholder="Escribe aquí el contenido extenso de la página pilar..."></textarea>
          {formData.proposedContent && formData.status === 'pending_review' && (
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-semibold">Nota:</span> Hay contenido generado por IA pendiente de revisión.
              Puedes revisarlo y aprobarlo para reemplazar el contenido actual.
            </p>
          )}
        </div>

        {/* --- SEO --- */}
        <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">SEO</h3>
          <div>
            <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700 mb-1">Título SEO</label>
            <input id="seoTitle" name="seoTitle" type="text" value={formData.seoTitle} onChange={handleChange} className="w-full rounded-lg border-gray-300 shadow-sm" />
          </div>
          <div>
            <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700 mb-1">Descripción SEO</label>
            <textarea id="seoDescription" name="seoDescription" value={formData.seoDescription} onChange={handleChange} rows={3} className="w-full rounded-lg border-gray-300 shadow-sm"></textarea>
          </div>
        </div>

        {/* --- Acciones --- */}
        <div className="flex gap-4 pt-4 border-t">
          <button type="submit" className="bg-pink-600 text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:bg-pink-700">
            {initialData ? 'Actualizar Página Pilar' : 'Crear Página Pilar'}
          </button>
          <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium hover:bg-gray-300">
            Cancelar
          </button>
          {showAIGenerateButton && (
            <button
              type="button"
              onClick={handleGenerateClick}
              disabled={isGeneratingAIContent || !canGenerateAIContent}
              className={`px-6 py-2 rounded-lg font-semibold shadow-md transition ${isGeneratingAIContent || !canGenerateAIContent
                ? 'bg-purple-300 text-purple-100 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
            >
              {isGeneratingAIContent ? 'Generando con IA...' : 'Generar Contenido con IA'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};


// Componente Principal de la Página
const AdminPillarPages = () => {
  const [pillarPages, setPillarPages] = useState<IPillarPageDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPage, setEditingPage] = useState<IPillarPageDTO | null>(null);
  const [isGeneratingAIContent, setIsGeneratingAIContent] = useState(false);

  const fetchPillarPages = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/pillar-pages/listar');
      if (!res.ok) throw new Error('Error al cargar las páginas pilares');
      const data = await res.json();
      setPillarPages(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPillarPages();
  }, [fetchPillarPages]);

  const handleFormSubmit = async (data: any) => {
    const isEditMode = !!data._id;
    const url = isEditMode ? '/api/admin/pillar-pages/editar' : '/api/admin/pillar-pages/crear';
    const toastId = toast.loading(isEditMode ? 'Actualizando...' : 'Creando...');

    try {
      const res = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Ocurrió un error');
      }

      toast.success('¡Operación exitosa!', { id: toastId });
      setShowForm(false);
      setEditingPage(null);
      fetchPillarPages(); // Recargar la lista
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    }
  };

  const handleGenerateAIContent = async ({ id, topic, title }: { id?: string; topic: string; title: string }) => {
    const toastId = toast.loading('Generando contenido con IA...');
    try {
      let pillarPageId = id;

      // Si no hay ID, significa que estamos creando una nueva página pilar.
      // Primero la creamos sin contenido para obtener un ID.
      if (!pillarPageId) {
        const createRes = await fetch('/api/admin/pillar-pages/crear', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, topic, slug: title.toLowerCase().replace(/\s+/g, '-'), content: '', seoTitle: '', seoDescription: '' }),
        });
        if (!createRes.ok) {
          const errorData = await createRes.json();
          throw new Error(errorData.message || 'Error al crear la página pilar antes de la generación IA');
        }
        const newPillarPage = await createRes.json();
        pillarPageId = newPillarPage._id;
        toast.success('Página pilar creada, generando contenido con IA...', { id: toastId });
        await fetchPillarPages(); // Recargar para que aparezca la nueva página
      }

      const res = await fetch('/api/admin/pillar-pages/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pillarPageId, topic, title }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al generar contenido con IA');
      }

      const { proposedContent } = await res.json();
      toast.success('Contenido generado con IA y pendiente de revisión.', { id: toastId });

      // Actualizar el estado para reflejar el contenido propuesto
      // Esto hará que el formulario muestre el contenido generado por IA
      setEditingPage(prev => {
        if (prev) {
          return { ...prev, proposedContent: proposedContent, status: 'pending_review' };
        } else {
          // Si no había prev, significa que creamos uno nuevo justo antes
          // Necesitamos encontrar ese nuevo y actualizarlo
          const updatedPage = pillarPages.find(p => p._id === pillarPageId);
          if (updatedPage) {
            return { ...updatedPage, proposedContent: proposedContent, status: 'pending_review' };
          }
          return null;
        }
      });
      fetchPillarPages(); // Recargar la lista para actualizar el estado visual en la tabla
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
      console.error('Error in handleGenerateAIContent:', error);
    } finally {
      setIsGeneratingAIContent(false);
    }
  };


  const handleEdit = (page: IPillarPageDTO) => {
    setEditingPage(page);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta página pilar?')) return;
    const toastId = toast.loading('Eliminando...');
    try {
      const res = await fetch(`/api/admin/pillar-pages/eliminar?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al eliminar');
      }
      toast.success('Página eliminada', { id: toastId });
      fetchPillarPages();
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    }
  };

  const handleRefreshProducts = async (id: string) => {
    if (!window.confirm('¿Quieres actualizar los productos de esta página con los más nuevos del inventario?')) return;
    const toastId = toast.loading('Actualizando frescura...');
    try {
      const res = await fetch('/api/admin/pillar-pages/refresh-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al actualizar');
      }

      if (data.updated) {
        toast.success(`¡Éxito! ${data.productsCount} productos actualizados.`, { id: toastId });
      } else {
        toast('No se encontraron productos nuevos para actualizar.', { icon: 'ℹ️', id: toastId });
      }

      fetchPillarPages();
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPage(null);
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Páginas Pilares
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona tu contenido pilar para la estrategia de Topic Clusters.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingPage(null);
            setShowForm(true);
          }}
          className="bg-pink-500 text-white px-4 py-2 rounded-lg shadow hover:bg-pink-600 transition"
        >
          Crear Nueva Página Pilar
        </button>
      </div>

      {showForm && (
        <PillarPageForm
          onSubmit={handleFormSubmit}
          initialData={editingPage}
          onCancel={handleCancel}
          onGenerateAIContent={handleGenerateAIContent}
          isGeneratingAIContent={isGeneratingAIContent}
          setIsGeneratingAIContent={setIsGeneratingAIContent}
        />
      )}

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left text-gray-700">
            <tr>
              <th className="px-6 py-3">Título</th>
              <th className="px-6 py-3">Tema del Cluster</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3">Slug</th>
              <th className="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-8">Cargando...</td></tr>
            ) : pillarPages.map((page) => (
              <tr key={page._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{page.title}</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{page.topic}</span></td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${page.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                    {page.status === 'published' ? 'Publicado' : 'Pendiente Revisión'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600 font-mono">{page.slug}</td>
                <td className="px-6 py-4 flex gap-4">
                  <button onClick={() => handleEdit(page)} className="text-blue-600 hover:text-blue-800 font-semibold">Editar</button>
                  {page.status === 'pending_review' && (
                    <Link href={`/admin/clusters/review/${page._id}`} className="text-orange-600 hover:text-orange-800 font-semibold">Revisar IA</Link>
                  )}
                  <button onClick={() => handleDelete(page._id)} className="text-red-600 hover:text-red-800 font-semibold">Eliminar</button>
                  <button
                    onClick={() => handleRefreshProducts(page._id)}
                    className="text-green-600 hover:text-green-800 font-semibold"
                    title="Actualizar Productos (Frescura)"
                  >
                    🔄
                  </button>
                  <Link href={`/pillar/${page.slug}`} target="_blank" className="text-gray-500 hover:text-gray-700">Ver</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminPillarPages;

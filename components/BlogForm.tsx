import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface PostFormProps {
  initialData?: {
    _id?: string
    title: string
    subtitle?: string
    content: string
    slug?: string
    tags?: string[]
    coverImage?: string
    seoTitle?: string
    seoDescription?: string
    salesAngle?: string; // ¡NUEVO!
  }
  onSubmit: (data: FormData) => void
  isEditMode?: boolean
}

const BlogForm = ({
  initialData,
  onSubmit,
  isEditMode = false,
}: PostFormProps) => {
  const [title, setTitle] = useState(initialData?.title || '')
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [tags, setTags] = useState(Array.isArray(initialData?.tags) ? initialData.tags.join(', ') : (initialData?.tags || ''))
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(
    initialData?.coverImage || null,
  )
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || '')
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || '')
  const [salesAngle, setSalesAngle] = useState(initialData?.salesAngle || ''); // ¡NUEVO!

  // State for AI generation
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image'],
      ['clean'],
    ],
  }), []);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setSubtitle(initialData.subtitle || '');
      setContent(initialData.content || '');
      setSlug(initialData.slug || '');
      setTags(Array.isArray(initialData.tags) ? initialData.tags.join(', ') : (initialData.tags || ''));
      setPreview(initialData.coverImage || null);
      setSeoTitle(initialData.seoTitle || '');
      setSeoDescription(initialData.seoDescription || '');
      setSalesAngle(initialData.salesAngle || ''); // ¡NUEVO!
    }
  }, [initialData]);

  useEffect(() => {
    if (!isEditMode && title && !slug) {
      setSlug(
        title
          .toLowerCase()
          .replace(/[^a-z0-9 -]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-'),
      )
    }
  }, [title, slug, isEditMode])

  useEffect(() => {
    if (!coverImage) return
    const objectUrl = URL.createObjectURL(coverImage)
    setPreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [coverImage])

  const handleGenerate = async () => {
    if (!topic) {
      toast.error('Por favor, introduce un tema para el artículo.');
      return;
    }
    setIsGenerating(true);
    const toastId = toast.loading('Generando contenido con IA...');

    try {
      const res = await fetch('/api/admin/generate-blog-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error en la respuesta de la API');
      }

      const data = await res.json();

      // Populate fields with AI response
      setTitle(data.title || '');
      setContent(data.content || '');
      setSeoTitle(data.seoTitle || '');
      setSeoDescription(data.seoDescription || '');
      setTags(data.tags || '');

      toast.success('Contenido generado con éxito', { id: toastId });

    } catch (err: any) {
      console.error('Error generating content:', err);
      toast.error(`Error: ${err.message}`, { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptimize = async () => {
    if (!content) {
      toast.error('No hay contenido para optimizar.');
      return;
    }
    setIsOptimizing(true);
    const toastId = toast.loading('Optimizando con Especialista SEO...');

    try {
      // Extraemos la primera etiqueta como la palabra clave principal
      const targetKeyword = tags.split(',')[0].trim();

      const res = await fetch('/api/admin/blog/optimize-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          salesAngle,
          targetKeyword,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error en la respuesta de la API de optimización');
      }

      const data = await res.json();

      if (data.optimizedContent) {
        setContent(data.optimizedContent);
        toast.success('¡Contenido optimizado con éxito!', { id: toastId });
      } else {
        throw new Error('La respuesta de la API no tuvo el formato esperado.');
      }

    } catch (err: any) {
      console.error('Error optimizing content:', err);
      toast.error(`Error: ${err.message}`, { id: toastId });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('title', title)
    formData.append('subtitle', subtitle || '')
    formData.append('content', content)
    formData.append('slug', slug)
    formData.append('tags', tags)
    formData.append('seoTitle', seoTitle)
    formData.append('seoDescription', seoDescription)

    if (coverImage) {
      formData.append('coverImage', coverImage)
    }
    if (isEditMode && initialData?._id) {
      formData.append('_id', initialData._id)
    }
    onSubmit(formData)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-6 rounded-lg shadow-md"
    >
      {/* AI Generation Section */}
      <div className="p-4 border-2 border-dashed border-pink-300 rounded-lg bg-pink-50">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Asistente de Contenido IA</h3>
        <label htmlFor="topic" className="block text-sm font-medium text-gray-700">Tema del Artículo</label>
        <div className="flex items-center space-x-2 mt-1">
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ej: 5 ideas de regalos para el Día de la Madre"
            className="flex-grow border border-gray-300 rounded-md shadow-sm p-2"
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generando...' : '✨ Generar Artículo'}
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título</label>
          <input
            type="text"
            id="title"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug (URL amigable)</label>
          <input
            type="text"
            id="slug"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700">Subtítulo (Opcional)</label>
        <input
          type="text"
          id="subtitle"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
        />
      </div>

      {/* SEO Fields */}
      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
        <h4 className="font-semibold text-md">Optimización SEO</h4>
        <div>
          <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700">Título SEO</label>
          <input
            type="text"
            id="seoTitle"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700">Descripción SEO (Meta)</label>
          <textarea
            id="seoDescription"
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
      </div>

      <div>
        <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700">Imagen de Portada</label>
        <input
          type="file"
          id="coverImage"
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
          onChange={(e) => setCoverImage(e.target.files ? e.target.files[0] : null)}
          accept="image/*"
        />
        {preview && (
          <div className="mt-4"><Image src={preview} alt="Preview" width={200} height={100} className="rounded-md object-cover" /></div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">Contenido</label>
          <button
            type="button"
            onClick={handleOptimize}
            disabled={isOptimizing || !content}
            className="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 transition text-xs font-semibold disabled:opacity-50"
            title="Usar IA para añadir enlaces internos y pulir el texto"
          >
            {isOptimizing ? 'Optimizando...' : '✨ Optimizar con IA'}
          </button>
        </div>
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          modules={quillModules}
          className="bg-white"
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Etiquetas (separadas por comas)</label>
        <input
          type="text"
          id="tags"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 transition"
      >
        {isEditMode ? 'Actualizar Artículo' : 'Crear Artículo'}
      </button>
    </form>
  )
}

export default BlogForm

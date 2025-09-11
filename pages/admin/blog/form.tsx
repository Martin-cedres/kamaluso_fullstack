import { useState, useEffect } from 'react';

interface PostFormProps {
  initialData?: {
    _id?: string;
    title: string;
    subtitle?: string;
    content: string;
    slug: string;
    tags?: string[];
  };
  onSubmit: (data: any) => void;
  isEditMode?: boolean;
}

const BlogForm = ({ initialData, onSubmit, isEditMode = false }: PostFormProps) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');

  // Auto-generate slug from title if in create mode and slug is empty
  useEffect(() => {
    if (!isEditMode && title && !slug) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'));
    }
  }, [title, slug, isEditMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      title,
      subtitle: subtitle || undefined,
      content,
      slug,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) || undefined,
      ...(isEditMode && initialData?._id && { _id: initialData._id }), // Include _id for edit mode
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
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
        <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700">Subtítulo (Opcional)</label>
        <input
          type="text"
          id="subtitle"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">Contenido</label>
        <textarea
          id="content"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-64"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug (URL amigable)</label>
        <input
          type="text"
          id="slug"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
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
  );
};

export default BlogForm;

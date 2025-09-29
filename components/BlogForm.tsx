import { useState, useEffect } from 'react'
import Image from 'next/image'

interface PostFormProps {
  initialData?: {
    _id?: string
    title: string
    subtitle?: string
    content: string
    slug: string
    tags?: string[]
    coverImage?: string
  }
  onSubmit: (data: FormData) => void // Changed to FormData
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
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '')
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(
    initialData?.coverImage || null,
  )

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('title', title)
    formData.append('subtitle', subtitle || '')
    formData.append('content', content)
    formData.append('slug', slug)
    formData.append('tags', tags)
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
      className="space-y-4 bg-white p-6 rounded-lg shadow-md"
    >
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Título
        </label>
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
        <label
          htmlFor="subtitle"
          className="block text-sm font-medium text-gray-700"
        >
          Subtítulo (Opcional)
        </label>
        <input
          type="text"
          id="subtitle"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
        />
      </div>

      <div>
        <label
          htmlFor="coverImage"
          className="block text-sm font-medium text-gray-700"
        >
          Imagen de Portada
        </label>
        <input
          type="file"
          id="coverImage"
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
          onChange={(e) =>
            setCoverImage(e.target.files ? e.target.files[0] : null)
          }
          accept="image/*"
        />
        {preview && (
          <div className="mt-4">
            <Image
              src={preview}
              alt="Preview"
              width={200}
              height={100}
              className="rounded-md object-cover"
            />
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700"
        >
          Contenido
        </label>
        <textarea
          id="content"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-64"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>

      <div>
        <label
          htmlFor="slug"
          className="block text-sm font-medium text-gray-700"
        >
          Slug (URL amigable)
        </label>
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
        <label
          htmlFor="tags"
          className="block text-sm font-medium text-gray-700"
        >
          Etiquetas (separadas por comas)
        </label>
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

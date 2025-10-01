import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';

interface ICategory {
  _id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  imagen?: string;
}

export default function AdminCategorias() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({ nombre: '', slug: '', descripcion: '' });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const generateSlug = (text: string) =>
    text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');

  useEffect(() => {
    if (!editId) setForm(f => ({ ...f, slug: generateSlug(f.nombre) }));
  }, [form.nombre, editId]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categorias/listar');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error fetching categories:', e);
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (!image) {
      if (!editId) setPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(image);
  }, [image, editId]);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/api/auth/signin');
  }, [status, router]);

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (status === 'unauthenticated') return null;

  const resetForm = () => {
    setForm({ nombre: '', slug: '', descripcion: '' });
    setImage(null);
    setPreview(null);
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      if (editId) formData.append('id', editId);

      Object.keys(form).forEach((key) => formData.append(key, form[key as keyof typeof form]));
      if (image) formData.append('imagen', image);

      const url = editId ? '/api/admin/categorias/editar' : '/api/admin/categorias/crear';
      const res = await fetch(url, {
        method: editId ? 'PUT' : 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');

      toast.success(editId ? 'Categoría editada con éxito' : 'Categoría creada con éxito');
      await fetchCategories();
      resetForm();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar esta categoría? Esto podría afectar a los productos asociados.')) return;
    try {
      const res = await fetch(`/api/admin/categorias/eliminar?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error eliminando');
      toast.success('Categoría eliminada');
      await fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar');
    }
  };

  const handleEditClick = (cat: ICategory) => {
    setEditId(cat._id);
    setForm({ nombre: cat.nombre, slug: cat.slug, descripcion: cat.descripcion });
    setPreview(cat.imagen || null);
    setImage(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestión de Categorías</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="bg-pink-500 text-white px-4 py-2 rounded-lg shadow hover:bg-pink-600 transition">
          {showForm ? 'Cerrar Formulario' : 'Crear Categoría'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold">{editId ? 'Editar' : 'Nueva'} Categoría</h2>
            <div>
              <label className="block text-sm font-medium">Nombre</label>
              <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required className="w-full rounded-xl border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Slug</label>
              <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required className="w-full rounded-xl border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Descripción</label>
              <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} required className="w-full rounded-xl border px-3 py-2" rows={3}></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium">Imagen</label>
              <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} className="w-full" />
              {preview && <Image src={preview} alt="preview" width={100} height={100} className="mt-2 rounded-xl object-cover" />}
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="bg-fucsia text-white px-6 py-2 rounded-2xl shadow">{loading ? 'Guardando...' : (editId ? 'Guardar Cambios' : 'Crear')}</button>
              <button type="button" onClick={resetForm} className="bg-white border px-4 py-2 rounded-2xl">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Imagen</th>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Slug</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id} className="odd:bg-white even:bg-gray-50 border-b">
                <td className="px-4 py-3">
                  {cat.imagen && <Image src={cat.imagen} alt={cat.nombre} width={50} height={50} className="object-cover rounded-md" />}
                </td>
                <td className="px-4 py-3 font-medium">{cat.nombre}</td>
                <td className="px-4 py-3">{cat.slug}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => handleEditClick(cat)} className="px-3 py-1 rounded-xl bg-blue-600 text-white">Editar</button>
                  <button onClick={() => handleDelete(cat._id)} className="px-3 py-1 rounded-xl bg-red-600 text-white">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

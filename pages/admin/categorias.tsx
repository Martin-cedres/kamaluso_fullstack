import { useEffect, useState, useCallback } from 'react';

import Image from 'next/image';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';

interface ICategory {
  _id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  imagen?: string;
  parent?: string;
  children?: ICategory[];
}

export default function AdminCategorias() {


  const [form, setForm] = useState({ nombre: '', slug: '', descripcion: '', parent: '' });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [flatCategories, setFlatCategories] = useState<ICategory[]>([]);
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
      // The API returns a nested structure, which we keep for rendering the list
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error fetching categories:', e);
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    const flatten = (cats: ICategory[]): ICategory[] => {
      return cats.reduce<ICategory[]>((acc, cat) => {
        acc.push(cat);
        if (cat.children) {
          acc = acc.concat(flatten(cat.children));
        }
        return acc;
      }, []);
    }
    setFlatCategories(flatten(categories));
  }, [categories]);

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



  const resetForm = () => {
    setForm({ nombre: '', slug: '', descripcion: '', parent: '' });
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

      // Append all form fields except 'parent'
      for (const key in form) {
        if (key !== 'parent') {
          formData.append(key, form[key as keyof typeof form]);
        }
      }

      // Conditionally append 'parent'
      if (form.parent) {
        formData.append('parent', form.parent);
      }

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
    setForm({ nombre: cat.nombre, slug: cat.slug, descripcion: cat.descripcion, parent: cat.parent || '' });
    setPreview(cat.imagen || null);
    setImage(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const CategoryRow = ({ category, level }: { category: ICategory, level: number }) => (
    <>
      <div className="grid grid-cols-4 items-center gap-4 odd:bg-white even:bg-gray-50 border-b px-4 py-2">
        <div className="py-3">
          {category.imagen && <Image src={category.imagen} alt={category.nombre} width={50} height={50} className="object-cover rounded-md" />}
        </div>
        <div className="py-3 font-medium" style={{ paddingLeft: `${level * 2}rem` }}>
          {category.nombre}
        </div>
        <div className="py-3 text-gray-600">{category.slug}</div>
        <div className="py-3 flex gap-2">
          <button onClick={() => handleEditClick(category)} className="px-3 py-1 rounded-xl bg-blue-600 text-white">Editar</button>
          <button onClick={() => handleDelete(category._id)} className="px-3 py-1 rounded-xl bg-red-600 text-white">Eliminar</button>
        </div>
      </div>
      {category.children && category.children.map(child => (
        <CategoryRow key={child._id} category={child} level={level + 1} />
      ))}
    </>
  );

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
              <label className="block text-sm font-medium">Categoría Padre</label>
              <select
                value={form.parent}
                onChange={(e) => setForm({ ...form, parent: e.target.value })}
                className="w-full rounded-xl border px-3 py-2 bg-white"
              >
                <option value="">Ninguna (Categoría Principal)</option>
                {flatCategories.map((cat) => (
                  <option key={cat._id} value={cat._id} disabled={editId === cat._id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
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
        <div className="grid grid-cols-4 items-center gap-4 bg-gray-100 px-4 py-3 text-left text-sm font-semibold">
          <div>Imagen</div>
          <div>Nombre</div>
          <div>Slug</div>
          <div>Acciones</div>
        </div>
        <div>
          {categories.map((cat) => (
            <CategoryRow key={cat._id} category={cat} level={0} />
          ))}
        </div>
      </div>
    </AdminLayout>
  );

}

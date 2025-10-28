import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { PlusIcon, TrashIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Select from 'react-select'; // Importar Select (si se usa)
import CreatableSelect from 'react-select/creatable'; // Importar CreatableSelect correctamente

interface ICoverDesign {
  _id: string;
  code: string;
  name?: string;
  imageUrl: string;
  priceModifier?: number;
  groups?: string[];
}

export default function AdminCoverDesigns() {
  const [coverDesigns, setCoverDesigns] = useState<ICoverDesign[]>([]);
  const [form, setForm] = useState<Partial<ICoverDesign>>({
    code: '',
    name: '',
    imageUrl: '',
    priceModifier: 0,
    groups: [],
  });
  const [selectedGroups, setSelectedGroups] = useState<{ value: string; label: string }[]>([]); // Nuevo estado para react-select
  const [groupOptions, setGroupOptions] = useState<{ value: string; label: string }[]>([]); // Estado para las opciones de grupos
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchCoverDesigns = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/cover-designs/list');
      const data = await res.json();
      if (res.ok) {
        setCoverDesigns(data);
      } else {
        throw new Error(data.error || 'Error al cargar diseños de tapa');
      }
    } catch (error: any) {
      console.error('Error fetching cover designs:', error);
      toast.error(error.message || 'Error al cargar diseños de tapa');
    }
  }, []);

  const fetchGroupOptions = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/cover-designs/groups');
      const data = await res.json(); // Let TypeScript infer type, or use a union type
      if (res.ok) {
        setGroupOptions((data as string[]).map(group => ({ value: group, label: group })));
      } else {
        // Check if data is an object with an error property
        const errorMessage = (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') 
          ? data.error 
          : 'Error al cargar opciones de grupos';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error fetching group options:', error);
      toast.error(error.message || 'Error al cargar opciones de grupos');
    }
  }, []);

  useEffect(() => {
    fetchCoverDesigns();
    fetchGroupOptions(); // Cargar opciones de grupos al montar el componente
  }, [fetchCoverDesigns, fetchGroupOptions]);

  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImageUrl(reader.result as string);
      reader.readAsDataURL(imageFile);
    } else if (!form.imageUrl) {
      setPreviewImageUrl(null);
    } else {
      setPreviewImageUrl(form.imageUrl);
    }
  }, [imageFile, form.imageUrl]);

  const resetForm = () => {
    setForm({
      code: '',
      name: '',
      imageUrl: '',
      priceModifier: 0,
      groups: [],
    });
    setSelectedGroups([]); // Resetear selectedGroups
    setImageFile(null);
    setPreviewImageUrl(null);
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      if (editId) formData.append('id', editId);
      formData.append('code', form.code || '');
      formData.append('name', form.name || '');
      formData.append('priceModifier', (form.priceModifier || 0).toString());
      
      const groupsArray = selectedGroups.map(g => g.value);
      formData.append('groups', JSON.stringify(groupsArray));

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (form.imageUrl) {
        formData.append('imageUrl', form.imageUrl); // Keep existing image if no new file
      }

      const url = editId ? '/api/admin/cover-designs/edit' : '/api/admin/cover-designs/create';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar el diseño de tapa');

      toast.success(editId ? 'Diseño de tapa editado con éxito' : 'Diseño de tapa creado con éxito');
      await fetchCoverDesigns();
      resetForm();
    } catch (error: any) {
      console.error('Error submitting cover design:', error);
      toast.error(error.message || 'Error al guardar el diseño de tapa');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (design: ICoverDesign) => {
    setEditId(design._id);
    setForm(design);
    setSelectedGroups(design.groups?.map(g => ({ value: g, label: g })) || []); // Set selectedGroups
    setPreviewImageUrl(design.imageUrl);
    setImageFile(null); // Clear file input when editing existing image
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este diseño de tapa?')) return;
    try {
      const res = await fetch(`/api/admin/cover-designs/delete?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error eliminando diseño de tapa');
      toast.success('Diseño de tapa eliminado con éxito');
      await fetchCoverDesigns();
    } catch (error: any) {
      console.error('Error deleting cover design:', error);
      toast.error(error.message || 'Error al eliminar el diseño de tapa');
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Gestión de Diseños de Tapa
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra los diseños de tapa disponibles para los productos.
          </p>
        </div>
        <button
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              resetForm();
              setShowForm(true);
            }
          }}
          className="inline-flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-lg shadow hover:bg-pink-600 transition"
        >
          {showForm ? 'Cerrar Formulario' : 'Agregar Diseño de Tapa'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8 animate-fade-in-down">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold text-gray-800">
                {editId ? 'Editar Diseño de Tapa' : 'Crear Nuevo Diseño de Tapa'}
              </h2>
              <button type="button" onClick={() => resetForm()} className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                <input
                  type="text"
                  id="code"
                  value={form.code || ''}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  required
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                  placeholder="Ej: COD-001"
                />
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre (Opcional)</label>
                <input
                  type="text"
                  id="name"
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                  placeholder="Ej: Diseño Floral"
                />
              </div>
              <div>
                <label htmlFor="priceModifier" className="block text-sm font-medium text-gray-700 mb-1">Modificador de Precio</label>
                <input
                  type="number"
                  id="priceModifier"
                  value={form.priceModifier || 0}
                  onChange={(e) => setForm({ ...form, priceModifier: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                />
              </div>
              <div>
                <label htmlFor="groups" className="block text-sm font-medium text-gray-700 mb-1">Grupos</label>
                <CreatableSelect
                  isMulti
                  options={groupOptions}
                  value={selectedGroups}
                  onChange={(newValue) => setSelectedGroups(newValue as { value: string; label: string }[])}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  placeholder="Selecciona o crea grupos..."
                  noOptionsMessage={() => "No hay opciones"}
                  formatCreateLabel={(inputValue) => `Crear grupo "${inputValue}"`}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: '0.5rem', // rounded-lg
                      borderColor: '#D1D5DB', // border-gray-300
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // shadow-sm
                      minHeight: '38px',
                      '&:hover': { borderColor: '#D1D5DB' },
                      '&:focus': { borderColor: '#EC4899', boxShadow: '0 0 0 1px #EC4899' }, // focus:border-pink-500 focus:ring-pink-500
                    }),
                    multiValue: (base) => ({
                      ...base,
                      backgroundColor: '#FCE7F3', // bg-pink-100
                      color: '#DB2777', // text-pink-700
                      borderRadius: '0.25rem', // rounded-md
                    }),
                    multiValueLabel: (base) => ({
                      ...base,
                      color: '#DB2777', // text-pink-700
                    }),
                    multiValueRemove: (base) => ({
                      ...base,
                      color: '#DB2777', // text-pink-700
                      '&:hover': { backgroundColor: '#FBCFE8', color: '#9D174D' }, // hover:bg-pink-200 hover:text-pink-800
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused ? '#FCE7F3' : 'white', // focus:bg-pink-50
                      color: state.isFocused ? '#DB2777' : '#1F2937', // focus:text-pink-700
                      '&:active': { backgroundColor: '#FBCFE8' },
                    }),
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">Selecciona grupos existentes o escribe para crear nuevos.</p>
              </div>
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Imagen del Diseño</label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                />
                {previewImageUrl && (
                  <div className="mt-3">
                    <Image src={previewImageUrl} alt="Preview" width={100} height={100} className="object-cover rounded-lg" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button type="submit" disabled={loading} className="inline-flex items-center gap-2 justify-center bg-pink-600 text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg hover:bg-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Guardando...' : (editId ? 'Guardar Cambios' : 'Crear Diseño')}
              </button>
              <button type="button" onClick={() => resetForm()} className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-all">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="px-4 md:px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Diseños de Tapa Existentes</h3>
        </div>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left text-gray-700">
            <tr>
              <th className="px-4 py-3">Imagen</th>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Grupos</th>
              <th className="px-4 py-3">Modificador de Precio</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {coverDesigns.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-3 text-center text-gray-500">
                  No hay diseños de tapa cargados.
                </td>
              </tr>
            ) : (
              coverDesigns.map((design) => (
                <tr key={design._id}>
                  <td className="px-4 py-3">
                    <Image src={design.imageUrl} alt={design.name || design.code} width={50} height={50} className="object-cover rounded-lg" />
                  </td>
                  <td className="px-4 py-3 font-medium">{design.code}</td>
                  <td className="px-4 py-3">{design.name || '-'}</td>
                  <td className="px-4 py-3">{design.groups?.join(', ') || '-'}</td>
                  <td className="px-4 py-3">{design.priceModifier ? `$U ${design.priceModifier}` : '-'}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => handleEditClick(design)}
                      className="px-3 py-1 rounded-xl bg-blue-600 text-white"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(design._id)}
                      className="px-3 py-1 rounded-xl bg-red-600 text-white"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
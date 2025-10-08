import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd'
import {
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
  PencilIcon,
  LinkIcon,
  XMarkIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline'
import AdminLayout from '../../components/AdminLayout' // Importar el layout
import toast from 'react-hot-toast' // Importar toast
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

// Interfaces para los datos que vienen de la API
interface SubCategoriaData {
  nombre: string
  slug: string
}
interface CategoriaData {
  _id: string
  nombre: string
  slug: string
  children: SubCategoriaData[]
}

export default function Admin() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // --- ESTADOS --- //
  const [form, setForm] = useState<any>({
    nombre: '',
    basePrice: '',
    descripcion: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    slug: '',
    alt: '',
    status: 'activo',
    notes: '',
    destacado: false,
    claveDeGrupo: '',
    customizationGroups: [],
  })

  // Handlers para el nuevo UI de personalización
  const handleCustomizationChange = (groupIndex: number, optionIndex: number, field: string, value: string) => {
    const newGroups = [...form.customizationGroups];
    const val = field === 'priceModifier' ? parseFloat(value) || 0 : value;
    newGroups[groupIndex].options[optionIndex][field] = val;
    setForm((f: any) => ({ ...f, customizationGroups: newGroups }));
  };

  const handleGroupChange = (groupIndex: number, field: string, value: string) => {
    const newGroups = [...form.customizationGroups];
    newGroups[groupIndex][field] = value;
    setForm((f: any) => ({ ...f, customizationGroups: newGroups }));
  };

  const addCustomizationGroup = () => {
    setForm((f: any) => ({
      ...f,
      customizationGroups: [...f.customizationGroups, { name: '', type: 'radio', options: [] }],
    }));
  };

  const [dependencyState, setDependencyState] = useState<{ groupIndex: number | null; visible: boolean }>({ groupIndex: null, visible: false });

  const addPredefinedGroup = (groupType: 'Textura' | 'Elastico' | 'GaleriaDura' | 'GaleriaFlex' | 'TipoTapa' | 'Interiores') => {
    let newGroup;

    if (groupType === 'TipoTapa') {
      if (form.customizationGroups.some((g: any) => g.name === 'Tipo de Tapa')) {
        toast.error("El grupo 'Tipo de Tapa' ya existe.");
        return;
      }
      newGroup = {
        name: 'Tipo de Tapa',
        type: 'radio',
        options: [{ name: 'Tapa Dura', priceModifier: 0 }, { name: 'Tapa Flexible', priceModifier: 0 }],
      };
    } else if (groupType === 'Interiores') {
      if (form.customizationGroups.some((g: any) => g.name === 'Interiores')) {
        toast.error("El grupo 'Interiores' ya existe.");
        return;
      }
      newGroup = {
        name: 'Interiores',
        type: 'radio',
        options: [{ name: 'Interior 1', priceModifier: 0 }, { name: 'Interior 2', priceModifier: 0 }],
      };
    } else {
      const tipoTapaExists = form.customizationGroups.some((g: any) => g.name === 'Tipo de Tapa');
      if (!tipoTapaExists) {
        toast.error("Primero debes agregar un grupo llamado 'Tipo de Tapa'.");
        return;
      }

      if (groupType === 'Textura') {
        if (form.customizationGroups.some((g: any) => g.name === 'Textura de Tapa')) {
          toast.error("El grupo 'Textura de Tapa' ya existe.");
          return;
        }
        newGroup = {
          name: 'Textura de Tapa',
          type: 'radio',
          options: [{ name: 'Laminado Mate', priceModifier: 0 }, { name: 'Laminado Brillo', priceModifier: 0 }],
          dependsOn: { groupName: 'Tipo de Tapa', optionName: 'Tapa Dura' },
        };
      } else if (groupType === 'Elastico') {
        if (form.customizationGroups.some((g: any) => g.name === 'Elástico')) {
          toast.error("El grupo 'Elástico' ya existe.");
          return;
        }
        newGroup = {
          name: 'Elástico',
          type: 'radio',
          options: [{ name: 'Sí', priceModifier: 0 }, { name: 'No', priceModifier: 0 }],
          dependsOn: { groupName: 'Tipo de Tapa', optionName: 'Tapa Dura' },
        };
      } else if (groupType === 'GaleriaDura') {
        const groupName = 'Diseño de Tapa (Tapa Dura)';
        if (form.customizationGroups.some((g: any) => g.name === groupName)) {
          toast.error(`El grupo '${groupName}' ya existe.`);
          return;
        }
        newGroup = {
          name: groupName,
          type: 'radio',
          options: [],
          dependsOn: { groupName: 'Tipo de Tapa', optionName: 'Tapa Dura' },
        };
      } else if (groupType === 'GaleriaFlex') {
        const groupName = 'Diseño de Tapa (Tapa Flexible)';
        if (form.customizationGroups.some((g: any) => g.name === groupName)) {
          toast.error(`El grupo '${groupName}' ya existe.`);
          return;
        }
        newGroup = {
          name: groupName,
          type: 'radio',
          options: [],
          dependsOn: { groupName: 'Tipo de Tapa', optionName: 'Tapa Flexible' },
        };
      }
    }
    if (newGroup) {
      setForm((f: any) => ({ ...f, customizationGroups: [...f.customizationGroups, newGroup] }));
      toast.success(`Grupo '${newGroup.name}' agregado con éxito.`);
    }
  };

  const removeCustomizationGroup = (groupIndex: number) => {
    const newGroups = [...form.customizationGroups];
    newGroups.splice(groupIndex, 1);
    setForm((f: any) => ({ ...f, customizationGroups: newGroups }));
  };

  const addCustomizationOption = (groupIndex: number) => {
    const newGroups = [...form.customizationGroups];
    newGroups[groupIndex].options.push({ name: '', priceModifier: 0 });
    setForm((f: any) => ({ ...f, customizationGroups: newGroups }));
  };

  const removeCustomizationOption = (groupIndex: number, optionIndex: number) => {
    const newGroups = [...form.customizationGroups];
    newGroups[groupIndex].options.splice(optionIndex, 1);
    setForm((f: any) => ({ ...f, customizationGroups: newGroups }));
  };


  const [optionImages, setOptionImages] = useState<{ [key: string]: File | null }>({});
  const [optionImagePreviews, setOptionImagePreviews] = useState<{ [key: string]: string }>({});

  const handleOptionImageChange = (groupIndex: number, optionIndex: number, file: File | null) => {
    const key = `g${groupIndex}o${optionIndex}`;
    setOptionImages(prev => ({ ...prev, [key]: file }));

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOptionImagePreviews(prev => ({ ...prev, [key]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      setOptionImagePreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[key];
        return newPreviews;
      });
    }
  };

  const getOptionImagePreview = (groupIndex: number, optionIndex: number) => {
    const key = `g${groupIndex}o${optionIndex}`;
    if (optionImagePreviews[key]) {
      return optionImagePreviews[key];
    }
    if (form.customizationGroups?.[groupIndex]?.options?.[optionIndex]?.image) {
      return form.customizationGroups[groupIndex].options[optionIndex].image;
    }
    return null;
  };


  // Nuevos estados para categorías dinámicas
  const [allCategories, setAllCategories] = useState<CategoriaData[]>([])
  const [selectedCategoria, setSelectedCategoria] = useState('')
  const [selectedSubCategoria, setSelectedSubCategoria] = useState('')

  const [image, setImage] = useState<File | null>(null)
  const [images, setImages] = useState<File[]>([])
  const [previewsSecundarias, setPreviewsSecundarias] = useState<string[]>([])
  const [preview, setPreview] = useState<string | null>(null)
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  // --- LÓGICA --- //

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')

  useEffect(() => {
    if (!editId) setForm((f: any) => ({ ...f, slug: generateSlug(f.nombre) }))
  }, [form.nombre, editId])

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products/listar')
      const data = await res.json()
      setProductos(Array.isArray(data.products) ? data.products : [])
    } catch (e) {
      console.error('Error fetch productos:', e)
      setProductos([])
    }
  }, [])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categorias/listar')
      const data = await res.json()
      setAllCategories(Array.isArray(data) ? data : [])
      if (data.length > 0 && !selectedCategoria) {
        setSelectedCategoria(data[0].slug)
      }
    } catch (e) {
      console.error('Error fetch categorías:', e)
      setAllCategories([])
    }
  }, [selectedCategoria])

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [fetchProducts, fetchCategories])

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategorySlug = e.target.value
    setSelectedCategoria(newCategorySlug)
    setSelectedSubCategoria('')
    setForm((f: any) => ({ ...f, basePrice: '' }))
  }

  const handleSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubCategoria(e.target.value)
    setForm((f: any) => ({ ...f, basePrice: '' }))
  }

  useEffect(() => {
    if (!image) {
      if (!editId) setPreview(null)
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result as string)
    reader.readAsDataURL(image)
  }, [image, editId])

  useEffect(() => {
    if (!images || images.length === 0) {
      if (!editId) setPreviewsSecundarias([])
      return
    }
    const urls = images.map((f) => URL.createObjectURL(f))
    setPreviewsSecundarias(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [images, editId])

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/api/auth/signin')
  }, [status, router])

  if (status === 'loading')
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
        Cargando...
      </div>
    )
  if (status === 'unauthenticated') return null

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const items = Array.from(images)
    const [reordered] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reordered)
    setImages(items)
    const p = Array.from(previewsSecundarias)
    const [pReordered] = p.splice(result.source.index, 1)
    p.splice(result.destination.index, 0, pReordered)
    setPreviewsSecundarias(p)
  }

  const resetForm = () => {
    setForm({
      nombre: '',
      basePrice: '',
      descripcion: '',
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      slug: '',
      alt: '',
      status: 'activo',
      notes: '',
      destacado: false,
      claveDeGrupo: '',
      customizationGroups: [],
    })
    if (allCategories.length > 0) {
      setSelectedCategoria(allCategories[0].slug)
    } else {
      setSelectedCategoria('')
    }
    setSelectedSubCategoria('')
    setImage(null)
    setImages([])
    setPreview(null)
    setPreviewsSecundarias([])
    setOptionImages({});
    setOptionImagePreviews({});
    setEditId(null)
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setProgress(10)
    try {
      const formData = new FormData()
      if (editId) formData.append('id', editId)

      // Handle form fields, excluding complex objects
      Object.keys(form).forEach((key) => {
        if (key !== 'customizationGroups' && key !== 'categoria' && key !== 'subCategoria') {
          formData.append(key, form[key]);
        }
      });

      // Handle customizationGroups separately by stringifying it
      formData.append('customizationGroups', JSON.stringify(form.customizationGroups));

      // Append option images
      Object.keys(optionImages).forEach(key => {
        if (optionImages[key]) {
          formData.append(`optionImage_${key}`, optionImages[key] as File);
        }
      });

      formData.append('categoria', selectedCategoria);
      if (selectedSubCategoria) {
        formData.append('subCategoria', selectedSubCategoria)
      }

      if (image) formData.append('image', image)
      images.forEach((f, i) => formData.append(`images[${i}]`, f))

      setProgress(30)
      const url = editId ? '/api/products/editar' : '/api/products/crear'
      const res = await fetch(url, {
        method: editId ? 'PUT' : 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al guardar')

      setProgress(100)
      toast.success(
        editId ? 'Producto editado con éxito' : 'Producto creado con éxito',
      )
      await fetchProducts()
      resetForm()
    } catch (err: any) {
      console.error('ERROR submit:', err)
      toast.error(err.message || 'Error al guardar el producto')
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este producto?')) return
    try {
      const res = await fetch(`/api/products/eliminar?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error eliminando')
      toast.success('Producto eliminado con éxito')
      await fetchProducts()
    } catch (err: any) {
      console.error('DELETE ERROR:', err)
      toast.error(err.message || 'Error al eliminar el producto')
    }
  }

  const handleEditClick = async (id: string) => {
    try {
      const res = await fetch(`/api/products/get?id=${id}`)
      if (!res.ok) throw new Error('No se pudo obtener el producto')
      const p = await res.json()

      setEditId(String(p._id))
      setForm({
        ...p,
        basePrice: p.basePrice || p.precio || '',
        customizationGroups: p.customizationGroups || [],
        seoKeywords: Array.isArray(p.seoKeywords)
          ? p.seoKeywords.join(', ')
          : p.seoKeywords || '',
      })
      setSelectedCategoria(p.categoria || '')
      const subCatValue = Array.isArray(p.subCategoria)
        ? p.subCategoria[0]
        : p.subCategoria || ''
      setSelectedSubCategoria(subCatValue || '')
      setPreview(p.imageUrl || null)
      setPreviewsSecundarias(
        Array.isArray(p.images) ? p.images : p.images ? [p.images] : [],
      )
      setImage(null)
      setImages([])
      setOptionImages({});
      setOptionImagePreviews({});
      setShowForm(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: any) {
      console.error('EDIT CLICK ERROR:', err)
      toast.error('No se pudo cargar el producto para editar')
    }
  }

  const availableSubCategories =
    allCategories.find((c) => c.slug === selectedCategoria)?.children || []

  const getDisplayPrice = (product: any) => {
    if (product.basePrice) {
      return `$U ${product.basePrice}`
    }
    // Fallback for old products
    if (product.precioDura && product.precioFlex) {
      return `$U ${product.precioDura} (Dura) / $U ${product.precioFlex} (Flex)`
    }
    if (product.precioDura) {
      return `$U ${product.precioDura} (Dura)`
    }
    if (product.precioFlex) {
      return `$U ${product.precioFlex} (Flex)`
    }
    if (product.precio) {
      return `$U ${product.precio}`
    }
    return 'N/A'
  }

  const handleSetDependency = (groupIndex: number, dependency: { groupName: string; optionName: string } | null) => {
    const newGroups = [...form.customizationGroups];
    if (dependency) {
      newGroups[groupIndex].dependsOn = dependency;
    } else {
      delete newGroups[groupIndex].dependsOn;
    }
    setForm((f: any) => ({ ...f, customizationGroups: newGroups }));
    setDependencyState({ groupIndex: null, visible: false });
  };

  return (
    <AdminLayout>
      {dependencyState.visible && (
        <DependencyModal
          allGroups={form.customizationGroups}
          currentIndex={dependencyState.groupIndex!}
          onClose={() => setDependencyState({ groupIndex: null, visible: false })}
          onSetDependency={handleSetDependency}
          currentDependency={form.customizationGroups[dependencyState.groupIndex!]?.dependsOn}
        />
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Dashboard de Productos
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestioná los productos de Kamaluso.
          </p>
        </div>
        <button
          onClick={() => {
            if (showForm) {
              resetForm()
            } else {
              resetForm()
              setShowForm(true)
            }
          }}
          className="inline-flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-lg shadow hover:bg-pink-600 transition"
        >
          {showForm ? 'Cerrar Formulario' : 'Agregar Producto'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8 animate-fade-in-down">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold text-gray-800">
                {editId ? 'Editar Producto' : 'Crear Nuevo Producto'}
              </h2>
              <button type="button" onClick={() => resetForm()} className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Sección Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Columna Izquierda */}
              <div className="lg:col-span-2 space-y-8">
                {/* --- Información Básica --- */}
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Información Básica</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      <input type="text" value={form.nombre} onChange={(e) => setForm((f: any) => ({ ...f, nombre: e.target.value }))} required placeholder="Ej: Agenda Semanal 2026" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                      <input type="text" value={form.slug} onChange={(e) => setForm((f: any) => ({ ...f, slug: e.target.value }))} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 bg-gray-100" readOnly />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                      <ReactQuill
                        theme="snow"
                        value={form.descripcion}
                        onChange={(value) => setForm((f: any) => ({ ...f, descripcion: value }))}
                        className="bg-white"
                        modules={{
                          toolbar: [
                            [{ 'header': [1, 2, 3, false] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{'list': 'ordered'}, {'list': 'bullet'}],
                            ['link'],
                            ['clean']
                          ],
                        }}
                        placeholder="Descripción detallada del producto..."
                      />
                    </div>
                  </div>
                </div>

                  <div className="space-y-4">
                    {form.customizationGroups && form.customizationGroups.map((group: any, groupIndex: number) => (
                      <div key={groupIndex} className="p-4 border border-gray-300 rounded-lg bg-white">
                        {/* Group Header */}
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <input type="text" value={group.name} onChange={(e) => handleGroupChange(groupIndex, 'name', e.target.value)} placeholder="Nombre del Grupo (ej: Tipo de Tapa)" className="flex-grow rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" />
                          <select value={group.type} onChange={(e) => handleGroupChange(groupIndex, 'type', e.target.value)} className="rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500">
                            <option value="radio">Selección Única</option>
                            <option value="checkbox">Múltiples Opciones</option>
                          </select>
                          <button type="button" onClick={() => removeCustomizationGroup(groupIndex)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full">
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>

                        {/* Options List */}
                        <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                          {group.options.map((option: any, optionIndex: number) => (
                            <div key={optionIndex} className="flex items-center gap-2">
                              <input type="text" value={option.name} onChange={(e) => handleCustomizationChange(groupIndex, optionIndex, 'name', e.target.value)} placeholder="Nombre de la Opción" className="flex-grow rounded-md border-gray-300 text-sm" />
                              <input type="number" value={option.priceModifier} onChange={(e) => handleCustomizationChange(groupIndex, optionIndex, 'priceModifier', e.target.value)} placeholder="Precio" className="w-24 rounded-md border-gray-300 text-sm" />
                              <div className="w-10 flex-shrink-0">
                                <label title="Seleccionar imagen" className="cursor-pointer p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-full inline-flex items-center justify-center">
                                  <PhotoIcon className="h-5 w-5" />
                                  <input type="file" accept="image/*" onChange={(e) => handleOptionImageChange(groupIndex, optionIndex, e.target.files ? e.target.files[0] : null)} className="sr-only"/>
                                </label>
                              </div>
                              {getOptionImagePreview(groupIndex, optionIndex) && <Image src={getOptionImagePreview(groupIndex, optionIndex)!} alt={`preview`} width={32} height={32} className="object-cover rounded-md" />}
                              <button type="button" onClick={() => removeCustomizationOption(groupIndex, optionIndex)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full">
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          <button type="button" onClick={() => addCustomizationOption(groupIndex)} className="inline-flex items-center gap-1 text-sm font-medium text-pink-600 hover:text-pink-800">
                            <PlusIcon className="h-4 w-4" />
                            Añadir Opción
                          </button>
                        </div>

                        {/* Group Footer (Dependencies) */}
                        <div className="pt-3 mt-3 border-t border-gray-200">
                           <button type="button" onClick={() => setDependencyState({ groupIndex, visible: true })} className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-blue-700 font-medium">
                            <LinkIcon className="h-4 w-4" />
                            Definir dependencia
                          </button>
                          {group.dependsOn && (
                            <div className="text-xs text-gray-500 mt-1">
                              Depende de: <strong>{group.dependsOn.groupName} &rarr; {group.dependsOn.optionName}</strong>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Add Group Buttons */}
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Añadir Grupos Predefinidos</h4>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => addPredefinedGroup('TipoTapa')} className="inline-flex items-center gap-2 bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-all">+ Tipo de Tapa</button>
                      <button type="button" onClick={() => addPredefinedGroup('Interiores')} className="inline-flex items-center gap-2 bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-all">+ Interiores</button>
                      <button type="button" onClick={() => addPredefinedGroup('Textura')} className="inline-flex items-center gap-2 bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-all">+ Textura</button>
                      <button type="button" onClick={() => addPredefinedGroup('Elastico')} className="inline-flex items-center gap-2 bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-all">+ Elástico</button>
                      <button type="button" onClick={() => addPredefinedGroup('GaleriaDura')} className="inline-flex items-center gap-2 bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-all">+ Galería (Dura)</button>
                      <button type="button" onClick={() => addPredefinedGroup('GaleriaFlex')} className="inline-flex items-center gap-2 bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-all">+ Galería (Flex)</button>
                      <button type="button" onClick={addCustomizationGroup} className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-800 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-all">+ Grupo Personalizado</button>
                    </div>
                  </div>
              </div>

              {/* Columna Derecha */}
              <div className="space-y-8">
                {/* --- Precios y Categoría --- */}
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio Base</label>
                      <input type="number" value={form.basePrice} onChange={(e) => setForm((f: any) => ({ ...f, basePrice: e.target.value }))} placeholder="2500" required className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                      <select value={selectedCategoria} onChange={handleCategoryChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" required>
                        <option value="" disabled>Selecciona una categoría</option>
                        {allCategories.map((cat) => (
                          <option key={cat._id} value={cat.slug}>{cat.nombre}</option>
                        ))}
                      </select>
                    </div>
                    {availableSubCategories.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subcategoría</label>
                        <select value={selectedSubCategoria} onChange={handleSubCategoryChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" required>
                          <option value="" disabled>Selecciona una subcategoría</option>
                          {availableSubCategories.map((sub) => (
                            <option key={sub.slug} value={sub.slug}>{sub.nombre}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-2">
                      <input type="checkbox" checked={form.destacado} onChange={(e) => setForm((f: any) => ({ ...f, destacado: e.target.checked }))} className="h-4 w-4 rounded text-pink-600 focus:ring-pink-500" />
                      <label className="text-sm text-gray-700">Marcar como Producto Destacado</label>
                    </div>
                  </div>
                </div>

                {/* --- SEO --- */}
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">SEO</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título SEO</label>
                      <input type="text" value={form.seoTitle} onChange={(e) => setForm((f: any) => ({ ...f, seoTitle: e.target.value }))} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descripción SEO</label>
                      <textarea value={form.seoDescription} onChange={(e) => setForm((f: any) => ({ ...f, seoDescription: e.target.value }))} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" rows={3}></textarea>
                    </div>
                  </div>
                </div>

                {/* --- Imágenes --- */}
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Imágenes</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Imagen Principal</label>
                      <div className="mt-1 flex items-center">
                        <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                          <span>Seleccionar archivo</span>
                          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} className="sr-only"/>
                        </label>
                        <span className="ml-3 text-sm text-gray-500">{image ? image.name : 'Ningún archivo seleccionado'}</span>
                      </div>
                      {preview && <Image src={preview} alt="preview" width={128} height={128} className="mt-3 object-cover rounded-lg shadow-md" />}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Imágenes Secundarias</label>
                      <div className="mt-1 flex items-center">
                        <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                          <span>Seleccionar archivos</span>
                          <input type="file" accept="image/*" multiple onChange={(e) => setImages(e.target.files ? Array.from(e.target.files) : [])} className="sr-only"/>
                        </label>
                        <span className="ml-3 text-sm text-gray-500">{images.length > 0 ? `${images.length} archivos seleccionados` : 'Ningún archivo seleccionado'}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Puedes reordenar las imágenes arrastrándolas.</div>
                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="sec-images" direction="horizontal">
                          {(provided) => (
                            <div className="flex gap-3 mt-3 overflow-x-auto p-2 bg-white rounded-lg" ref={provided.innerRef} {...provided.droppableProps}>
                              {previewsSecundarias.map((url, idx) => (
                                <Draggable key={url + idx} draggableId={String(url) + idx} index={idx}>
                                  {(prov) => (
                                    <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className="w-24 h-24 rounded-lg overflow-hidden border-2 shadow-sm flex-shrink-0">
                                      <Image src={url} alt="preview secundaria" width={96} height={96} className="object-cover" />
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button type="submit" disabled={loading} className="inline-flex items-center gap-2 justify-center bg-pink-600 text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg hover:bg-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Guardando...' : (editId ? 'Guardar Cambios' : 'Crear Producto')}
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
          <h3 className="text-lg font-semibold">Productos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left text-gray-700">
              <tr>
                <th className="px-4 py-3">Imagen</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Subcategoría</th>
                <th className="px-4 py-3">Destacado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr
                  key={String(p._id)}
                  className="odd:bg-white even:bg-gray-50 border-b"
                >
                  <td className="px-4 py-3">
                    <Image
                      src={p.imageUrl}
                      alt={p.alt || p.nombre}
                      width={64}
                      height={64}
                      className="object-cover rounded-xl"
                    />
                  </td>
                  <td className="px-4 py-3">{p.nombre}</td>
                  <td className="px-4 py-3">{getDisplayPrice(p)}</td>
                  <td className="px-4 py-3">{p.status}</td>
                  <td className="px-4 py-3">{p.categoria}</td>
                  <td className="px-4 py-3">
                    {Array.isArray(p.subCategoria)
                      ? p.subCategoria.join(', ')
                      : p.subCategoria || '-'}
                  </td>
                  <td className="px-4 py-3">{p.destacado ? '✅' : '-'}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => handleEditClick(String(p._id))}
                      className="px-3 py-1 rounded-xl bg-blue-600 text-white"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(String(p._id))}
                      className="px-3 py-1 rounded-xl bg-red-600 text-white"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}

const DependencyModal = ({ allGroups, currentIndex, onClose, onSetDependency, currentDependency }: any) => {
  const [selectedGroup, setSelectedGroup] = useState(currentDependency?.groupName || '');
  const [selectedOption, setSelectedOption] = useState(currentDependency?.optionName || '');

  const availableParentGroups = allGroups.filter((_: any, index: number) => index !== currentIndex);
  const parentOptions = allGroups.find((g: any) => g.name === selectedGroup)?.options || [];

  useEffect(() => {
    if (currentDependency) {
      setSelectedGroup(currentDependency.groupName);
      setSelectedOption(currentDependency.optionName);
    }
  }, [currentDependency]);

  const handleSave = () => {
    if (selectedGroup && selectedOption) {
      onSetDependency(currentIndex, { groupName: selectedGroup, optionName: selectedOption });
    }
  };

  const handleRemove = () => {
    onSetDependency(currentIndex, null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h4 className="text-lg font-semibold mb-4">Definir Dependencia</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Grupo Padre</label>
            <select
              value={selectedGroup}
              onChange={(e) => {
                setSelectedGroup(e.target.value);
                setSelectedOption(''); // Reset option on group change
              }}
              className="w-full mt-1 p-2 border rounded-md"
            >
              <option value="">Seleccione un grupo</option>
              {availableParentGroups.map((g: any, i: number) => (
                <option key={i} value={g.name}>{g.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Opción del Padre</label>
            <select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              className="w-full mt-1 p-2 border rounded-md"
              disabled={!selectedGroup}
            >
              <option value="">Seleccione una opción</option>
              {parentOptions.map((opt: any, i: number) => (
                <option key={i} value={opt.name}>{opt.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-between">
          <div>
            <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700">
              Guardar Dependencia
            </button>
            {currentDependency && (
              <button onClick={handleRemove} className="ml-2 text-red-500 hover:text-red-700">
                Eliminar Dependencia
              </button>
            )}
          </div>
          <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

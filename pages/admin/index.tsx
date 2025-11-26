import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
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
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { ICoverDesign } from '../../models/CoverDesign'; // Import ICoverDesign

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

// Interfaces para los datos que vienen de la API
interface SubCategoriaData {
  nombre: string
  slug: string
}
interface CategoriaData {
  _id: string
  nombre: string
  slug: string
  children: CategoriaData[]
}

const SelectGroupModal = ({ availableGroups, onClose, onSelectGroup, groupType }: {
  availableGroups: string[];
  onClose: () => void;
  onSelectGroup: (groupName: string, groupType: 'GaleriaDura' | 'GaleriaFlex') => void;
  groupType: 'GaleriaDura' | 'GaleriaFlex';
}) => {
  const [selectedGroup, setSelectedGroup] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
        <h4 className="text-lg font-semibold mb-4">Seleccionar Grupo de Diseños</h4>
        <p className="text-sm text-gray-600 mb-4">
          Selecciona el grupo de diseños de tapa que quieres agregar a este producto.
        </p>
        <div className="mb-4">
          <label htmlFor="groupSelect" className="block text-sm font-medium text-gray-700">Grupos Disponibles</label>
          <select
            id="groupSelect"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full mt-1 p-2 border rounded-md focus:ring-pink-500 focus:border-pink-500"
          >
            <option value="" disabled>Selecciona un grupo</option>
            {availableGroups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300">
            Cancelar
          </button>
          <button
            onClick={() => {
              if (selectedGroup) {
                onSelectGroup(selectedGroup, groupType);
                onClose();
              } else {
                toast.error('Por favor, selecciona un grupo.');
              }
            }}
            className="bg-pink-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-pink-700"
          >
            Agregar Grupo
          </button>
        </div>
      </div>
    </div>
  );
};


const CodeGenerationModal = ({ onClose, onGenerateCodes, groupType }: {
  onClose: () => void;
  onGenerateCodes: (count: number, groupType: 'GaleriaDura' | 'GaleriaFlex') => void;
  groupType: 'GaleriaDura' | 'GaleriaFlex';
}) => {
  const [count, setCount] = useState(1);

  const handleGenerate = () => {
    if (count > 0) {
      onGenerateCodes(count, groupType);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
        <h4 className="text-lg font-semibold mb-4">Generar Códigos de Diseño de Tapa</h4>
        <p className="text-sm text-gray-600 mb-4">
          Introduce la cantidad de códigos correlativos (ej. COD-001, COD-002) que deseas generar para el grupo de tipo &quot;{groupType === 'GaleriaDura' ? 'Tapa Dura' : 'Tapa Flexible'}&quot;.
        </p>
        <div className="mb-4">
          <label htmlFor="codeCount" className="block text-sm font-medium text-gray-700">Cantidad de Códigos</label>
          <input
            type="number"
            id="codeCount"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 0)}
            min="1"
            className="w-full mt-1 p-2 border rounded-md focus:ring-pink-500 focus:border-pink-500"
          />
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300">
            Cancelar
          </button>
          <button onClick={handleGenerate} className="bg-pink-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-pink-700">
            Generar
          </button>
        </div>
      </div>
    </div>
  );
};

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

const AdminIndex = () => {
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
    tipoDeProducto: 'Interactivo',
    claveDeGrupo: '',
    customizationGroups: [],
    descripcionBreve: '',
    puntosClave: '', // Se manejará como string separado por comas en el formulario
    faqs: [],
    useCases: [],
  })

  // ... (a lot of code) ...

  // Handlers para el nuevo UI de personalización
  const handleCustomizationChange = (groupIndex: number, optionIndex: number, field: string, value: string) => {
    const newGroups = [...form.customizationGroups];
    const val = field === 'priceModifier' ? parseFloat(value) || 0 : value;
    newGroups[groupIndex].options[optionIndex][field] = val;
    setForm((f: any) => ({ ...f, customizationGroups: newGroups }));
  };

  const handleGroupChange = (groupIndex: number, field: string, value: string) => {
    const newGroups = [...form.customizationGroups];
    if (field === 'type' && value === 'text') {
      newGroups[groupIndex] = { ...newGroups[groupIndex], type: value, options: [], value: newGroups[groupIndex].value || '' };
    } else if (field === 'type' && (value === 'radio' || value === 'checkbox')) {
      newGroups[groupIndex] = { ...newGroups[groupIndex], type: value, options: newGroups[groupIndex].options || [] };
      delete newGroups[groupIndex].value;
    } else {
      newGroups[groupIndex][field] = value;
    }
    setForm((f: any) => ({ ...f, customizationGroups: newGroups }));
  };

  const addCustomizationGroup = () => {
    setForm((f: any) => ({
      ...f,
      customizationGroups: [...f.customizationGroups, { name: '', type: 'radio', options: [] }],
    }));
  };

  const [dependencyState, setDependencyState] = useState<{ groupIndex: number | null; visible: boolean }>({ groupIndex: null, visible: false });
  const [showCodeGenerationModal, setShowCodeGenerationModal] = useState(false);
  const [codeGenerationGroupType, setCodeGenerationGroupType] = useState<'GaleriaDura' | 'GaleriaFlex' | null>(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [currentGalleryType, setCurrentGalleryType] = useState<'GaleriaDura' | 'GaleriaFlex' | null>(null);

  const handleAddCoverDesignGroup = (groupName: string, groupType: 'GaleriaDura' | 'GaleriaFlex') => {
    const designsForGroup = availableCoverDesigns.filter(d => d.groups?.includes(groupName));
    const newGroupName = `Diseño de Tapa (${groupName})`;

    if (form.customizationGroups.some((g: any) => g.name === newGroupName)) {
      toast.error(`El grupo '${newGroupName}' ya existe.`);
      return;
    }

    const newGroup = {
      name: newGroupName,
      type: 'radio',
      options: designsForGroup.map(design => ({ name: design.code, priceModifier: design.priceModifier || 0, image: design.imageUrl })),
      dependsOn: { groupName: 'Tipo de Tapa', optionName: groupType === 'GaleriaDura' ? 'Tapa Dura' : 'Tapa Flexible' },
    };

    setForm((f: any) => ({ ...f, customizationGroups: [...f.customizationGroups, newGroup] }));
    toast.success(`Grupo '${newGroupName}' agregado con éxito.`);
  };

  const addPredefinedGroup = (groupType: 'Textura' | 'Elastico' | 'GaleriaDura' | 'GaleriaFlex' | 'TipoTapa' | 'Interiores' | 'Texto') => {
    if (groupType === 'GaleriaDura' || groupType === 'GaleriaFlex') {
      setCurrentGalleryType(groupType);
      setIsGroupModalOpen(true);
      return;
    }

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
    } else if (groupType === 'Texto') {
      if (form.customizationGroups.some((g: any) => g.name === 'Texto Personalizado')) {
        toast.error("El grupo 'Texto Personalizado' ya existe.");
        return;
      }
      newGroup = {
        name: 'Texto Personalizado',
        type: 'text',
        value: '', // Valor inicial para el campo de texto
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
  const [editId, setEditId] = useState<string | null>(null);
  const [availableCoverDesigns, setAvailableCoverDesigns] = useState<ICoverDesign[]>([]); // New state for cover designs
  const [isGenerating, setIsGenerating] = useState(false); // Estado para el botón de IA
  const [generationStatus, setGenerationStatus] = useState(''); // Para mensajes de carga más detallados
  const [trends, setTrends] = useState<{ trendsSummary: string; keywords: string[] } | null>(null); // ¡NUEVO ESTADO!
  const [quillKey, setQuillKey] = useState(0); // Key para forzar re-render de Quill
  const [editingProduct, setEditingProduct] = useState<any>(null); // Estado para el producto en edición
  const [seoLoading, setSeoLoading] = useState<{ [key: string]: boolean }>({});
  const [newUseCase, setNewUseCase] = useState('');


  // --- Handlers for Use Cases ---
  const addUseCase = () => {
    if (newUseCase.trim() !== '') {
      setForm((f: any) => ({ ...f, useCases: [...f.useCases, newUseCase.trim()] }));
      setNewUseCase('');
    }
  };

  const removeUseCase = (index: number) => {
    setForm((f: any) => ({
      ...f,
      useCases: f.useCases.filter((_: any, i: number) => i !== index),
    }));
  };

  // --- Handlers for FAQs ---
  const addFaq = () => {
    setForm((f: any) => ({
      ...f,
      faqs: [...f.faqs, { question: '', answer: '' }],
    }));
  };

  const removeFaq = (index: number) => {
    setForm((f: any) => ({
      ...f,
      faqs: f.faqs.filter((_: any, i: number) => i !== index),
    }));
  };

  const handleFaqChange = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaqs = [...form.faqs];
    newFaqs[index][field] = value;
    setForm((f: any) => ({ ...f, faqs: newFaqs }));
  };


  // --- LÓGICA DE REGENERACIÓN SEO CON IA --- //
  const handleRegenerateSEO = async (productId: string) => {
    setSeoLoading(prev => ({ ...prev, [productId]: true }));
    const toastId = toast.loading('Regenerando SEO con IA...', { id: productId });

    try {
      const res = await fetch('/api/admin/generate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error en la API de regeneración de SEO');
      }

      toast.success('Contenido SEO regenerado y guardado con éxito.', { id: toastId });
      // Opcional: podrías volver a cargar los productos para ver los cambios si los mostraras en la tabla
      // await fetchProducts(); 

    } catch (error: any) {
      console.error('Error regenerando contenido SEO:', error);
      toast.error(error.message || 'No se pudo regenerar el contenido.', { id: toastId });
    } finally {
      setSeoLoading(prev => ({ ...prev, [productId]: false }));
    }
  };


  useEffect(() => {
    if (editingProduct) {
      setEditId(String(editingProduct._id));
      setForm({
        nombre: editingProduct.nombre || '',
        basePrice: editingProduct.basePrice || editingProduct.precio || '',
        slug: editingProduct.slug || '',
        alt: editingProduct.alt || '',
        status: editingProduct.status || 'activo',
        notes: editingProduct.notes || '',
        destacado: editingProduct.destacado || false,
        tipoDeProducto: editingProduct.tipoDeProducto || 'Interactivo',
        claveDeGrupo: editingProduct.claveDeGrupo || '',
        seoTitle: editingProduct.seoTitle || '',
        seoDescription: editingProduct.seoDescription || '',
        descripcionBreve: editingProduct.descripcionBreve || '',
        puntosClave: Array.isArray(editingProduct.puntosClave) ? editingProduct.puntosClave.join(', ') : editingProduct.puntosClave || '',
        customizationGroups: editingProduct.customizationGroups || [],
        faqs: editingProduct.faqs || [],
        useCases: editingProduct.useCases || [],
        seoKeywords: Array.isArray(editingProduct.seoKeywords)
          ? editingProduct.seoKeywords.join(', ')
          : editingProduct.seoKeywords || '',
        descripcion: Array.isArray(editingProduct.descripcion) ? editingProduct.descripcion[0] : editingProduct.descripcion || '',
      });
      setSelectedCategoria(editingProduct.categoria || '');
      const subCatValue = Array.isArray(editingProduct.subCategoria)
        ? editingProduct.subCategoria[0]
        : editingProduct.subCategoria || '';
      setSelectedSubCategoria(subCatValue || '');
      setPreview(editingProduct.imageUrl || null);
      setPreviewsSecundarias(
        Array.isArray(editingProduct.images) ? editingProduct.images : editingProduct.images ? [editingProduct.images] : []
      );
      setImage(null);
      setImages([]);
      setOptionImages({});
      setOptionImagePreviews({});
      setShowForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [editingProduct]);



  // --- LÓGICA DE GENERACIÓN CON IA --- //
  const handleGenerateContent = async () => {
    if (!form.nombre) {
      toast.error('Por favor, introduce un nombre para el producto antes de generar contenido.');
      return;
    }

    setIsGenerating(true);
    setTrends(null); // Limpiar tendencias previas
    setGenerationStatus('Investigando tendencias...');
    try {
      const res = await fetch('/api/admin/generate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre,
          descripcion: form.descripcion,
          categoria: selectedCategoria,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || errorData.message || 'Error en la API de generación');
      }

      setGenerationStatus('Generando contenido con IA...');
      const data = await res.json();

      // La API ahora devuelve { generatedContent, trends }
      const { generatedContent, trends: apiTrends } = data;

      setForm((currentForm: any) => ({
        ...currentForm,
        seoTitle: generatedContent.seoTitle,
        seoDescription: generatedContent.seoDescription,
        seoKeywords: Array.isArray(generatedContent.seoKeywords) ? generatedContent.seoKeywords.join(', ') : generatedContent.seoKeywords || '',
        puntosClave: (() => {
          const raw = generatedContent.puntosClave;
          if (Array.isArray(raw)) return raw.join(', ');
          if (typeof raw === 'string') {
            // Intentar parsear si parece un array JSON
            if (raw.trim().startsWith('[') && raw.trim().endsWith(']')) {
              try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed.join(', ');
              } catch (e) {
                // Si falla, devolver string original
              }
            }
            return raw;
          }
          return '';
        })(),
        descripcion: generatedContent.descripcionExtensa || currentForm.descripcion,
        // --- CAMPOS ADICIONALES ACTUALIZADOS ---
        descripcionBreve: generatedContent.descripcionBreve || '',
        faqs: generatedContent.faqs || [],
        useCases: generatedContent.useCases || [],
      }));

      setTrends(apiTrends); // Guardar las tendencias en el estado
      toast.success('Contenido SEO generado con éxito.');
      setQuillKey(prevKey => prevKey + 1);

    } catch (error: any) {
      console.error('Error generando contenido con IA:', error);
      toast.error(error.message || 'No se pudo generar el contenido.');
    } finally {
      setIsGenerating(false);
      setGenerationStatus('');
    }
  };


  // --- LÓGICA --- //

  const fetchAvailableCoverDesigns = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/cover-designs/list');
      const data = await res.json();
      if (res.ok) {
        setAvailableCoverDesigns(data);
      } else {
        toast.error(data.error || 'Error al cargar diseños de tapa disponibles.');
      }
    } catch (error) {
      console.error('Error fetching available cover designs:', error);
      toast.error('Error al cargar diseños de tapa disponibles.');
    }
  }, []);

  useEffect(() => {
    fetchAvailableCoverDesigns();
  }, [fetchAvailableCoverDesigns]);

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


  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categorias/listar')
      const data = await res.json()
      setAllCategories(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Error fetch categorías:', e)
      setAllCategories([])
    }
  }, [])

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`/api/products/listar?sort=order`)
      const data = await res.json()
      setProductos(Array.isArray(data.products) ? data.products : [])
    } catch (e) {
      console.error('Error fetch productos:', e)
      setProductos([])
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

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



  const handleProductDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(productos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setProductos(items);

    // Enviar el nuevo orden al backend
    try {
      const newOrder = items.map((p, index) => ({ _id: p._id, order: index }));
      const res = await fetch('/api/admin/products/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newOrder }),
      });

      if (!res.ok) {
        throw new Error('Error al guardar el nuevo orden.');
      }
      toast.success('Orden de productos actualizada!');
    } catch (error: any) {
      console.error('Error reordenando productos:', error);
      toast.error(error.message || 'No se pudo actualizar el orden.');
      // Opcional: revertir el estado si la API falla
      // setProductos(oldItems);
    }
  };

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
      tipoDeProducto: 'Interactivo',
      claveDeGrupo: '',
      customizationGroups: [],
      descripcionBreve: '',
      puntosClave: '',
      faqs: [],
      useCases: [],
    })
    setSelectedCategoria('')
    setSelectedSubCategoria('')
    setImage(null)
    setImages([])
    setPreview(null)
    setPreviewsSecundarias([])
    setOptionImages({});
    setOptionImagePreviews({});
    setEditId(null);
    setShowForm(false);
    setEditingProduct(null); // Limpiar el producto en edición
    setTrends(null); // ¡NUEVO! Limpiar tendencias al resetear
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
        if (key === 'seoKeywords') {
          // Enviar como string directo, el backend lo espera así (separado por comas)
          const keywordsToSend = Array.isArray(form.seoKeywords)
            ? form.seoKeywords.join(',')
            : form.seoKeywords;
          formData.append('seoKeywords', keywordsToSend);
        } else if (key !== 'customizationGroups' && key !== 'categoria' && key !== 'subCategoria' && key !== 'faqs' && key !== 'useCases' && key !== 'puntosClave' && key !== 'descripcionBreve') {
          // Append regular fields (these are excluded and handled separately below)
          formData.append(key, form[key]);
        }
      })

      // Handle images OUTSIDE the loop
      if (image) formData.append('image', image)
      images.forEach((f, i) => formData.append(`images[${i}]`, f))

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

      // --- Append complex fields that were excluded from the loop ---
      if (form.descripcionBreve) {
        formData.append('descripcionBreve', form.descripcionBreve);
      }
      if (form.puntosClave) {
        const puntosArray = typeof form.puntosClave === 'string'
          ? form.puntosClave.split(',').map((p: string) => p.trim()).filter((p: string) => p)
          : form.puntosClave;
        formData.append('puntosClave', JSON.stringify(puntosArray));
      }
      if (form.faqs && form.faqs.length > 0) {
        formData.append('faqs', JSON.stringify(form.faqs));
      }
      if (form.useCases && form.useCases.length > 0) {
        formData.append('useCases', JSON.stringify(form.useCases));
      }
      if (form.customizationGroups && form.customizationGroups.length > 0) {
        formData.append('customizationGroups', JSON.stringify(form.customizationGroups));
      }
      // ------------------------------------------------------------------

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
      const res = await fetch(`/api/products/get?id=${id}&t=${Date.now()}`)
      if (!res.ok) throw new Error('No se pudo obtener el producto')
      const p = await res.json()
      setEditingProduct(p);
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
  };

  const handleGenerateCodes = (count: number, groupType: 'GaleriaDura' | 'GaleriaFlex') => {
    const groupName = groupType === 'GaleriaDura' ? 'Diseño de Tapa (Tapa Dura)' : 'Diseño de Tapa (Tapa Flexible)';
    const dependsOn = groupType === 'GaleriaDura' ? { groupName: 'Tipo de Tapa', optionName: 'Tapa Dura' } : { groupName: 'Tipo de Tapa', optionName: 'Tapa Flexible' };

    const newOptions = Array.from({ length: count }, (_, i) => ({
      name: `COD-${(i + 1).toString().padStart(3, '0')}`,
      priceModifier: 0,
    }));

    const newGroup = {
      name: groupName,
      type: 'radio',
      options: newOptions,
      dependsOn: dependsOn,
    };

    setForm((f: any) => ({ ...f, customizationGroups: [...f.customizationGroups, newGroup] }));
    toast.success(`Grupo '${groupName}' con ${count} códigos generado con éxito.`);
  };

  const availableDesignGroups = Array.from(new Set(availableCoverDesigns.flatMap(d => d.groups || [])));

  return (
    <AdminLayout>
      {isGroupModalOpen && currentGalleryType && (
        <SelectGroupModal
          availableGroups={availableDesignGroups}
          onClose={() => setIsGroupModalOpen(false)}
          onSelectGroup={handleAddCoverDesignGroup}
          groupType={currentGalleryType}
        />
      )}
      {dependencyState.visible && (
        <DependencyModal
          allGroups={form.customizationGroups}
          currentIndex={dependencyState.groupIndex!}
          onClose={() => setDependencyState({ groupIndex: null, visible: false })}
          onSetDependency={handleSetDependency}
          currentDependency={form.customizationGroups[dependencyState.groupIndex!]?.dependsOn}
        />
      )}

      {showCodeGenerationModal && codeGenerationGroupType && (
        <CodeGenerationModal
          onClose={() => setShowCodeGenerationModal(false)}
          onGenerateCodes={handleGenerateCodes}
          groupType={codeGenerationGroupType}
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
        <div className="flex items-center gap-4">
          <Link href="/admin/cover-designs" className="inline-flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-800 transition">
            Gestionar Diseños
          </Link>
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
                  {/* Tipo de Producto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Producto</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="tipoDeProducto"
                          value="Interactivo"
                          checked={form.tipoDeProducto === 'Interactivo'}
                          onChange={(e) => setForm((f: any) => ({ ...f, tipoDeProducto: e.target.value }))}
                          className="h-4 w-4 text-pink-600 focus:ring-pink-500"
                        />
                        <span className="text-sm text-gray-800">Interactivo</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="tipoDeProducto"
                          value="Estandar"
                          checked={form.tipoDeProducto === 'Estandar'}
                          onChange={(e) => setForm((f: any) => ({ ...f, tipoDeProducto: e.target.value }))}
                          className="h-4 w-4 text-pink-600 focus:ring-pink-500"
                        />
                        <span className="text-sm text-gray-800">Estándar</span>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {form.tipoDeProducto === 'Interactivo'
                        ? 'Producto con opciones personalizables (ej: agendas).'
                        : 'Producto simple con galería de imágenes (ej: taza, remera).'}
                    </p>
                  </div>
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
                        key={quillKey}
                        theme="snow"
                        value={form.descripcion}
                        onChange={(value) => setForm((f: any) => ({ ...f, descripcion: value }))}
                        className="bg-white"
                      />
                    </div>

                    {/* --- Nuevos Campos de Descripción --- */}
                    <div className="mt-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción Breve (para vistas previas)</label>
                        <textarea value={form.descripcionBreve || ''} onChange={(e) => setForm((f: any) => ({ ...f, descripcionBreve: e.target.value }))} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" rows={2} placeholder="Un resumen corto y atractivo del producto."></textarea>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Puntos Clave</label>
                        <input type="text" value={form.puntosClave || ''} onChange={(e) => setForm((f: any) => ({ ...f, puntosClave: e.target.value }))} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" placeholder="Beneficio 1, Beneficio 2, Beneficio 3" />
                        <p className="text-xs text-gray-500 mt-1">Separar por comas.</p>
                      </div>

                      {/* --- Casos de Uso --- */}
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Casos de Uso</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newUseCase}
                            onChange={(e) => setNewUseCase(e.target.value)}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                            placeholder="Ej: Ideal para regalo empresarial"
                          />
                          <button type="button" onClick={addUseCase} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600">Añadir</button>
                        </div>
                        <ul className="mt-3 space-y-2">
                          {form.useCases && form.useCases.map((useCase: string, index: number) => (
                            <li key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                              <span className="text-sm text-gray-800">{useCase}</span>
                              <button type="button" onClick={() => removeUseCase(index)} className="p-1 text-gray-500 hover:text-red-600 rounded-full">
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* --- FAQs --- */}
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Preguntas Frecuentes (FAQs)</label>
                        <div className="space-y-4">
                          {form.faqs && form.faqs.map((faq: { question: string; answer: string }, index: number) => (
                            <div key={index} className="p-3 border rounded-lg bg-gray-50 relative">
                              <button type="button" onClick={() => removeFaq(index)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 rounded-full">
                                <XMarkIcon className="h-5 w-5" />
                              </button>
                              <div className="mb-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Pregunta</label>
                                <textarea
                                  value={faq.question}
                                  onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 text-sm"
                                  rows={2}
                                  placeholder="¿De qué material es la tapa?"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Respuesta</label>
                                <textarea
                                  value={faq.answer}
                                  onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 text-sm"
                                  rows={3}
                                  placeholder="Nuestras tapas son de cartón extra duro..."
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        <button type="button" onClick={addFaq} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-pink-600 hover:text-pink-800">
                          <PlusIcon className="h-4 w-4" />
                          Añadir Pregunta
                        </button>
                      </div>
                    </div>



                  </div>
                </div>

                {/* --- Grupos de Personalización (Solo para Interactivo) --- */}
                {form.tipoDeProducto === 'Interactivo' && (
                  <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Grupos de Personalización</h3>
                    <div className="space-y-4">
                      {form.customizationGroups && form.customizationGroups.map((group: any, groupIndex: number) => (
                        <div key={groupIndex} className="p-4 border border-gray-300 rounded-lg bg-white">
                          {/* Group Header */}
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <input type="text" value={group.name} onChange={(e) => handleGroupChange(groupIndex, 'name', e.target.value)} placeholder="Nombre del Grupo (ej: Tipo de Tapa)" className="flex-grow rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" />
                            <select value={group.type} onChange={(e) => handleGroupChange(groupIndex, 'type', e.target.value)} className="rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500">
                              <option value="radio">Selección Única</option>
                              <option value="checkbox">Múltiples Opciones</option>
                              <option value="text">Campo de Texto</option>
                            </select>
                            <button type="button" onClick={() => removeCustomizationGroup(groupIndex)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full">
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>

                          {group.type === 'text' ? (
                            <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Valor por Defecto (Opcional)</label>
                              <textarea
                                value={group.value || ''}
                                onChange={(e) => handleGroupChange(groupIndex, 'value', e.target.value)}
                                placeholder="Texto por defecto o ejemplo para el cliente"
                                rows={3}
                                className="w-full rounded-md border-gray-300 text-sm"
                              />
                            </div>
                          ) : (
                            <>
                              {/* Options List */}
                              <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                                {group.options.map((option: any, optionIndex: number) => (
                                  <div key={optionIndex} className="flex items-center gap-2">
                                    <input type="text" value={option.name} onChange={(e) => handleCustomizationChange(groupIndex, optionIndex, 'name', e.target.value)} placeholder="Nombre de la Opción" className="flex-grow rounded-md border-gray-300 text-sm" />
                                    <input type="number" value={option.priceModifier} onChange={(e) => handleCustomizationChange(groupIndex, optionIndex, 'priceModifier', e.target.value)} placeholder="Precio" className="w-24 rounded-md border-gray-300 text-sm" />
                                    <div className="w-10 flex-shrink-0">
                                      <label title="Seleccionar imagen" className="cursor-pointer p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-full inline-flex items-center justify-center">
                                        <PhotoIcon className="h-5 w-5" />
                                        <input type="file" accept="image/*" onChange={(e) => handleOptionImageChange(groupIndex, optionIndex, e.target.files ? e.target.files[0] : null)} className="sr-only" />
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
                            </>
                          )}
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
                        <button type="button" onClick={() => addPredefinedGroup('Texto')} className="inline-flex items-center gap-2 bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-all">+ Texto Personalizado</button>
                        <button type="button" onClick={addCustomizationGroup} className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-800 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-all">+ Grupo Personalizado</button>
                      </div>
                    </div>
                  </div>
                )}
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
                      <select value={selectedCategoria} onChange={handleCategoryChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500">
                        <option value="" disabled>Selecciona una categoría</option>
                        {allCategories.map((cat) => (
                          <option key={cat._id} value={cat.slug}>{cat.nombre}</option>
                        ))}
                      </select>
                    </div>
                    {availableSubCategories.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subcategoría</label>
                        <select value={selectedSubCategoria} onChange={handleSubCategoryChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500">
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
                    <div className="flex items-center gap-2 pt-2">
                      <input type="checkbox" checked={form.showCoverType} onChange={(e) => setForm((f: any) => ({ ...f, showCoverType: e.target.checked }))} className="h-4 w-4 rounded text-pink-600 focus:ring-pink-500" />
                      <label className="text-sm text-gray-700">Mostrar Selector de Tipo de Tapa</label>
                    </div>

                  </div>
                </div>

                {/* --- SEO --- */}
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">SEO</h3>
                    <button
                      type="button"
                      onClick={handleGenerateContent}
                      disabled={isGenerating || !form.nombre}
                      className="inline-flex items-center gap-2 bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (generationStatus || 'Generando...') : '✨ Generar con IA'}
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título SEO</label>
                      <input type="text" value={form.seoTitle} onChange={(e) => setForm((f: any) => ({ ...f, seoTitle: e.target.value }))} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descripción SEO</label>
                      <textarea value={form.seoDescription} onChange={(e) => setForm((f: any) => ({ ...f, seoDescription: e.target.value }))} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" rows={3}></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Keywords SEO</label>
                      <input type="text" value={form.seoKeywords} onChange={(e) => setForm((f: any) => ({ ...f, seoKeywords: e.target.value }))} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" placeholder="agenda, libretas, personalizado" />
                      <p className="text-xs text-gray-500 mt-1">Separar por comas.</p>
                    </div>
                  </div>

                  {/* ¡NUEVO! Bloque para mostrar tendencias */}
                  {trends && (
                    <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg animate-fade-in">
                      <h4 className="text-md font-semibold text-purple-800 mb-2">Intel de Búsqueda Utilizada</h4>
                      <div className="text-sm text-purple-700 space-y-3">
                        <div>
                          <h5 className="font-semibold">Resumen de Tendencias:</h5>
                          <p className="whitespace-pre-wrap font-mono text-xs p-2 bg-purple-100 rounded">{trends.trendsSummary}</p>
                        </div>
                        <div>
                          <h5 className="font-semibold">Keywords Populares Encontradas:</h5>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {trends.keywords.map((kw, i) => (
                              <span key={i} className="px-2 py-1 bg-purple-200 text-purple-800 rounded-full text-xs font-medium">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
                          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} className="sr-only" />
                        </label>
                        <span className="ml-3 text-sm text-gray-500">{image ? image.name : 'Ningún archivo seleccionado'}</span>
                      </div>
                      {preview && <Image src={preview} alt="preview" width={128} height={128} className="mt-3 object-cover rounded-lg shadow-md" />}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Texto Alternativo (Alt) de Imagen Principal</label>
                      <input type="text" value={form.alt} onChange={(e) => setForm((f: any) => ({ ...f, alt: e.target.value }))} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" placeholder="Ej: Agenda Semanal 2026 con tapa dura" />
                      <p className="text-xs text-gray-500 mt-1">Descripción breve de la imagen principal para SEO y accesibilidad.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Imágenes Secundarias</label>
                      <div className="mt-1 flex items-center">
                        <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                          <span>Seleccionar archivos</span>
                          <input type="file" accept="image/*" multiple onChange={(e) => setImages(e.target.files ? Array.from(e.target.files) : [])} className="sr-only" />
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

        <DragDropContext onDragEnd={handleProductDragEnd}>

          <table className="min-w-full text-sm">

            <thead className="bg-gray-100 text-left text-gray-700">

              <tr>

                <th className="px-4 py-3"></th> {/* Handle for drag */}

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

            <Droppable droppableId="products-table-body">

              {(provided) => (

                <tbody

                  {...provided.droppableProps}

                  ref={provided.innerRef}

                  className="bg-white divide-y divide-gray-200"

                >

                  {productos.map((p, index) => (

                    <Draggable key={String(p._id)} draggableId={String(p._id)} index={index}>

                      {(provided) => (

                        <tr

                          ref={provided.innerRef}

                          {...provided.draggableProps}

                          {...provided.dragHandleProps}

                          className="odd:bg-white even:bg-gray-50 border-b"

                        >

                          <td className="px-2 py-3 cursor-grab">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6h16.5" />
                            </svg>
                          </td>

                          <td className="px-4 py-3">
                            {p.images && p.images[0] ? (
                              <Image
                                src={p.images[0]}
                                alt={p.nombre}
                                width={48}
                                height={48}
                                className="object-cover rounded-md"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 text-xs">
                                N/A
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-3 font-medium text-gray-900">{p.nombre}</td>

                          <td className="px-4 py-3 text-gray-600">{getDisplayPrice(p)}</td>

                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${p.status === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                              {p.status}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-gray-600">{p.categoria}</td>

                          <td className="px-4 py-3 text-gray-600">
                            {Array.isArray(p.subCategoria)
                              ? p.subCategoria.join(', ')
                              : p.subCategoria || '-'}
                          </td>

                          <td className="px-4 py-3 text-center">{p.destacado ? '⭐' : '-'}</td>

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

                            <button

                              onClick={() => handleRegenerateSEO(String(p._id))}

                              disabled={seoLoading[p._id]}

                              className="px-3 py-1 rounded-xl bg-purple-600 text-white disabled:bg-gray-400 text-xs"

                              title="Regenerar contenido SEO con IA"

                            >

                              {seoLoading[p._id] ? '...' : 'SEO IA'}

                            </button>

                          </td>

                        </tr>

                      )}

                    </Draggable>

                  ))}
                  {provided.placeholder}

                </tbody>

              )}

            </Droppable>

          </table>

        </DragDropContext>

      </div>
    </AdminLayout>
  )
}

export default AdminIndex;

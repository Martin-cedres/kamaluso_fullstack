import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Link from 'next/link';
import { PlusIcon, PencilIcon, TrashIcon, SparklesIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface EventPage {
    _id: string;
    title: string;
    slug: string;
    eventType: string;
    status: 'published' | 'draft';
    createdAt: string;
}

interface Product {
    _id: string;
    nombre: string;
    slug: string;
}

const EVENT_TYPES = [
    'Día de la Madre',
    'Día del Padre',
    'Día del Niño',
    'Día del Maestro',
    'Navidad',
    'Reyes',
    'San Valentín',
    'Vuelta a Clases',
    'Black Friday',
    'Cyber Monday',
    'Otro'
];

export default function EventPagesAdmin() {
    const [eventPages, setEventPages] = useState<EventPage[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [editId, setEditId] = useState<string | null>(null);

    const [form, setForm] = useState({
        title: '',
        slug: '',
        eventType: 'Día de la Madre',
        eventDate: { month: 5, day: 10 },
        content: '',
        seoTitle: '',
        seoDescription: '',
        seoKeywords: '',
        selectedProducts: [] as string[],
        status: 'draft' as 'published' | 'draft',
    });

    useEffect(() => {
        fetchEventPages();
        fetchProducts();
    }, []);

    const fetchEventPages = async () => {
        try {
            const res = await fetch('/api/admin/event-pages/list');
            if (!res.ok) throw new Error('Error al cargar');
            const data = await res.json();
            setEventPages(data);
        } catch (error) {
            toast.error('Error al cargar Event Pages');
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products/listar');
            const data = await res.json();
            setProducts(Array.isArray(data) ? data : data.products || []);
        } catch (error) {
            console.error('Error cargando productos:', error);
        }
    };

    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    useEffect(() => {
        if (form.title) {
            setForm(f => ({ ...f, slug: generateSlug(f.title) }));
        }
    }, [form.title]);

    const handleGenerateContent = async () => {
        if (form.selectedProducts.length === 0) {
            toast.error('Selecciona al menos un producto');
            return;
        }

        setGenerating(true);
        const toastId = toast.loading('Generando contenido con IA...');

        try {
            const res = await fetch('/api/admin/event-pages/generate-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventType: form.eventType,
                    selectedProducts: form.selectedProducts,
                }),
            });

            if (!res.ok) throw new Error('Error al generar');

            const data = await res.json();

            setForm(f => ({
                ...f,
                content: data.content,
                seoTitle: data.seoTitle,
                seoDescription: data.seoDescription,
                seoKeywords: data.seoKeywords,
            }));

            toast.success('Contenido generado con éxito', { id: toastId });
        } catch (error: any) {
            toast.error(error.message, { id: toastId });
        } finally {
            setGenerating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const toastId = toast.loading(editId ? 'Actualizando...' : 'Guardando...');

        try {
            const url = editId
                ? `/api/admin/event-pages/${editId}`
                : '/api/admin/event-pages/create';

            const method = editId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message);
            }

            toast.success(editId ? 'Event Page actualizada' : 'Event Page creada', { id: toastId });
            setShowForm(false);
            resetForm();
            setEditId(null);
            fetchEventPages();
        } catch (error: any) {
            toast.error(error.message, { id: toastId });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar esta Event Page?')) return;

        try {
            const res = await fetch(`/api/admin/event-pages/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Error al eliminar');
            toast.success('Event Page eliminada');
            fetchEventPages();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleEdit = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/event-pages/${id}`);
            if (!res.ok) throw new Error('Error al cargar');

            const data = await res.json();

            setForm({
                title: data.title,
                slug: data.slug,
                eventType: data.eventType,
                eventDate: data.eventDate,
                content: data.content || '',
                seoTitle: data.seoTitle || '',
                seoDescription: data.seoDescription || '',
                seoKeywords: data.seoKeywords || '',
                selectedProducts: data.selectedProducts.map((p: any) => p._id || p),
                status: data.status,
            });

            setEditId(id);
            setShowForm(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const resetForm = () => {
        setForm({
            title: '',
            slug: '',
            eventType: 'Día de la Madre',
            eventDate: { month: 5, day: 10 },
            content: '',
            seoTitle: '',
            seoDescription: '',
            seoKeywords: '',
            selectedProducts: [],
            status: 'draft',
        });
    };

    const toggleProductSelection = (productId: string) => {
        setForm(f => ({
            ...f,
            selectedProducts: f.selectedProducts.includes(productId)
                ? f.selectedProducts.filter(id => id !== productId)
                : [...f.selectedProducts, productId]
        }));
    };

    const handleGetSuggestions = async () => {
        setLoadingSuggestions(true);
        const toastId = toast.loading('Generando sugerencias con IA...');

        try {
            const res = await fetch('/api/admin/event-pages/suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!res.ok) throw new Error('Error al generar sugerencias');

            const data = await res.json();
            setSuggestions(data.suggestions);
            setShowSuggestions(true);
            toast.success('Sugerencias generadas', { id: toastId });
        } catch (error: any) {
            toast.error(error.message, { id: toastId });
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const handleApplySuggestion = (suggestion: any) => {
        setForm(f => ({
            ...f,
            title: suggestion.suggestedTitle,
            slug: suggestion.suggestedSlug,
            eventType: suggestion.eventType,
            eventDate: { month: suggestion.month, day: suggestion.day },
        }));
        setShowSuggestions(false);
        setShowForm(true);
        toast.success('Sugerencia aplicada. Ahora selecciona productos y genera contenido.');
    };

    return (
        <AdminLayout>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Event Landing Pages</h1>
                    <p className="text-sm text-gray-500 mt-1">Páginas de aterrizaje para eventos comerciales</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleGetSuggestions}
                        disabled={loadingSuggestions}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        {loadingSuggestions ? 'Generando...' : 'Sugerencias IA'}
                    </button>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Nueva Event Page
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        {editId ? 'Editar Event Page' : 'Nueva Event Page'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="w-full p-2 border rounded-lg"
                                placeholder="Regalos Personalizados para el Día de la Madre"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                            <input
                                type="text"
                                value={form.slug}
                                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                className="w-full p-2 border rounded-lg"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Evento</label>
                                <select
                                    value={form.eventType}
                                    onChange={(e) => setForm({ ...form, eventType: e.target.value })}
                                    className="w-full p-2 border rounded-lg"
                                >
                                    {EVENT_TYPES.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value as 'published' | 'draft' })}
                                    className="w-full p-2 border rounded-lg"
                                >
                                    <option value="draft">Borrador</option>
                                    <option value="published">Publicado</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Productos ({form.selectedProducts.length} seleccionados)</label>
                            <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                                {products.map(product => (
                                    <label key={product._id} className="flex items-center gap-2 py-2 hover:bg-gray-50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.selectedProducts.includes(product._id)}
                                            onChange={() => toggleProductSelection(product._id)}
                                            className="rounded"
                                        />
                                        <span className="text-sm">{product.nombre}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGenerateContent}
                            disabled={generating || form.selectedProducts.length === 0}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <SparklesIcon className="w-5 h-5" />
                            {generating ? 'Generando...' : 'Generar Contenido con IA'}
                        </button>

                        {form.content && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contenido Generado</label>
                                    <textarea
                                        value={form.content}
                                        onChange={(e) => setForm({ ...form, content: e.target.value })}
                                        className="w-full p-2 border rounded-lg font-mono text-xs"
                                        rows={10}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
                                        <input
                                            type="text"
                                            value={form.seoTitle}
                                            onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                                            className="w-full p-2 border rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">SEO Keywords</label>
                                        <input
                                            type="text"
                                            value={form.seoKeywords}
                                            onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })}
                                            className="w-full p-2 border rounded-lg"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
                                    <textarea
                                        value={form.seoDescription}
                                        onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                                        className="w-full p-2 border rounded-lg"
                                        rows={2}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold"
                                    >
                                        {editId ? 'Actualizar Event Page' : 'Guardar Event Page'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setShowForm(false); resetForm(); setEditId(null); }}
                                        className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </>
                        )}
                    </form>
                </div>
            )}

            {loading ? (
                <div className="text-center py-10">Cargando...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evento</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {eventPages.map(page => (
                                <tr key={page._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{page.title}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{page.eventType}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${page.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {page.status === 'published' ? 'Publicado' : 'Borrador'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm space-x-3">
                                        <button
                                            onClick={() => handleEdit(page._id)}
                                            className="text-purple-600 hover:text-purple-800 font-medium"
                                        >
                                            Editar
                                        </button>
                                        <Link href={`/eventos/${page.slug}`} target="_blank" className="text-blue-600 hover:text-blue-800">
                                            Ver
                                        </Link>
                                        <button onClick={() => handleDelete(page._id)} className="text-red-600 hover:text-red-800">
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Suggestions Modal */}
            {showSuggestions && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Sugerencias de Event Pages</h2>
                                <p className="text-sm text-gray-600 mt-1">Click en una sugerencia para autocompletar el formulario</p>
                            </div>
                            <button
                                onClick={() => setShowSuggestions(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {suggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleApplySuggestion(suggestion)}
                                        className="border border-gray-200 rounded-lg p-4 hover:border-purple-500 hover:shadow-lg cursor-pointer transition-all group"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-600">
                                                {suggestion.eventType}
                                            </h3>
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                {suggestion.day}/{suggestion.month}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 font-medium mb-2">
                                            {suggestion.suggestedTitle}
                                        </p>
                                        <p className="text-xs text-gray-500 mb-2">
                                            <span className="font-semibold">Slug:</span> /eventos/{suggestion.suggestedSlug}
                                        </p>
                                        <p className="text-xs text-gray-600 italic">
                                            {suggestion.reason}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/AdminLayout';
import ImageUploader from '../../api/admin/ImageUploader'; // Adjust path if needed
import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function RealResultForm() {
    const router = useRouter();
    const { id } = router.query;
    const isEditing = id && id !== 'new';

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        mockupImage: '',
        realImage: '',
        active: true,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEditing) {
            fetchResult();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchResult = async () => {
        try {
            const res = await fetch(`/api/admin/real-results/${id}`);
            if (!res.ok) throw new Error('Error al cargar datos');
            const data = await res.json();
            setFormData(data);
        } catch (error) {
            toast.error('Error al cargar el resultado');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = isEditing ? `/api/admin/real-results/${id}` : '/api/admin/real-results';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Error al guardar');

            toast.success(isEditing ? 'Actualizado correctamente' : 'Creado correctamente');
            router.push('/admin/real-results');
        } catch (error) {
            toast.error('Error al guardar los cambios');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const uploadToS3 = async (file: File) => {
        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch('/api/products/image', {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            let errorMessage = 'Error subiendo imagen';
            try {
                const errorData = await res.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch (e) {
                const text = await res.text();
                if (text) errorMessage = text;
            }
            throw new Error(errorMessage);
        }

        const data = await res.json();
        return { success: true, url: data.urls[0] };
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Link href="/admin/real-results" className="text-gray-500 hover:text-gray-700 flex items-center gap-2">
                        <ArrowLeftIcon className="w-4 h-4" />
                        Volver a la lista
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Título */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Título del Trabajo</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fucsia/20 focus:border-fucsia outline-none transition-all"
                                placeholder="Ej: Agendas Corporativas 2025 - Cliente X"
                            />
                        </div>

                        {/* Descripción */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (Opcional)</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fucsia/20 focus:border-fucsia outline-none transition-all"
                                placeholder="Detalles sobre el acabado, materiales, etc."
                            />
                        </div>

                        {/* Imágenes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Mockup */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-800 border-b pb-2">1. Expectativa (Diseño Digital)</h3>
                                <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
                                    {formData.mockupImage ? (
                                        <div className="relative aspect-square w-full mb-4 rounded-lg overflow-hidden bg-white shadow-sm">
                                            <Image src={formData.mockupImage} alt="Mockup" fill className="object-contain" />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, mockupImage: '' })}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-400">
                                            <p>Sin imagen seleccionada</p>
                                        </div>
                                    )}

                                    <ImageUploader
                                        contextName={`Mockup - ${formData.title}`}
                                        contextType="producto"
                                        uploadToS3={uploadToS3}
                                        onUploadComplete={(data) => setFormData(prev => ({ ...prev, mockupImage: data.imageUrl }))}
                                    />
                                </div>
                            </div>

                            {/* Real Photo */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-800 border-b pb-2">2. Realidad (Foto Taller)</h3>
                                <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
                                    {formData.realImage ? (
                                        <div className="relative aspect-square w-full mb-4 rounded-lg overflow-hidden bg-white shadow-sm">
                                            <Image src={formData.realImage} alt="Realidad" fill className="object-contain" />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, realImage: '' })}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-400">
                                            <p>Sin imagen seleccionada</p>
                                        </div>
                                    )}

                                    <ImageUploader
                                        contextName={`Realidad - ${formData.title}`}
                                        contextType="producto"
                                        uploadToS3={uploadToS3}
                                        onUploadComplete={(data) => setFormData(prev => ({ ...prev, realImage: data.imageUrl }))}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Estado */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="active"
                                checked={formData.active}
                                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                className="w-4 h-4 text-fucsia border-gray-300 rounded focus:ring-fucsia"
                            />
                            <label htmlFor="active" className="text-sm font-medium text-gray-700">
                                Visible en la web
                            </label>
                        </div>

                        <div className="pt-4 border-t flex justify-end gap-3">
                            <Link
                                href="/admin/real-results"
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-fucsia text-white rounded-lg hover:bg-fucsia/90 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Guardando...' : 'Guardar Resultado'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}

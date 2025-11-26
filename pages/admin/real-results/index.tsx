import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import Link from 'next/link';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface RealResult {
    _id: string;
    title: string;
    mockupImage: string;
    realImage: string;
    active: boolean;
}

export default function RealResultsIndex() {
    const [results, setResults] = useState<RealResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            const res = await fetch('/api/admin/real-results');
            if (!res.ok) throw new Error('Error al cargar resultados');
            const data = await res.json();
            setResults(data);
        } catch (error) {
            toast.error('Error al cargar los resultados');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este resultado?')) return;

        try {
            const res = await fetch(`/api/admin/real-results/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Error al eliminar');
            toast.success('Resultado eliminado');
            fetchResults();
        } catch (error) {
            toast.error('Error al eliminar el resultado');
        }
    };

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Galería de Realidad</h1>
                <Link
                    href="/admin/real-results/new"
                    className="bg-naranja hover:bg-naranja/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    Nuevo Resultado
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-10">Cargando...</div>
            ) : results.length === 0 ? (
                <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow p-8">
                    <p className="text-lg mb-2">No hay resultados publicados aún.</p>
                    <p className="text-sm">Sube tu primera comparación para mostrar la calidad de tu trabajo.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map((result) => (
                        <div key={result._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="grid grid-cols-2 h-40">
                                <div className="relative h-full border-r border-gray-100">
                                    <Image
                                        src={result.mockupImage}
                                        alt="Mockup"
                                        fill
                                        className="object-cover"
                                    />
                                    <span className="absolute bottom-0 left-0 bg-black/50 text-white text-xs px-2 py-1">Diseño</span>
                                </div>
                                <div className="relative h-full">
                                    <Image
                                        src={result.realImage}
                                        alt="Realidad"
                                        fill
                                        className="object-cover"
                                    />
                                    <span className="absolute bottom-0 right-0 bg-naranja/80 text-white text-xs px-2 py-1">Realidad</span>
                                </div>
                            </div>

                            <div className="p-4">
                                <h3 className="font-semibold text-gray-800 mb-2 truncate">{result.title}</h3>
                                <div className="flex justify-between items-center mt-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${result.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {result.active ? 'Activo' : 'Inactivo'}
                                    </span>
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/admin/real-results/${result._id}`}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                        >
                                            <PencilIcon className="w-5 h-5" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(result._id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}

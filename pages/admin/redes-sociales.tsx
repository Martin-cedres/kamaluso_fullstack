import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { SparklesIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface Product {
    _id: string;
    nombre: string;
    imagen?: string;
    imageUrl?: string;
    images?: string[];
    descripcionBreve?: string;
    precio?: number;
    basePrice?: number;
}

interface SocialPostContent {
    _id?: string;
    caption: string;
    hashtags: string[];
    imageUrl: string;
    cta?: string;
}

interface GeneratedContent {
    facebook?: SocialPostContent;
    instagram?: SocialPostContent;
}

export default function RedesSocialesPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook', 'instagram']);
    const [isGenerating, setIsGenerating] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch productos
    const fetchProducts = useCallback(async () => {
        try {
            const res = await fetch('/api/products/listar');
            const data = await res.json();
            setProducts(Array.isArray(data.products) ? data.products : []);
        } catch (error) {
            console.error('Error cargando productos:', error);
            toast.error('Error al cargar productos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Generar contenido
    const handleGenerate = async () => {
        if (!selectedProduct) {
            toast.error('Seleccioná un producto primero');
            return;
        }

        if (selectedPlatforms.length === 0) {
            toast.error('Seleccioná al menos una plataforma');
            return;
        }

        setIsGenerating(true);
        const toastId = toast.loading('Generando contenido con IA...');

        try {
            const res = await fetch('/api/admin/social/generate-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: selectedProduct._id,
                    platforms: selectedPlatforms
                })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.details || error.error || 'Error generando contenido');
            }

            const data = await res.json();
            setGeneratedContent(data.content);
            toast.success('¡Contenido generado exitosamente!', { id: toastId });

        } catch (error: any) {
            console.error('Error:', error);
            toast.error(error.message || 'Error generando contenido', { id: toastId });
        } finally {
            setIsGenerating(false);
        }
    };

    // Toggle platform selection
    const togglePlatform = (platform: string) => {
        setSelectedPlatforms(prev =>
            prev.includes(platform)
                ? prev.filter(p => p !== platform)
                : [...prev, platform]
        );
    };

    // Get main image URL
    const getMainImage = (product: Product) => {
        if (product.imagen) return product.imagen;
        if (product.images && product.images.length > 0) return product.images[0];
        if (product.imageUrl) return product.imageUrl;
        return '/placeholder.png';
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Generador de Contenido para Redes Sociales</h1>
                    <p className="mt-2 text-gray-600">Generá contenido optimizado para Facebook e Instagram automáticamente</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Panel Izquier do: Configuración */}
                    <div className="space-y-6">
                        {/* Selector de Producto */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold mb-4">1. Seleccionar Producto</h2>
                            {loading ? (
                                <p className="text-gray-500">Cargando productos...</p>
                            ) : (
                                <select
                                    value={selectedProduct?._id || ''}
                                    onChange={(e) => {
                                        const product = products.find(p => p._id === e.target.value);
                                        setSelectedProduct(product || null);
                                        setGeneratedContent(null); // Limpiar contenido anterior
                                    }}
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                                >
                                    <option value="">-- Seleccioná un producto --</option>
                                    {products.map(product => (
                                        <option key={product._id} value={product._id}>
                                            {product.nombre}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {selectedProduct && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-start space-x-4">
                                        <div className="relative w-20 h-20 flex-shrink-0">
                                            <Image
                                                src={getMainImage(selectedProduct)}
                                                alt={selectedProduct.nombre}
                                                fill
                                                className="object-cover rounded"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900">{selectedProduct.nombre}</p>
                                            <p className="text-sm text-gray-500 mt-1">${selectedProduct.precio || selectedProduct.basePrice}</p>
                                            {selectedProduct.descripcionBreve && (
                                                <p className="text-xs text-gray-600 mt-2 line-clamp-2">{selectedProduct.descripcionBreve}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Selector de Plataformas */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold mb-4">2. Seleccionar Plataformas</h2>
                            <div className="space-y-3">
                                {[
                                    { id: 'facebook', label: 'Facebook', color: 'bg-blue-600', icon: '📘' },
                                    { id: 'instagram', label: 'Instagram', color: 'bg-gradient-to-r from-purple-500 to-pink-500', icon: '📸' }
                                ].map(platform => (
                                    <button
                                        key={platform.id}
                                        onClick={() => togglePlatform(platform.id)}
                                        className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedPlatforms.includes(platform.id)
                                            ? 'border-pink-500 bg-pink-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <span className="flex items-center space-x-3">
                                            <span className="text-2xl">{platform.icon}</span>
                                            <span className="font-medium">{platform.label}</span>
                                        </span>
                                        {selectedPlatforms.includes(platform.id) && (
                                            <CheckCircleIcon className="w-6 h-6 text-pink-600" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Botón Generar */}
                        <button
                            onClick={handleGenerate}
                            disabled={!selectedProduct || selectedPlatforms.length === 0 || isGenerating}
                            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <SparklesIcon className="w-5 h-5" />
                            <span>{isGenerating ? 'Generando...' : 'Generar Contenido con IA'}</span>
                        </button>
                    </div>

                    {/* Panel Derecho: Preview */}
                    <div className="space-y-6">
                        {!generatedContent ? (
                            <div className="bg-white rounded-lg shadow p-6 h-full flex items-center justify-center">
                                <div className="text-center text-gray-400">
                                    <SparklesIcon className="w-16 h-16 mx-auto mb-4" />
                                    <p className="text-lg font-medium">Preview del contenido</p>
                                    <p className="text-sm mt-2">Seleccioná un producto y generá contenido para ver el resultado</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Facebook Preview */}
                                {generatedContent.facebook && (
                                    <div className="bg-white rounded-lg shadow overflow-hidden">
                                        <div className="bg-blue-600 text-white px-4 py-2 flex items-center space-x-2">
                                            <span className="text-lg">📘</span>
                                            <span className="font-semibold">Facebook</span>
                                        </div>
                                        <div className="p-4">
                                            {/* Imagen */}
                                            <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden">
                                                <Image
                                                    src={generatedContent.facebook.imageUrl}
                                                    alt="Preview"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            {/* Caption */}
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-sm text-gray-500 font-medium mb-1">Caption:</p>
                                                    <p className="text-gray-800 whitespace-pre-wrap">{generatedContent.facebook.caption}</p>
                                                </div>
                                                {/* Hashtags */}
                                                <div>
                                                    <p className="text-sm text-gray-500 font-medium mb-1">Hashtags:</p>
                                                    <p className="text-blue-600">{generatedContent.facebook.hashtags.join(' ')}</p>
                                                </div>
                                                {/* CTA */}
                                                {generatedContent.facebook.cta && (
                                                    <div>
                                                        <p className="text-sm text-gray-500 font-medium mb-1">Call to Action:</p>
                                                        <p className="text-pink-600 font-medium">{generatedContent.facebook.cta}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Instagram Preview */}
                                {generatedContent.instagram && (
                                    <div className="bg-white rounded-lg shadow overflow-hidden">
                                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 flex items-center space-x-2">
                                            <span className="text-lg">📸</span>
                                            <span className="font-semibold ">Instagram</span>
                                        </div>
                                        <div className="p-4">
                                            {/* Imagen */}
                                            <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden">
                                                <Image
                                                    src={generatedContent.instagram.imageUrl}
                                                    alt="Preview"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            {/* Caption */}
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-sm text-gray-500 font-medium mb-1">Caption:</p>
                                                    <p className="text-gray-800 whitespace-pre-wrap">{generatedContent.instagram.caption}</p>
                                                </div>
                                                {/* Hashtags */}
                                                <div>
                                                    <p className="text-sm text-gray-500 font-medium mb-1">Hashtags ({generatedContent.instagram.hashtags.length}):</p>
                                                    <p className="text-blue-600 text-sm">{generatedContent.instagram.hashtags.join(' ')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Botones de Acción */}
                                <div className="bg-white rounded-lg shadow p-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => toast.success('Guardado como borrador')}
                                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                                        >
                                            💾 Guardar Borrador
                                        </button>
                                        <button
                                            onClick={() => toast('Publicación disponible próximamente (necesitás configurar Meta API)')}
                                            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-medium transition-colors"
                                        >
                                            🚀 Publicar Ahora
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 text-center mt-3">
                                        💡 El contenido se guardó en la base de datos como borrador
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

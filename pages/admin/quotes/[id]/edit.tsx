import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../../components/AdminLayout';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';

export default function EditQuote() {
    const router = useRouter();
    const { id } = router.query;
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const [formData, setFormData] = useState<any>(null);
    const [uploadingImage, setUploadingImage] = useState<number | null>(null);

    useEffect(() => {
        if (id) {
            fetchQuote();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchQuote = async () => {
        try {
            const res = await fetch(`/api/admin/quotes/${id}`);
            if (res.ok) {
                const data = await res.json();
                // Calculate valid days remaining or default
                const validUntil = new Date(data.validUntil);
                const created = new Date(data.createdAt);
                const diffTime = Math.abs(validUntil.getTime() - created.getTime());
                const validDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                setFormData({ ...data, validDays });
            } else {
                toast.error('Error al cargar presupuesto');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar presupuesto');
        } finally {
            setLoading(false);
        }
    };

    const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            customer: {
                ...formData.customer,
                [e.target.name]: e.target.value,
            },
        });
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems: any = [...formData.items];

        // Validar entradas numéricas
        let processedValue = value;
        if (field === 'quantity') {
            processedValue = parseInt(value) || 0;
            if (processedValue < 0) processedValue = 0;
        } else if (field === 'unitPrice') {
            processedValue = parseFloat(value) || 0;
            if (processedValue < 0) processedValue = 0;
        }

        newItems[index] = { ...newItems[index], [field]: processedValue };

        // Recalculate subtotal
        if (field === 'quantity' || field === 'unitPrice') {
            newItems[index].subtotal = (newItems[index].quantity || 0) * (newItems[index].unitPrice || 0);
        }

        setFormData({ ...formData, items: newItems });
    };

    const fetchProductFromUrl = async (index: number, url: string) => {
        if (!url) return;

        // Mostrar indicador de carga
        toast.loading('Cargando producto...', { id: 'fetch-product' });

        try {
            // Extraer slug usando la utilidad
            const { extractProductSlugFromUrl, fetchProductData } = await import('../../../../lib/quoteHelpers');
            const slug = extractProductSlugFromUrl(url);

            if (!slug) {
                toast.error('URL de producto inválida. Usa el formato: /producto/slug', { id: 'fetch-product' });
                return;
            }

            // Obtener datos del producto
            const productData = await fetchProductData(slug);

            if (!productData) {
                toast.error('No se encontró el producto. Verifica la URL.', { id: 'fetch-product' });
                return;
            }

            // Actualizar el formulario con los datos del producto (solo nombre, precio e imagen)
            const newItems: any = [...formData.items];
            newItems[index] = {
                ...newItems[index],
                productName: productData.nombre,
                // NO cargar descripción - el usuario la define manualmente
                unitPrice: productData.precio,
                subtotal: productData.precio * newItems[index].quantity,
                imageUrl: productData.images && productData.images.length > 0 ? productData.images[0] : '',
                productLink: url
            };
            setFormData({ ...formData, items: newItems });
            toast.success(`Producto "${productData.nombre}" cargado - Precio: $U ${productData.precio}`, { id: 'fetch-product' });

        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error('Error al cargar el producto. Intenta nuevamente.', { id: 'fetch-product' });
        }
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [
                ...formData.items,
                { productName: '', productLink: '', imageUrl: '', description: '', quantity: 1, unitPrice: 0, subtotal: 0, customizations: [] }
            ]
        });
    };

    const removeItem = (index: number) => {
        const newItems = formData.items.filter((_: any, i: number) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const calculateTotals = () => {
        if (!formData) return { subtotal: 0, total: 0, discountAmount: 0 };
        const subtotal = formData.items.reduce((sum: number, item: any) => sum + item.subtotal, 0);

        // Calcular descuento según el tipo
        let discountAmount = 0;
        if (formData.discountType === 'percentage') {
            discountAmount = (subtotal * (formData.discount || 0)) / 100;
        } else {
            discountAmount = formData.discount || 0;
        }

        const total = subtotal - discountAmount + (formData.tax || 0) + (formData.shipping || 0);
        return { subtotal, total, discountAmount };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { subtotal, total } = calculateTotals();
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + formData.validDays);

        try {
            const res = await fetch(`/api/admin/quotes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    subtotal,
                    total,
                    validUntil,
                }),
            });

            if (res.ok) {
                toast.success('Presupuesto actualizado');
            } else {
                toast.error('Error al actualizar');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al actualizar');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (index: number, file: File) => {
        setUploadingImage(index);
        const uploadData = new FormData();
        uploadData.append('image', file);

        try {
            const res = await fetch('/api/admin/upload-quote-image', {
                method: 'POST',
                body: uploadData,
            });
            const data = await res.json();

            if (res.ok && data.success) {
                handleItemChange(index, 'imageUrl', data.imageUrl);
                toast.success('Imagen subida correctamente');
            } else {
                toast.error(data.message || 'Error al subir imagen');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al subir imagen');
        } finally {
            setUploadingImage(null);
        }
    };

    const handleSendEmail = async () => {
        if (!confirm('¿Estás seguro de enviar este presupuesto por email al cliente?')) return;

        setSending(true);
        try {
            const res = await fetch(`/api/admin/quotes/${id}/send`, {
                method: 'POST',
            });

            if (res.ok) {
                toast.success('Email enviado correctamente');
                setFormData({ ...formData, status: 'sent' });
            } else {
                toast.error('Error al enviar email');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al enviar email');
        } finally {
            setSending(false);
        }
    };

    if (loading || !formData) return <AdminLayout><div className="p-6">Cargando...</div></AdminLayout>;

    const totals = calculateTotals();
    const { subtotal, total, discountAmount } = totals;

    return (
        <AdminLayout>
            <div className="p-6 max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/quotes" className="text-gray-500 hover:text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Editar Presupuesto</h1>
                            <p className="text-sm text-gray-500">{formData.quoteNumber}</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => window.open(`/api/admin/quotes/${id}/preview`, '_blank')}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                            Vista Previa PDF
                        </button>
                        <button
                            type="button"
                            onClick={handleSendEmail}
                            disabled={sending}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            {sending ? 'Enviando...' : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                    Enviar por Email
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold mb-4 text-gray-700">Datos del Cliente</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.customer.name}
                                    onChange={handleCustomerChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.customer.email}
                                    onChange={handleCustomerChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.customer.phone}
                                    onChange={handleCustomerChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.customer.company}
                                    onChange={handleCustomerChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold mb-4 text-gray-700">Productos / Servicios</h2>
                        <div className="space-y-4">
                            {formData.items.map((item: any, index: number) => (
                                <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    placeholder="🔗 URL del producto de tu web (autocompleta nombre, precio e imagen)"
                                                    value={item.productLink || ''}
                                                    onChange={(e) => {
                                                        handleItemChange(index, 'productLink', e.target.value);
                                                        fetchProductFromUrl(index, e.target.value);
                                                    }}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-blue-600 mb-1"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Nombre del producto"
                                                    value={item.productName}
                                                    onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                                />
                                                <textarea
                                                    placeholder="Descripción del producto (opcional)"
                                                    value={item.description || ''}
                                                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                    rows={2}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1"
                                                />
                                            </div>
                                            <div className="w-32">
                                                <label className="block text-xs text-gray-600 mb-1">📸 Imagen</label>

                                                {/* Input file para subir imagen */}
                                                <div className="mb-1">
                                                    <label className="block">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) handleImageUpload(index, file);
                                                            }}
                                                            className="hidden"
                                                            id={`file-upload-${index}`}
                                                            disabled={uploadingImage === index}
                                                        />
                                                        <div className="cursor-pointer bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded px-2 py-1 text-xs text-center transition-colors">
                                                            {uploadingImage === index ? '⏳ Subiendo...' : '📤 Subir foto'}
                                                        </div>
                                                    </label>
                                                </div>

                                                {/* Input para pegar URL */}
                                                <input
                                                    type="text"
                                                    placeholder="URL de imagen"
                                                    value={item.imageUrl || ''}
                                                    onChange={(e) => handleItemChange(index, 'imageUrl', e.target.value)}
                                                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs mb-1"
                                                />

                                                {/* Preview */}
                                                {item.imageUrl ? (
                                                    <div className="relative">
                                                        <Image src={item.imageUrl} alt="Preview" width={64} height={64} className="h-16 w-full object-cover rounded border" unoptimized />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleItemChange(index, 'imageUrl', '')}
                                                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600"
                                                            title="Eliminar imagen"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="h-16 w-full bg-gray-100 rounded border border-dashed border-gray-300 flex items-center justify-center">
                                                        <span className="text-xs text-gray-400">Sin imagen</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-20">
                                            <input
                                                type="number"
                                                min="1"
                                                placeholder="Cant."
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-center"
                                            />
                                        </div>
                                        <div className="w-32">
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="Precio Unit."
                                                value={item.unitPrice}
                                                onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-right"
                                            />
                                        </div>
                                        <div className="w-32 pt-2 text-right font-bold text-gray-700">
                                            $U {item.subtotal.toLocaleString('es-UY')}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="text-red-500 hover:text-red-700 p-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addItem}
                                className="text-pink-500 hover:text-pink-600 font-medium flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                Agregar Producto
                            </button>
                        </div>
                    </div>

                    {/* Totals & Config */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                            <h2 className="text-lg font-semibold text-gray-700">Configuración</h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                >
                                    <option value="draft">Borrador</option>
                                    <option value="sent">Enviado</option>
                                    <option value="accepted">Aceptado</option>
                                    <option value="rejected">Rechazado</option>
                                    <option value="expired">Expirado</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Validez (días)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.validDays}
                                    onChange={(e) => setFormData({ ...formData, validDays: parseInt(e.target.value) })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notas Internas</label>
                                <textarea
                                    rows={3}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Términos y Condiciones (Adicionales)</label>
                                <textarea
                                    rows={3}
                                    value={formData.terms}
                                    onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>
                            <div className="pt-2">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={formData.hideTotal}
                                        onChange={(e) => setFormData({ ...formData, hideTotal: e.target.checked })}
                                        className="w-5 h-5 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                                    />
                                    <span className="text-sm font-semibold text-gray-700 group-hover:text-pink-600 transition-colors">
                                        🚫 Ocultar Total General (Cotización por artículo)
                                    </span>
                                </label>
                                <p className="text-xs text-gray-500 mt-1 ml-7">
                                    Útil cuando el cliente debe elegir entre varias opciones y no quieres que se sumen todas.
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-semibold mb-4 text-gray-700">Totales</h2>

                            {formData.hideTotal ? (
                                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-center">
                                    <div className="text-4xl mb-3">🏷️</div>
                                    <p className="text-gray-600 font-medium">El Total General está oculto</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Solo se mostrarán los precios individuales por artículo en el presupuesto final.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>$U {subtotal.toLocaleString('es-UY')}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Descuento</span>
                                        <div className="flex gap-2 items-center">
                                            <select
                                                value={formData.discountType || 'fixed'}
                                                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                                className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
                                            >
                                                <option value="fixed">$U</option>
                                                <option value="percentage">%</option>
                                            </select>
                                            <input
                                                type="text"
                                                placeholder="Descripción (opcional)"
                                                value={formData.discountDescription || ''}
                                                onChange={(e) => setFormData({ ...formData, discountDescription: e.target.value })}
                                                className="w-32 border border-gray-300 rounded-lg px-2 py-1 text-sm"
                                            />
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder={formData.discountType === 'percentage' ? '0.00' : '0'}
                                                value={formData.discount}
                                                onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                                                className="w-24 border border-gray-300 rounded-lg px-2 py-1 text-right"
                                            />
                                        </div>
                                    </div>
                                    {formData.discount > 0 && (
                                        <div className="flex justify-between text-sm text-gray-500 pl-4">
                                            <span>Descuento aplicado:</span>
                                            <span>- $U {discountAmount.toLocaleString('es-UY')}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">IVA / Impuestos</span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.tax || ''}
                                            onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
                                            className="w-32 border border-gray-300 rounded-lg px-2 py-1 text-right"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Envío</span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.shipping || ''}
                                            onChange={(e) => setFormData({ ...formData, shipping: parseFloat(e.target.value) || 0 })}
                                            className="w-32 border border-gray-300 rounded-lg px-2 py-1 text-right"
                                        />
                                    </div>
                                    <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-center">
                                        <span className="text-xl font-bold text-gray-800">TOTAL</span>
                                        <span className="text-xl font-bold text-pink-600">$U {total.toLocaleString('es-UY')}</span>
                                    </div>
                                </div>
                            )}

                            <div className="mt-8">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-pink-500/30 disabled:opacity-50"
                                >
                                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

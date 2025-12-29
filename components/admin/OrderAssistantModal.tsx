import { useState, useEffect } from 'react';

interface CartItem {
    _id?: string;
    nombre: string;
    quantity: number;
    precio: number;
    selections?: any;
}

interface OrderAssistantModalProps {
    onClose: () => void;
    onOrderCreated: () => void;
}

export default function OrderAssistantModal({ onClose, onOrderCreated }: OrderAssistantModalProps) {
    const [rawText, setRawText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [orderData, setOrderData] = useState<any>(null);
    const [productSearch, setProductSearch] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [webnodeUrl, setWebnodeUrl] = useState('');
    const [isImporting, setIsImporting] = useState(false);

    const handleAnalyze = async () => {
        if (!rawText.trim()) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/assistant/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: rawText }),
            });
            const data = await res.json();
            setOrderData(data);
        } catch (error) {
            console.error('Error al analizar:', error);
            alert('Error al analizar el pedido. Intente nuevamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const searchProducts = async (term: string) => {
        if (term.length < 2) {
            setSearchResults([]);
            return;
        }
        try {
            const res = await fetch(`/api/admin/assistant/search-products?q=${encodeURIComponent(term)}`);
            const data = await res.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Error buscando productos:', error);
        }
    };

    const addProduct = (p: any) => {
        const newItem: CartItem = {
            _id: p._id,
            nombre: p.nombre,
            quantity: 1,
            precio: p.precio,
        };
        setOrderData({
            ...orderData,
            items: [...(orderData.items || []), newItem],
            total: (orderData.total || 0) + p.precio
        });
        setProductSearch('');
        setSearchResults([]);
    };

    const handleImportWebnode = async () => {
        if (!webnodeUrl.trim()) return;
        setIsImporting(true);
        try {
            const res = await fetch('/api/admin/assistant/import-product', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: webnodeUrl }),
            });
            const data = await res.json();
            if (res.ok) {
                addProduct(data);
                setWebnodeUrl('');
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error importing:', error);
        } finally {
            setIsImporting(false);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/orders/crear', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...orderData,
                    paymentMethod: orderData.paymentMethod || 'manual', // Default
                }),
            });
            if (res.ok) {
                onOrderCreated();
                onClose();
            } else {
                const err = await res.json();
                alert('Error al guardar: ' + err.message);
            }
        } catch (error) {
            console.error('Error al guardar:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Asistente de Pedidos Inteligente</h2>
                        <p className="text-sm text-gray-500">Analiza WhatsApp, Emails o crea pedidos manuales</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    {!orderData ? (
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">Pega aquí el mensaje de WhatsApp o el correo:</label>
                            <textarea
                                value={rawText}
                                onChange={(e) => setRawText(e.target.value)}
                                className="w-full h-48 p-4 border rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all shadow-inner"
                                placeholder="Ej: Hola Martín, quiero una agenda de unicornio para mi hija Sofía. Haceme el envío a Av. Artigas 123, San José. Mi cel es 099123456. Pago por BROU..."
                            ></textarea>
                            <button
                                onClick={handleAnalyze}
                                disabled={isLoading || !rawText.trim()}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-bold hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                {isLoading ? <span className="animate-spin">🌀</span> : <span>✨</span>}
                                {isLoading ? 'Analizando con IA...' : 'Analizar con Inteligencia Artificial'}
                            </button>
                            <div className="text-center">
                                <button onClick={() => setOrderData({ name: '', phone: '', items: [], shippingDetails: { method: 'Retiro en Local', address: '' }, source: 'manual' })} className="text-blue-600 hover:underline text-sm font-medium">O crear pedido manual desde cero</button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg text-gray-800 border-b pb-2">Datos del Cliente</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs uppercase text-gray-500 font-bold">Nombre</label>
                                        <input type="text" value={orderData.name} onChange={e => setOrderData({ ...orderData, name: e.target.value })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs uppercase text-gray-500 font-bold">Teléfono</label>
                                            <input type="text" value={orderData.phone} onChange={e => setOrderData({ ...orderData, phone: e.target.value })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-xs uppercase text-gray-500 font-bold">Email</label>
                                            <input type="text" value={orderData.email} onChange={e => setOrderData({ ...orderData, email: e.target.value })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                    </div>
                                </div>

                                <h3 className="font-bold text-lg text-gray-800 border-b pb-2 mt-6">Envío</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs uppercase text-gray-500 font-bold">Método</label>
                                        <select value={orderData.shippingDetails?.method || 'Retiro en Local'} onChange={e => setOrderData({ ...orderData, shippingDetails: { ...(orderData.shippingDetails || {}), method: e.target.value } })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                            <option>Retiro en Local</option>
                                            <option>DAC</option>
                                            <option>Correo Uruguayo</option>
                                            <option>COTMI</option>
                                            <option>Cadetería</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase text-gray-500 font-bold">Dirección</label>
                                        <input type="text" value={orderData.shippingDetails?.address || ''} onChange={e => setOrderData({ ...orderData, shippingDetails: { ...(orderData.shippingDetails || {}), address: e.target.value } })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-lg text-gray-800 border-b pb-2">Productos</h3>
                                <div className="bg-gray-50 p-4 rounded-2xl space-y-3 max-h-64 overflow-y-auto border border-dashed border-gray-300">
                                    {orderData.items.map((item: any, idx: number) => (
                                        <div key={idx} className="bg-white p-3 rounded-xl shadow-sm border space-y-2">
                                            <div className="flex justify-between items-start">
                                                <p className="font-medium text-gray-800 flex-grow">{item.nombre}</p>
                                                <button
                                                    onClick={() => {
                                                        const newItems = [...orderData.items];
                                                        newItems.splice(idx, 1);
                                                        const newTotal = newItems.reduce((acc, it) => acc + (it.precio * it.quantity), 0);
                                                        setOrderData({ ...orderData, items: newItems, total: newTotal });
                                                    }}
                                                    className="text-red-400 hover:text-red-600 p-1"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-gray-500 font-bold">Cant:</span>
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={e => {
                                                            const newItems = [...orderData.items];
                                                            newItems[idx].quantity = parseInt(e.target.value) || 0;
                                                            const newTotal = newItems.reduce((acc, it) => acc + (it.precio * it.quantity), 0);
                                                            setOrderData({ ...orderData, items: newItems, total: newTotal });
                                                        }}
                                                        className="w-12 p-1 border rounded text-center outline-none focus:ring-1 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-1 flex-grow">
                                                    <span className="text-gray-500 font-bold">$U</span>
                                                    <input
                                                        type="number"
                                                        value={item.precio}
                                                        onChange={e => {
                                                            const newItems = [...orderData.items];
                                                            newItems[idx].precio = parseFloat(e.target.value) || 0;
                                                            const newTotal = newItems.reduce((acc, it) => acc + (it.precio * it.quantity), 0);
                                                            setOrderData({ ...orderData, items: newItems, total: newTotal });
                                                        }}
                                                        className="w-full p-1 border rounded font-bold text-blue-700 outline-none focus:ring-1 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {orderData.items.length === 0 && <p className="text-center text-gray-400 text-sm py-4">No hay productos aún.</p>}
                                </div>

                                <div className="relative">
                                    <label className="text-xs uppercase text-gray-500 font-bold mb-1 block">Buscar Producto en Catálogo</label>
                                    <input
                                        type="text"
                                        placeholder="Escribe nombre para buscar..."
                                        value={productSearch}
                                        onChange={e => {
                                            setProductSearch(e.target.value);
                                            searchProducts(e.target.value);
                                        }}
                                        className="w-full p-3 border-2 border-blue-100 rounded-xl focus:border-blue-500 outline-none transition-all pr-10"
                                    />
                                    <div className="absolute right-3 top-[34px] text-blue-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                    </div>

                                    {searchResults.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                            {searchResults.map((p, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => addProduct(p)}
                                                    className="w-full text-left p-3 hover:bg-blue-50 border-b last:border-0 flex justify-between items-center transition-colors"
                                                >
                                                    <span className="font-medium text-gray-700">{p.nombre}</span>
                                                    <span className="text-blue-600 font-bold">${p.precio}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 pt-2">
                                    <label className="text-xs uppercase text-gray-500 font-bold">O importar desde link (Webnode)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Pegar link de producto..."
                                            value={webnodeUrl}
                                            onChange={e => setWebnodeUrl(e.target.value)}
                                            className="flex-grow p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                        <button
                                            onClick={handleImportWebnode}
                                            disabled={isImporting || !webnodeUrl}
                                            className="px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded-lg hover:bg-blue-200 disabled:opacity-50 text-xs"
                                        >
                                            {isImporting ? '...' : 'Importar'}
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <div className="flex justify-between items-center text-xl font-bold text-gray-800">
                                        <span>Total estimado:</span>
                                        <span className="text-blue-700">${orderData.total || 0}</span>
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400 font-bold uppercase">Fuente:</span>
                                            <span className="px-2 py-1 bg-gray-200 rounded text-xs uppercase font-bold text-gray-600">{orderData.source || 'manual'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
                    <button onClick={onClose} className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-all">Cancelar</button>
                    {orderData && (
                        <div className="flex gap-2">
                            <button onClick={() => setOrderData(null)} className="px-6 py-2 text-blue-600 font-bold border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-all">Volver a analiazar</button>
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="px-10 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg flex items-center gap-2"
                            >
                                {isLoading && <span className="animate-spin">🌀</span>}
                                Guardar Pedido
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

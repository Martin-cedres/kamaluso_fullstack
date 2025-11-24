import React, { useState, useEffect } from 'react';
import Layout from '../../components/AdminLayout';
import { toast } from 'react-hot-toast';

export default function SettingsPage() {
    const [topBar, setTopBar] = useState({
        enabled: false,
        text: '',
        link: '',
        couponCode: '',
        backgroundColor: '#000000',
        textColor: '#ffffff'
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');

            if (!res.ok) {
                console.error('Response not OK:', res.status, res.statusText);
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            console.log('Fetched settings data:', data);

            if (data && data.topBar) {
                setTopBar(data.topBar);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error(`Error al cargar configuraciones: ${error.message || 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const saveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topBar }),
            });

            if (!res.ok) throw new Error('Failed to save');

            toast.success('Configuración guardada correctamente');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Error al guardar');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="p-8 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Gestión del Banner de Anuncios</h1>

                <form onSubmit={saveSettings} className="space-y-8">

                    {/* --- Barra de Anuncios --- */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Barra de Anuncios Superior</h2>
                                <p className="text-gray-500 text-sm mt-1">Muestra un mensaje importante en la parte superior de todas las páginas.</p>
                            </div>
                            <div className="flex items-center">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={topBar.enabled}
                                        onChange={(e) => setTopBar({ ...topBar, enabled: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                                    <span className="ml-3 text-sm font-medium text-gray-700">{topBar.enabled ? 'Activa' : 'Inactiva'}</span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje del Anuncio</label>
                                <input
                                    type="text"
                                    value={topBar.text}
                                    onChange={(e) => setTopBar({ ...topBar, text: e.target.value })}
                                    placeholder="Ej: ¡Envío GRATIS en compras mayores a $2000!"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Enlace (Opcional)</label>
                                    <input
                                        type="text"
                                        value={topBar.link}
                                        onChange={(e) => setTopBar({ ...topBar, link: e.target.value })}
                                        placeholder="/productos o https://..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Código de Cupón (Opcional)</label>
                                    <input
                                        type="text"
                                        value={topBar.couponCode}
                                        onChange={(e) => setTopBar({ ...topBar, couponCode: e.target.value })}
                                        placeholder="Ej: BIENVENIDA10"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Color de Fondo</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={topBar.backgroundColor}
                                            onChange={(e) => setTopBar({ ...topBar, backgroundColor: e.target.value })}
                                            className="h-10 w-10 rounded cursor-pointer border-0 p-0"
                                        />
                                        <input
                                            type="text"
                                            value={topBar.backgroundColor}
                                            onChange={(e) => setTopBar({ ...topBar, backgroundColor: e.target.value })}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 font-mono text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Color de Texto</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={topBar.textColor}
                                            onChange={(e) => setTopBar({ ...topBar, textColor: e.target.value })}
                                            className="h-10 w-10 rounded cursor-pointer border-0 p-0"
                                        />
                                        <input
                                            type="text"
                                            value={topBar.textColor}
                                            onChange={(e) => setTopBar({ ...topBar, textColor: e.target.value })}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 font-mono text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-bold">Vista Previa</p>
                                <div
                                    className="px-4 py-3 text-center text-sm font-medium rounded transition-all"
                                    style={{ backgroundColor: topBar.backgroundColor, color: topBar.textColor }}
                                >
                                    {topBar.text || 'Tu mensaje aquí...'}
                                    {topBar.couponCode && <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-xs tracking-wider font-mono border border-white/30">CÓDIGO: {topBar.couponCode}</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-pink-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {isSaving ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Guardando...
                                </>
                            ) : (
                                'Guardar Cambios'
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </Layout>
    );
}

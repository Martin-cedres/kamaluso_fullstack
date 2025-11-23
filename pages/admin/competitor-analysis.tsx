import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { MagnifyingGlassIcon, BoltIcon, ShieldExclamationIcon, CurrencyDollarIcon, ScaleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function CompetitorAnalysis() {
    const [url, setUrl] = useState('');
    const [myProductId, setMyProductId] = useState('');
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);

    // Cargar productos para el selector
    useEffect(() => {
        fetch('/api/products') // Asumiendo que existe una ruta pública o admin para listar productos. Si no, usaremos una específica.
            .then(res => res.json())
            .then(data => {
                // Ajustar según la estructura de respuesta de tu API de productos
                if (Array.isArray(data)) setProducts(data);
                else if (data.products) setProducts(data.products);
            })
            .catch(err => console.error("Error cargando productos:", err));
    }, []);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setAnalysis(null);
        const toastId = toast.loading(myProductId ? 'Iniciando batalla comparativa...' : 'Infiltrando base enemiga...');

        try {
            const res = await fetch('/api/admin/competitor-analysis/analyze-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, myProductId }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Error en el análisis');
            }

            setAnalysis(data.data);
            toast.success('¡Inteligencia obtenida!', { id: toastId });
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Misión fallida.', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto p-6">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
                        <span className="text-4xl">🕵️‍♂️</span> Modo Espía {myProductId && <span className="text-pink-600">+ VS</span>}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Analiza a la competencia o compárala directamente con tus productos.
                    </p>
                </div>

                {/* Input Section */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
                    <form onSubmit={handleAnalyze} className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">URL del Competidor</label>
                                <input
                                    type="url"
                                    placeholder="https://competencia.com/producto-ejemplo"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="md:w-1/3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Comparar con (Opcional)</label>
                                <select
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none bg-white"
                                    value={myProductId}
                                    onChange={(e) => setMyProductId(e.target.value)}
                                >
                                    <option value="">-- Solo Analizar --</option>
                                    {products.map(p => (
                                        <option key={p._id} value={p._id}>{p.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-lg font-bold text-white transition-all transform hover:scale-[1.01] ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-pink-600 to-purple-600 shadow-lg'
                                }`}
                        >
                            {loading ? 'Procesando Inteligencia...' : (myProductId ? '⚔️ INICIAR BATALLA COMPARATIVA' : '🕵️ ANALIZAR OBJETIVO')}
                        </button>
                    </form>
                </div>

                {/* Results Section */}
                {analysis && (
                    <div className="space-y-6 animate-fadeIn">

                        {/* COMPARISON BLOCK (Only if comparison exists) */}
                        {analysis.comparison && (
                            <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 rounded-xl shadow-xl border border-slate-700">
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-yellow-400">
                                    <ScaleIcon className="w-8 h-8" /> Veredicto: {analysis.comparison.winner === 'Kamaluso' ? '🏆 GANAMOS NOSOTROS' : '⚠️ GANA LA COMPETENCIA'}
                                </h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="font-bold text-slate-300 mb-2">Análisis del Resultado:</h3>
                                        <p className="text-lg leading-relaxed">{analysis.comparison.reason}</p>
                                    </div>
                                    <div className="bg-white/10 p-4 rounded-lg">
                                        <h3 className="font-bold text-slate-300 mb-2">Diferencia de Precio:</h3>
                                        <p className="text-xl font-mono text-green-300">{analysis.comparison.priceGap}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Counter Strategy */}
                        <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl border border-red-100 shadow-sm">
                            <h2 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
                                <BoltIcon className="w-6 h-6" /> Estrategia de Contraataque
                            </h2>
                            <div className="grid gap-4">
                                {analysis.counterStrategy.map((step: string, i: number) => (
                                    <div key={i} className="flex items-start gap-3 bg-white p-4 rounded-lg shadow-sm border border-red-100">
                                        <span className="flex-shrink-0 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold">
                                            {i + 1}
                                        </span>
                                        <p className="text-gray-800 font-medium pt-1">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Weaknesses */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <ShieldExclamationIcon className="w-5 h-5 text-orange-500" /> Debilidades Detectadas
                                </h3>
                                <ul className="space-y-2">
                                    {analysis.weaknesses.map((weakness: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-gray-600">
                                            <span className="text-red-500 mt-1">✗</span>
                                            {weakness}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Offer Details */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <CurrencyDollarIcon className="w-5 h-5 text-green-500" /> Su Oferta
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {analysis.offerDetails}
                                </p>
                            </div>
                        </div>

                        {/* Keywords */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <MagnifyingGlassIcon className="w-4 h-4" /> Keywords Objetivo
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {analysis.keywords.map((kw: string, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-600">
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

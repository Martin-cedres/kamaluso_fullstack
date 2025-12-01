import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import AdminLayout from '../../../components/AdminLayout';
import Link from 'next/link';

interface ISeoStrategy {
    _id: string;
    topic: string;
    targetKeywords: string[];
    suggestedTitle: string;
    rationale: string;
    relatedProducts: string[];
    status: 'proposed' | 'approved' | 'rejected' | 'generated';
}

export default function SeoStrategiesPage() {
    const { data: session } = useSession();
    const [strategies, setStrategies] = useState<ISeoStrategy[]>([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    const [healthCheckResults, setHealthCheckResults] = useState<any[]>([]);
    const [showHealthModal, setShowHealthModal] = useState(false);
    const [checkingHealth, setCheckingHealth] = useState(false);

    useEffect(() => {
        fetchStrategies();
    }, []);

    const fetchStrategies = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/seo/list-strategies');
            if (res.ok) {
                const data = await res.json();
                setStrategies(data);
            }
        } catch (error) {
            console.error('Error fetching strategies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateStrategies = async () => {
        setGenerating(true);
        try {
            const res = await fetch('/api/admin/seo/generate-strategies', {
                method: 'POST',
            });
            if (!res.ok) throw new Error('Error generando estrategias');
            await fetchStrategies(); // Recargar lista
        } catch (error) {
            console.error('Error:', error);
            alert('Error al generar estrategias. Revisa la consola.');
        } finally {
            setGenerating(false);
        }
    };

    const handleHealthCheck = async () => {
        setCheckingHealth(true);
        try {
            const res = await fetch('/api/admin/seo/health-check');
            if (res.ok) {
                const data = await res.json();
                setHealthCheckResults(data.issues);
                setShowHealthModal(true);
                if (data.status === 'healthy') {
                    alert('✅ Todo está saludable. No se encontraron enlaces rotos.');
                    setShowHealthModal(false);
                }
            }
        } catch (error) {
            console.error('Error checking health:', error);
            alert('Error al verificar la salud del SEO.');
        } finally {
            setCheckingHealth(false);
        }
    };

    const handleApprove = async (strategy: ISeoStrategy) => {
        // 1. Verificar Canibalización antes de nada
        try {
            const checkRes = await fetch('/api/admin/seo/check-cannibalization', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: strategy.topic }),
            });

            if (checkRes.ok) {
                const checkData = await checkRes.json();
                if (checkData.hasConflict) {
                    const confirmMessage = `⚠️ ALERTA DE CANIBALIZACIÓN SEO ⚠️\n\nSe han detectado conflictos con contenido existente:\n\n${checkData.conflicts.map((c: string) => `• ${c}`).join('\n')}\n\nCrear este contenido podría competir con el existente. ¿Estás SEGURO de que quieres proceder?`;

                    if (!confirm(confirmMessage)) {
                        return; // Cancelar operación
                    }
                } else {
                    // Si no hay conflicto, confirmación normal
                    if (!confirm(`¿Estás seguro de aprobar "${strategy.topic}"? Esto generará y publicará la página.`)) return;
                }
            }
        } catch (error) {
            console.error("Error verificando canibalización", error);
            // Si falla el check, preguntamos normal pero avisando
            if (!confirm(`No se pudo verificar la canibalización. ¿Aprobar "${strategy.topic}" de todos modos?`)) return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/admin/clusters/build-cluster', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pillarTopic: strategy.topic,
                    pillarTitle: strategy.suggestedTitle,
                    pillarSeoDescription: `Guía completa sobre ${strategy.topic}. Descubre las mejores opciones en Uruguay.`,
                    selectedPosts: [],
                    selectedProducts: strategy.relatedProducts,
                    strategyId: strategy._id
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Error al aprobar');
            }

            alert('¡Estrategia aprobada y contenido generado con éxito!');
            await fetchStrategies();
        } catch (error: any) {
            console.error('Error approving strategy:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!session) return <AdminLayout><div>Cargando...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Centro de Mando SEO</h1>
                        <p className="text-gray-600 mt-2">Generación automática de estrategias de contenido basadas en datos reales.</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={handleHealthCheck}
                            disabled={checkingHealth}
                            className="px-4 py-3 rounded-lg font-semibold text-gray-700 bg-white border border-gray-300 shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2"
                        >
                            {checkingHealth ? 'Verificando...' : '🏥 Verificar Salud'}
                        </button>
                        <button
                            onClick={handleGenerateStrategies}
                            disabled={generating}
                            className={`px-6 py-3 rounded-lg font-semibold text-white shadow-lg transition-all ${generating
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:scale-105'
                                }`}
                        >
                            {generating ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Analizando Mercado...
                                </span>
                            ) : (
                                '✨ Generar Nuevas Estrategias'
                            )}
                        </button>
                    </div>
                </div>

                {/* Health Check Modal */}
                {showHealthModal && healthCheckResults.length > 0 && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-red-50">
                                <h3 className="text-xl font-bold text-red-800 flex items-center gap-2">
                                    ⚠️ Se encontraron {healthCheckResults.length} problemas
                                </h3>
                                <button onClick={() => setShowHealthModal(false)} className="text-gray-500 hover:text-gray-700">
                                    ✕
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Página Pilar</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto Roto (Slug)</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {healthCheckResults.map((issue, idx) => (
                                            <tr key={idx}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {issue.pillarTitle}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-mono">
                                                    {issue.brokenProductSlug}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link href={`/pillar/${issue.pillarSlug}`} target="_blank" className="text-indigo-600 hover:text-indigo-900">
                                                        Ver Página
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-6 border-t border-gray-100 bg-gray-50 text-right">
                                <button
                                    onClick={() => setShowHealthModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12">Cargando estrategias...</div>
                ) : strategies.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                        <p className="text-gray-500 text-lg">No hay estrategias propuestas aún.</p>
                        <p className="text-gray-400 text-sm mt-1">Dale al botón mágico para empezar.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {strategies.map((strategy) => (
                            <div key={strategy._id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow flex flex-col">
                                <div className="p-6 flex-grow">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${strategy.status === 'generated' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {strategy.status.toUpperCase()}
                                        </span>
                                        <span className="text-xs text-gray-400">IA Suggested</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{strategy.topic}</h3>
                                    <p className="text-sm text-gray-500 mb-4 italic">&quot;{strategy.suggestedTitle}&quot;</p>

                                    <div className="mb-4">
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Por qué funcionará:</h4>
                                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            {strategy.rationale}
                                        </p>
                                    </div>

                                    <div className="mb-4">
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Keywords Objetivo:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {strategy.targetKeywords.slice(0, 5).map((kw, idx) => (
                                                <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                                    {kw}
                                                </span>
                                            ))}
                                            {strategy.targetKeywords.length > 5 && (
                                                <span className="text-xs text-gray-400 flex items-center">+{strategy.targetKeywords.length - 5} más</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-xs text-gray-500 font-medium">
                                        {strategy.relatedProducts.length} Productos vinculados
                                    </span>
                                    {strategy.status !== 'generated' && (
                                        <button
                                            onClick={() => handleApprove(strategy)}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                        >
                                            Aprobar y Crear
                                        </button>
                                    )}
                                    {strategy.status === 'generated' && (
                                        <span className="text-sm text-green-600 font-semibold flex items-center">
                                            ✓ Publicado
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

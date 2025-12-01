import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Link from 'next/link';
import {
    ChartBarIcon,
    DocumentTextIcon,
    ShoppingBagIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    BeakerIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface DashboardStats {
    seoHealth: {
        brokenLinks: number;
        status: 'healthy' | 'warning';
    };
    content: {
        pillarPages: {
            published: number;
            pending: number;
            total: number;
        };
        blogPosts: number;
        strategies: {
            approved: number;
            generated: number;
            total: number;
        };
    };
    products: {
        active: number;
        highlighted: number;
        total: number;
    };
    coverDesigns: {
        groups: number;
        total: number;
    };
}

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/dashboard/stats');
            if (!res.ok) throw new Error('Error al cargar estadísticas');
            const data = await res.json();
            setStats(data);
        } catch (error) {
            toast.error('Error al cargar el dashboard');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-gray-500 text-lg">Cargando dashboard...</div>
                </div>
            </AdminLayout>
        );
    }

    if (!stats) {
        return (
            <AdminLayout>
                <div className="text-center text-red-600">Error al cargar estadísticas</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Command Center</h1>
                    <p className="text-gray-600 mt-1">Visión general de tu sistema</p>
                </div>

                {/* SEO Health Alert */}
                {stats.seoHealth.status === 'warning' && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                        <div className="flex items-start">
                            <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-red-800 font-semibold">Alertas de Salud SEO</h3>
                                <p className="text-red-700 text-sm mt-1">
                                    Se detectaron {stats.seoHealth.brokenLinks} enlaces rotos a productos.
                                </p>
                                <Link href="/admin/seo/strategies" className="text-red-800 underline text-sm font-medium mt-2 inline-block">
                                    Ir a verificar →
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* SEO Health */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg ${stats.seoHealth.status === 'healthy' ? 'bg-green-100' : 'bg-red-100'}`}>
                                <ShieldCheckIcon className={`w-6 h-6 ${stats.seoHealth.status === 'healthy' ? 'text-green-600' : 'text-red-600'}`} />
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stats.seoHealth.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {stats.seoHealth.status === 'healthy' ? 'Sano' : 'Atención'}
                            </span>
                        </div>
                        <h3 className="text-gray-600 text-sm font-medium">Salud SEO</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                            {stats.seoHealth.brokenLinks === 0 ? '✓' : stats.seoHealth.brokenLinks}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {stats.seoHealth.status === 'healthy' ? 'Sin problemas' : 'Links rotos'}
                        </p>
                    </div>

                    {/* Pillar Pages */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-lg bg-purple-100">
                                <DocumentTextIcon className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <h3 className="text-gray-600 text-sm font-medium">Pillar Pages</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.content.pillarPages.published}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {stats.content.pillarPages.pending > 0 && `${stats.content.pillarPages.pending} pendientes`}
                        </p>
                    </div>

                    {/* Blog Posts */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-lg bg-blue-100">
                                <ChartBarIcon className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <h3 className="text-gray-600 text-sm font-medium">Artículos Blog</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.content.blogPosts}</p>
                        <p className="text-xs text-gray-500 mt-1">Total publicados</p>
                    </div>

                    {/* Products */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-lg bg-orange-100">
                                <ShoppingBagIcon className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                        <h3 className="text-gray-600 text-sm font-medium">Productos</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.products.active}</p>
                        <p className="text-xs text-gray-500 mt-1">{stats.products.highlighted} destacados</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <Link href="/admin/seo/strategies" className="group">
                            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]">
                                <PlusIcon className="w-8 h-8 mb-3" />
                                <h3 className="font-bold text-lg">Nueva Estrategia</h3>
                                <p className="text-sm text-purple-100 mt-1">Generar contenido SEO</p>
                            </div>
                        </Link>

                        <Link href="/admin/event-pages" className="group">
                            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]">
                                <PlusIcon className="w-8 h-8 mb-3" />
                                <h3 className="font-bold text-lg">Event Page</h3>
                                <p className="text-sm text-green-100 mt-1">Páginas estacionales</p>
                            </div>
                        </Link>

                        <Link href="/admin/seo/strategies" className="group">
                            <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]">
                                <ShieldCheckIcon className="w-8 h-8 mb-3" />
                                <h3 className="font-bold text-lg">Verificar Salud</h3>
                                <p className="text-sm text-red-100 mt-1">Detectar links rotos</p>
                            </div>
                        </Link>

                        <Link href="/admin/pillar-pages" className="group">
                            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]">
                                <ArrowPathIcon className="w-8 h-8 mb-3" />
                                <h3 className="font-bold text-lg">Refrescar Productos</h3>
                                <p className="text-sm text-blue-100 mt-1">Actualizar contenido</p>
                            </div>
                        </Link>

                        <Link href="/admin/competitor-analysis" className="group">
                            <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]">
                                <MagnifyingGlassIcon className="w-8 h-8 mb-3" />
                                <h3 className="font-bold text-lg">Modo Espía</h3>
                                <p className="text-sm text-slate-300 mt-1">Análisis competencia</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-sm font-medium text-gray-600 mb-3">Estrategias SEO</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Aprobadas</span>
                                <span className="text-sm font-semibold text-gray-900">{stats.content.strategies.approved}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Generadas</span>
                                <span className="text-sm font-semibold text-gray-900">{stats.content.strategies.generated}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                                <span className="text-sm font-medium text-gray-700">Total</span>
                                <span className="text-sm font-bold text-gray-900">{stats.content.strategies.total}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-sm font-medium text-gray-600 mb-3">Catálogo</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Activos</span>
                                <span className="text-sm font-semibold text-gray-900">{stats.products.active}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Destacados</span>
                                <span className="text-sm font-semibold text-gray-900">{stats.products.highlighted}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                                <span className="text-sm font-medium text-gray-700">Total</span>
                                <span className="text-sm font-bold text-gray-900">{stats.products.total}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-sm font-medium text-gray-600 mb-3">Diseños de Tapa</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Grupos</span>
                                <span className="text-sm font-semibold text-gray-900">{stats.coverDesigns.groups}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Diseños</span>
                                <span className="text-sm font-semibold text-gray-900">{stats.coverDesigns.total}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

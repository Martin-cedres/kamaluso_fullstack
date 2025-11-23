import { useState } from 'react';
import Link from 'next/link';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';

// --- Tipos de Datos (Interfaces) ---
interface ClusterStrategy {
  id: number;
  pillarTitle: string;
  pillarSeoDescription: string;
  clusterPosts: { title: string; id: string; }[];
  clusterProducts: { nombre: string; id: string; }[];
  missingContent: string[];
  originalIds: {
    posts: string[];
    products: string[];
  };
}

const ClusterFactory = () => {
  // --- Estados ---
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [strategies, setStrategies] = useState<ClusterStrategy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBuilding, setIsBuilding] = useState<number | null>(null);

  // --- Handlers ---
  const handleGenerateStrategies = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !description) {
      toast.error('Por favor, introduce un tema y una descripción.');
      return;
    }
    setIsLoading(true);
    setStrategies([]);
    const toastId = toast.loading('🧠 IA analizando contenido y generando estrategias...');

    try {
      const res = await fetch('/api/admin/clusters/generate-strategies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, description }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Falló la generación de estrategias');
      }

      const data = await res.json();
      setStrategies(data.strategies);
      toast.success('¡Estrategias de cluster generadas!', { id: toastId });

    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuildCluster = async (strategy: ClusterStrategy) => {
    setIsBuilding(strategy.id);
    const toastId = toast.loading(`✍️ IA escribiendo la Página Pilar...`);

    try {
      const payload = {
        pillarTopic: topic, // Estado del componente
        pillarTitle: strategy.pillarTitle,
        pillarSeoDescription: strategy.pillarSeoDescription,
        selectedPosts: strategy.originalIds.posts,
        selectedProducts: strategy.originalIds.products,
      };

      const res = await fetch('/api/admin/clusters/build-cluster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Falló la construcción del cluster');
      }

      const { slug } = await res.json();

      toast.success(
        (t) => (
          <span className="flex flex-col items-center">
            <b>¡Página Pilar Creada!</b>
            <Link
              href={`/blog/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              onClick={() => toast.dismiss(t.id)}
            >
              Ver la página
            </Link>
          </span>
        ),
        { id: toastId, duration: 10000 }
      );

    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsBuilding(null);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          🧪 Fábrica de Topic Clusters con IA
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Genera páginas pilares completas para dominar en SEO y ventas.
        </p>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8 border border-purple-200">
        <form onSubmit={handleGenerateStrategies} className="space-y-4">
          <div>
            <label htmlFor="cluster-topic" className="block text-lg font-semibold text-gray-700 mb-2">
              1. Tema Central de la Página Pilar
            </label>
            <input
              id="cluster-topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ej: Agendas Personalizadas 2026 en Uruguay"
              className="w-full px-4 py-3 border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500 text-base"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="cluster-description" className="block text-lg font-semibold text-gray-700 mb-2">
              2. Breve Descripción o Enfoque
            </label>
            <textarea
              id="cluster-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Una guía completa para elegir la mejor agenda, enfocada en productividad y creatividad para profesionales y estudiantes."
              className="w-full px-4 py-3 border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500 text-base"
              rows={3}
              disabled={isLoading}
            />
          </div>
          <div className="text-right">
            <button
              type="submit"
              className="bg-purple-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
              disabled={isLoading || !topic || !description}
            >
              {isLoading ? 'Generando...' : 'Generar Estrategia'}
            </button>
          </div>
        </form>
      </div>

      {isLoading && (
        <div className="text-center p-8">
          <p className="text-lg text-gray-600">Analizando todo tu contenido para crear la mejor estrategia...</p>
        </div>
      )}

      {strategies.length > 0 && (
        <div className="space-y-8 animate-fade-in">
          <h2 className="text-xl font-bold text-gray-800">3. Revisa y Construye la Página Pilar</h2>
          {strategies.map((strategy) => (
            <div key={strategy.id} className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold text-purple-700">Propuesta de Página Pilar:</h3>
                <p className="text-xl font-semibold text-gray-900">&quot;{strategy.pillarTitle}&quot;</p>
                <p className="text-sm text-gray-600 mt-1"><i>Meta-descripción: {strategy.pillarSeoDescription}</i></p>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div>
                    <h4 className="font-bold mb-2">Artículos de Blog a Incluir:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {strategy.clusterPosts.map(p => <li key={p.id}>{p.title}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">Productos a Incluir:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {strategy.clusterProducts.map(p => <li key={p.id}>{p.nombre}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2 text-amber-700">Contenido Nuevo Sugerido:</h4>
                    <ul className="list-disc list-inside space-y-1 text-amber-600">
                      {strategy.missingContent.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex items-center justify-end">
                <button
                  onClick={() => handleBuildCluster(strategy)}
                  disabled={isBuilding !== null}
                  className="bg-pink-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-pink-700 transition disabled:opacity-50"
                >
                  {isBuilding === strategy.id ? 'Construyendo...' : `Construir esta Página Pilar`}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default ClusterFactory;

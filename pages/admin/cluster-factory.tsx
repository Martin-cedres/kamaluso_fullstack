import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';

// --- Tipos de Datos (Interfaces) ---
interface ClusterStrategy {
  id: number;
  pillarTitle: string;
  clusterPosts: { title: string; id: string; }[];
  clusterProducts: { nombre: string; id:string; }[];
  missingContent: string[];
}

// --- Datos de Ejemplo (Placeholder) ---
const exampleStrategies: ClusterStrategy[] = [
  {
    id: 1,
    pillarTitle: "La Guía Definitiva de Agendas Personalizadas 2026 en Uruguay",
    clusterPosts: [
      { id: 'p1', title: "5 Formas Creativas de Decorar tu Agenda" },
      { id: 'p2', title: "Cómo Usar tu Agenda para Reducir el Estrés" },
    ],
    clusterProducts: [
      { id: 'prod1', nombre: "Agenda Semanal 2026 Premium" },
      { id: 'prod2', nombre: "Agenda Diaria Tapa Dura" },
    ],
    missingContent: [
      "Artículo sobre 'Mejores agendas para estudiantes universitarios'",
      "Comparativa: Agenda Semanal vs. Agenda Diaria"
    ]
  },
  {
    id: 2,
    pillarTitle: "Todo sobre Regalos Empresariales: Impacta a tus Clientes y Empleados",
    clusterPosts: [
      { id: 'p3', title: "El Arte de Regalar en el Mundo Corporativo" },
    ],
    clusterProducts: [
      { id: 'prod3', nombre: "Libreta Corporativa con Logo" },
      { id: 'prod4', nombre: "Bolígrafo Premium Grabado" },
    ],
    missingContent: [
      "Artículo sobre 'Cómo calcular el ROI de los regalos de empresa'",
    ]
  },
];

const ClusterFactory = () => {
  // --- Estados ---
  const [topic, setTopic] = useState('');
  const [strategies, setStrategies] = useState<ClusterStrategy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBuilding, setIsBuilding] = useState<number | null>(null);

  // --- Handlers ---
  const handleGenerateStrategies = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) {
      toast.error('Por favor, introduce un tema para el cluster.');
      return;
    }
    setIsLoading(true);
    setStrategies([]); // Limpiar resultados anteriores
    const toastId = toast.loading('IA analizando contenido y generando estrategias...');

    // Simulación de llamada a la API
    await new Promise(resolve => setTimeout(resolve, 2500));

    try {
      // En el futuro, aquí se haría:
      // const res = await fetch('/api/admin/clusters/generate-strategies', { ... });
      // const data = await res.json();
      // setStrategies(data.strategies);

      // Por ahora, usamos los datos de ejemplo
      setStrategies(exampleStrategies);
      toast.success('¡Estrategias de cluster generadas!', { id: toastId });

    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuildCluster = async (strategyId: number) => {
    setIsBuilding(strategyId);
    const toastId = toast.loading(`Construyendo cluster #${strategyId}...`);

    // Simulación de llamada a la API
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // En el futuro, se llamaría a la API de construcción
    // await fetch('/api/admin/clusters/build-cluster', { body: JSON.stringify(strategy) });

    toast.success(`Cluster #${strategyId} construido con éxito (simulado).`, { id: toastId, duration: 4000 });
    setIsBuilding(null);
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          🧪 Fábrica de Topic Clusters
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Introduce un tema y la IA te propondrá estrategias de contenido completas.
        </p>
      </div>

      {/* --- Input Form --- */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8 border border-purple-200">
        <form onSubmit={handleGenerateStrategies}>
          <label htmlFor="cluster-topic" className="block text-lg font-semibold text-gray-700 mb-2">
            1. Introduce un Tema Central
          </label>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              id="cluster-topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ej: Agendas 2026, Regalos Corporativos, Bullet Journal..."
              className="flex-grow px-4 py-3 border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500 text-base"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="bg-purple-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
              disabled={isLoading}
            >
              {isLoading ? 'Generando...' : 'Generar Estrategias'}
            </button>
          </div>
        </form>
      </div>

      {/* --- Results Area --- */}
      {isLoading && (
        <div className="text-center p-8">
          <p className="text-lg text-gray-600">🧠 IA trabajando... Analizando todo tu contenido para crear las mejores estrategias.</p>
        </div>
      )}

      {strategies.length > 0 && (
        <div className="space-y-8 animate-fade-in">
          <h2 className="text-xl font-bold text-gray-800">2. Revisa y Elige una Estrategia</h2>
          {strategies.map((strategy) => (
            <div key={strategy.id} className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold text-purple-700">Propuesta de Página Pilar:</h3>
                <p className="text-xl font-semibold text-gray-900">"{strategy.pillarTitle}"</p>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
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
                    <h4 className="font-bold mb-2 text-amber-700">Contenido Faltante Sugerido:</h4>
                    <ul className="list-disc list-inside space-y-1 text-amber-600">
                      {strategy.missingContent.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4">
                <button
                  onClick={() => handleBuildCluster(strategy.id)}
                  disabled={isBuilding !== null}
                  className="bg-pink-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-pink-700 transition disabled:opacity-50"
                >
                  {isBuilding === strategy.id ? 'Construyendo...' : `Construir este Cluster`}
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

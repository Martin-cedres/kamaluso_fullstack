import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { debounce } from 'lodash';

// Define interfaces for our data structures
interface Message {
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: string;
}

interface Insight {
  _id: string;
  fecha: string;
  intencion?: string;
  categoria?: string;
  conversation: Message[];
  productoRelacionado?: {
    nombre: string;
    slug: string;
  };
}

interface FilterOptions {
  intents: string[];
  categories: string[];
  products: { _id: string; nombre: string; slug: string }[];
}

interface Filters {
  intent: string;
  category: string;
  product: string;
  startDate: string;
  endDate: string;
}

const ChatInsightsPage = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ intents: [], categories: [], products: [] });
  const [filters, setFilters] = useState<Filters>({
    intent: '',
    category: '',
    product: '',
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Message[] | null>(null);

  // Fetch options for filter dropdowns
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const res = await fetch('/api/admin/chat-filters');
        if (res.ok) {
          const data: FilterOptions = await res.json();
          setFilterOptions(data);
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };
    fetchFilterOptions();
  }, []);

  // Fetch insights data based on filters
  const fetchInsights = useCallback(async (currentFilters: Filters) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (currentFilters.intent) params.append('intent', currentFilters.intent);
    if (currentFilters.category) params.append('category', currentFilters.category);
    if (currentFilters.product) params.append('product', currentFilters.product);
    if (currentFilters.startDate) params.append('startDate', currentFilters.startDate);
    if (currentFilters.endDate) params.append('endDate', currentFilters.endDate);

    try {
      const res = await fetch(`/api/admin/chat-insights?${params.toString()}`);
      if (res.ok) {
        const data: Insight[] = await res.json();
        setInsights(data);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced version of fetchInsights
  const debouncedFetch = useCallback(debounce(fetchInsights, 500), [fetchInsights]);

  useEffect(() => {
    debouncedFetch(filters);
    // Cleanup on component unmount
    return () => debouncedFetch.cancel();
  }, [filters, debouncedFetch]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      intent: '',
      category: '',
      product: '',
      startDate: '',
      endDate: '',
    });
  };

  const openConversationModal = (conversation: Message[]) => {
    setSelectedConversation(conversation);
  };

  const closeConversationModal = () => {
    setSelectedConversation(null);
  };
  
  const ConversationModal = ({ conversation, onClose }: { conversation: Message[]; onClose: () => void; }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Historial de la Conversación</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </header>
        <main className="p-6 overflow-y-auto">
          <div className="space-y-4">
            {conversation.filter(m => m.role === 'user' || m.role === 'model').map((message, index) => (
              <div key={index} className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-lg px-4 py-2 max-w-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                  <p>{message.content}</p>
                </div>
                 <span className="text-xs text-gray-400 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );


  return (
    <AdminLayout>
      {selectedConversation && <ConversationModal conversation={selectedConversation} onClose={closeConversationModal} />}
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-800">Análisis del Chat</h1>
          <p className="text-gray-500 mt-1">Analiza las conversaciones del chatbot para obtener información valiosa.</p>
        </header>

        {/* Filters Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Intent Filter */}
            <div className="flex flex-col">
              <label htmlFor="intent" className="text-sm font-medium text-gray-700 mb-1">Intención</label>
              <select id="intent" name="intent" value={filters.intent} onChange={handleFilterChange} className="p-2 border rounded-md shadow-sm">
                <option value="">Todas</option>
                {filterOptions.intents.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex flex-col">
              <label htmlFor="category" className="text-sm font-medium text-gray-700 mb-1">Categoría (IA)</label>
              <select id="category" name="category" value={filters.category} onChange={handleFilterChange} className="p-2 border rounded-md shadow-sm">
                <option value="">Todas</option>
                {filterOptions.categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Product Filter */}
            <div className="flex flex-col">
              <label htmlFor="product" className="text-sm font-medium text-gray-700 mb-1">Producto</label>
              <select id="product" name="product" value={filters.product} onChange={handleFilterChange} className="p-2 border rounded-md shadow-sm">
                <option value="">Todos</option>
                {filterOptions.products.map(p => <option key={p.slug} value={p.slug}>{p.nombre}</option>)}
              </select>
            </div>

            {/* Start Date Filter */}
            <div className="flex flex-col">
              <label htmlFor="startDate" className="text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
              <input type="date" id="startDate" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="p-2 border rounded-md shadow-sm" />
            </div>

            {/* End Date Filter */}
            <div className="flex flex-col">
              <label htmlFor="endDate" className="text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
              <input type="date" id="endDate" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="p-2 border rounded-md shadow-sm" />
            </div>
          </div>
           <div className="mt-4">
              <button onClick={clearFilters} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                Limpiar Filtros
              </button>
            </div>
        </div>

        {/* Insights Table */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          {loading ? (
            <p className="p-6 text-center text-gray-500">Cargando datos...</p>
          ) : (
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Fecha</th>
                  <th scope="col" className="px-6 py-3">Intención</th>
                  <th scope="col" className="px-6 py-3">Categoría</th>
                  <th scope="col" className="px-6 py-3">Producto Relacionado</th>
                  <th scope="col" className="px-6 py-3">Conversación</th>
                </tr>
              </thead>
              <tbody>
                {insights.length > 0 ? insights.map((insight) => (
                  <tr key={insight._id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{new Date(insight.fecha).toLocaleString('es-UY')}</td>
                    <td className="px-6 py-4">{insight.intencion || '-'}</td>
                    <td className="px-6 py-4">{insight.categoria || '-'}</td>
                    <td className="px-6 py-4">
                      {insight.productoRelacionado?.slug ? (
                        <a href={`/productos/detail/${insight.productoRelacionado.slug}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {insight.productoRelacionado.nombre}
                        </a>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <p className="max-w-sm truncate text-gray-600 mb-2">
                          {insight.conversation.find(m => m.role === 'user')?.content || ''}
                        </p>
                        <button onClick={() => openConversationModal(insight.conversation)} className="font-medium text-blue-600 hover:underline self-start">
                          Ver Conversación
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">No se encontraron datos con los filtros seleccionados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

// I need to install lodash for debouncing
// npm install lodash @types/lodash

export default ChatInsightsPage;

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { IPillarPage } from '../../models/PillarPage';
import { IPost } from '../../models/Post';
import { IProduct } from '../../models/Product';

// Interfaces locales actualizadas para incluir los nuevos campos de estado
interface ILocalPillarPage extends IPillarPage {
  status: 'published' | 'pending_review';
}
interface ILocalPost extends IPost {
  status: 'published' | 'pending_review';
}
interface ILocalProduct extends IProduct {
  contentStatus?: 'published' | 'pending_review';
}

const EmptyState = () => (
  <div className="text-center bg-white p-10 rounded-2xl shadow-md border">
    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
    <h3 className="mt-4 text-xl font-semibold text-gray-800">No se encontraron Páginas Pilares</h3>
    <p className="mt-2 text-base text-gray-600">
      El Gestor de Clusters necesita al menos una Página Pilar para poder asociar contenido. <br/>
      Una Página Pilar es el centro de tu estrategia de contenido sobre un tema específico.
    </p>
    <div className="mt-6">
      <Link href="/admin/pillar-pages" passHref>
        <a className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Crear mi Primera Página Pilar
        </a>
      </Link>
    </div>
  </div>
);


const ClusterManager = () => {
  // --- Estados ---
  const [pillarPages, setPillarPages] = useState<ILocalPillarPage[]>([]);
  const [allPosts, setAllPosts] = useState<ILocalPost[]>([]);
  const [allProducts, setAllProducts] = useState<ILocalProduct[]>([]);
  
  const [selectedPillarId, setSelectedPillarId] = useState<string>('');
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);


  // --- Carga de Datos ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pillarRes, postRes, productRes] = await Promise.all([
        fetch('/api/admin/pillar-pages/listar'),
        fetch('/api/blog/listar'),
        fetch('/api/products/listar'),
      ]);

      if (!pillarRes.ok || !postRes.ok || !productRes.ok) {
        throw new Error('Error al cargar los datos iniciales.');
      }

      const pillarData = await pillarRes.json();
      const postData = await postRes.json();
      const productData = await productRes.json();

      // Robust data parsing to handle wrapped or direct array responses
      setPillarPages(Array.isArray(pillarData) ? pillarData : pillarData?.data || []);
      setAllPosts(Array.isArray(postData) ? postData : postData?.posts || []);
      setAllProducts(Array.isArray(productData) ? productData : productData?.products || []);

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Lógica de Sincronización y Detección de Cambios Pendientes ---
  useEffect(() => {
    if (selectedPillarId) {
      const selectedPage = pillarPages.find(p => p._id === selectedPillarId);
      if (selectedPage) {
        // Sincronizar checkboxes
        const postIds = selectedPage.clusterPosts.map(p => String(p));
        const productIds = selectedPage.clusterProducts.map(p => String(p));
        setSelectedPosts(new Set(postIds));
        setSelectedProducts(new Set(productIds));

        // Comprobar si hay cambios pendientes
        let pending = false;
        if (selectedPage.status === 'pending_review') {
          pending = true;
        }
        
        const postsInPillar = allPosts.filter(p => postIds.includes(String(p._id)));
        if (postsInPillar.some(p => p.status === 'pending_review')) {
          pending = true;
        }

        const productsInPillar = allProducts.filter(p => productIds.includes(String(p._id)));
        if (productsInPillar.some(p => p.contentStatus === 'pending_review')) {
          pending = true;
        }
        
        setHasPendingChanges(pending);

      }
    } else {
      setSelectedPosts(new Set());
      setSelectedProducts(new Set());
      setHasPendingChanges(false);
    }
  }, [selectedPillarId, pillarPages, allPosts, allProducts]);

  // --- Handlers ---
  const handlePillarChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPillarId(e.target.value);
  };

  const handlePostToggle = (postId: string) => {
    const newSelection = new Set(selectedPosts);
    if (newSelection.has(postId)) {
      newSelection.delete(postId);
    }
    else {
      newSelection.add(postId);
    }
    setSelectedPosts(newSelection);
  };

  const handleProductToggle = (productId: string) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    }
    else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };

  const handleSaveCluster = async () => {
    if (!selectedPillarId) {
      toast.error('Por favor, selecciona una Página Pilar primero.');
      return;
    }
    setIsSaving(true);
    const toastId = toast.loading('Guardando asociaciones del cluster...');
    try {
      const res = await fetch('/api/admin/clusters/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pillarPageId: selectedPillarId,
          clusterPostIds: Array.from(selectedPosts),
          clusterProductIds: Array.from(selectedProducts),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al guardar el cluster.');
      }

      toast.success('¡Cluster guardado con éxito!', { id: toastId });
      await fetchData();

    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunAiOptimization = async () => {
    if (!selectedPillarId) {
      toast.error('Por favor, selecciona una Página Pilar primero.');
      return;
    }
    setIsOptimizing(true);
    const toastId = toast.loading('IA analizando el cluster para generar sugerencias...');
    try {
      const res = await fetch('/api/admin/clusters/generate-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pillarPageId: selectedPillarId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al generar sugerencias.');
      }

      const result = await res.json();
      toast.success(result.message || 'Sugerencias generadas. ¡Listas para tu revisión!', { id: toastId, duration: 5000 });
      await fetchData();
      
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsOptimizing(false);
    }
  };

  const selectedPillar = pillarPages.find(p => p._id === selectedPillarId);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Gestor de Topic Clusters</h1>
        <p className="text-sm text-gray-500 mt-1">Guía paso a paso para crear y optimizar tu estrategia de contenidos.</p>
      </div>

      {isLoading ? ( <p>Cargando datos...</p> ) : 
       pillarPages.length === 0 ? ( <EmptyState /> ) : 
      (
        <div className="space-y-8">
          {/* === PASO 1: SELECCIONAR TEMA === */}
          <div className="bg-white p-6 rounded-2xl shadow-md border">
            <h2 className="text-lg font-bold text-pink-600 mb-2">Paso 1: Selecciona un Tema (Página Pilar)</h2>
            <select id="pillar-select" value={selectedPillarId} onChange={handlePillarChange} className="w-full max-w-lg p-3 border-gray-300 rounded-lg shadow-sm focus:border-pink-500 focus:ring-pink-500 text-lg">
              <option value="" disabled>Elige un tema para gestionar...</option>
              {pillarPages.map(page => (
                <option key={page._id} value={page._id}>{page.topic} ({page.title})</option>
              ))}
            </select>
          </div>

          {selectedPillarId && (
            <div className="animate-fade-in space-y-8">
              {/* === PASO 2: CONSTRUIR CLUSTER === */}
              <div className="bg-white p-6 rounded-2xl shadow-md border">
                <h2 className="text-lg font-bold text-pink-600 mb-4">Paso 2: Construye y Guarda el Cluster</h2>
                <p className="text-sm text-gray-600 mb-6">Marca todos los artículos y productos que pertenecen a este tema. Luego, guarda las asociaciones.</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                  <div className="border p-4 rounded-lg">
                    <h3 className="font-bold text-lg mb-4">Artículos del Blog ({selectedPosts.size} seleccionados)</h3>
                    <div className="h-96 overflow-y-auto space-y-3 pr-2">
                      {allPosts.map(post => (
                        <label key={post._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition">
                          <input type="checkbox" checked={selectedPosts.has(post._id)} onChange={() => handlePostToggle(post._id)} className="h-5 w-5 rounded text-pink-600 focus:ring-pink-500"/>
                          <span className="text-sm font-medium text-gray-800">{post.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="border p-4 rounded-lg">
                    <h3 className="font-bold text-lg mb-4">Productos ({selectedProducts.size} seleccionados)</h3>
                    <div className="h-96 overflow-y-auto space-y-3 pr-2">
                      {allProducts.map(product => (
                        <label key={product._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition">
                          <input type="checkbox" checked={selectedProducts.has(product._id)} onChange={() => handleProductToggle(product._id)} className="h-5 w-5 rounded text-pink-600 focus:ring-pink-500"/>
                          <span className="text-sm font-medium text-gray-800">{product.nombre}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={handleSaveCluster} disabled={isSaving || isOptimizing} className="bg-pink-600 text-white font-bold px-8 py-3 rounded-lg shadow-lg hover:bg-pink-700 transition disabled:opacity-50">
                  {isSaving ? 'Guardando...' : `Construir y Guardar Cluster "${selectedPillar?.topic}"`}
                </button>
              </div>

              {/* === PASO 3: OPTIMIZACIÓN IA === */}
              <div className="bg-white p-6 rounded-2xl shadow-md border">
                <h2 className="text-lg font-bold text-purple-600 mb-4">Paso 3: Optimización con IA</h2>
                <p className="text-sm text-gray-600 mb-6">Una vez guardado el cluster, usa la IA para generar el enlazado interno y luego revisa los cambios para publicarlos.</p>
                {hasPendingChanges ? (
                  <Link href={`/admin/clusters/review/${selectedPillarId}`} passHref>
                    <a className="inline-flex items-center gap-3 bg-yellow-500 text-white font-bold px-8 py-4 rounded-lg shadow-lg hover:bg-yellow-600 transition text-base">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      Revisar Sugerencias Pendientes
                    </a>
                  </Link>
                ) : (
                  <button onClick={handleRunAiOptimization} disabled={isSaving || isOptimizing} className="inline-flex items-center gap-3 bg-purple-600 text-white font-bold px-8 py-4 rounded-lg shadow-lg hover:bg-purple-700 transition disabled:opacity-50 text-base">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    {isOptimizing ? 'Generando...' : 'Generar Sugerencias de Enlazado'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default ClusterManager;


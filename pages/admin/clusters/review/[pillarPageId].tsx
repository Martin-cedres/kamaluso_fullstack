import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/AdminLayout';
import toast from 'react-hot-toast';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { IReviewItem } from '../api/admin/clusters/review-data';

const ReviewClusterChanges = () => {
  const router = useRouter();
  const { pillarPageId } = router.query;

  const [reviewItems, setReviewItems] = useState<IReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pillarPageId) return;

    const fetchReviewData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/clusters/review-data?pillarPageId=${pillarPageId}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Error al cargar los datos para revisión.');
        }
        const { data } = await res.json();
        if (!data || data.length === 0) {
          toast.success('¡No hay cambios pendientes para revisar en este cluster!');
          router.push('/admin/clusters');
          return;
        }
        setReviewItems(data);
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviewData();
  }, [pillarPageId, router]);

  const handleApproveChanges = async () => {
    setIsApproving(true);
    const toastId = toast.loading('Aprobando y publicando cambios...');
    try {
      const documentsToApprove = reviewItems.map(item => ({ id: item.id, type: item.type }));

      const res = await fetch('/api/admin/clusters/approve-changes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: documentsToApprove }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al aprobar los cambios.');
      }

      const result = await res.json();
      toast.success(result.message || '¡Cambios aprobados y publicados con éxito!', { id: toastId, duration: 5000 });
      router.push('/admin/clusters');

    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsApproving(false);
    }
  };
  
  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'PillarPage': return 'Página Pilar';
      case 'Post': return 'Artículo';
      case 'Product': return 'Producto';
      default: return 'Documento';
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Revisar Cambios de Enlazado Interno
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Revisa las sugerencias de la IA y aprueba los cambios para publicarlos.
        </p>
      </div>

      {isLoading && <p>Cargando cambios para revisión...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      
      {!isLoading && !error && (
        <div className="space-y-12">
          <div className="sticky top-0 bg-white/80 backdrop-blur-sm py-4 z-10 border-b">
            <button
              onClick={handleApproveChanges}
              disabled={isApproving}
              className="bg-green-600 text-white font-bold px-8 py-3 rounded-lg shadow-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {isApproving ? 'Publicando...' : `Aprobar y Publicar ${reviewItems.length} Cambios`}
            </button>
          </div>

          {reviewItems.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl shadow-md border">
              <h2 className="text-xl font-bold mb-2 text-gray-800">
                <span className={`text-sm font-semibold mr-2 px-2.5 py-0.5 rounded-full ${
                  item.type === 'PillarPage' ? 'bg-pink-100 text-pink-800' : 
                  item.type === 'Post' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {getDocumentTypeLabel(item.type)}
                </span>
                {item.title}
              </h2>
              <div className="border rounded-lg overflow-hidden">
                <ReactDiffViewer
                  oldValue={item.originalContent}
                  newValue={item.proposedContent}
                  splitView={true}
                  leftTitle="Contenido Original"
                  rightTitle="Contenido Sugerido por IA"
                  useDarkTheme={false}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default ReviewClusterChanges;

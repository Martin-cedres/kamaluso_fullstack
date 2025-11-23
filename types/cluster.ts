// Definimos una interfaz unificada para los datos de revisión
export interface IReviewItem {
  id: string;
  type: 'PillarPage' | 'Post' | 'Product';
  title: string;
  originalContent: string;
  proposedContent: string;
}

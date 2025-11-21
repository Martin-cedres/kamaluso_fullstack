import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/mongoose';
import PillarPage from '../../../../models/PillarPage';
import Post from '../../../../models/Post';
import Product from '../../../../models/Product';

type DocumentToApprove = {
  id: string;
  type: 'PillarPage' | 'Post' | 'Product';
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { documents } = req.body;

  if (!documents || !Array.isArray(documents) || documents.length === 0) {
    return res.status(400).json({ message: 'Se requiere un array "documents" con al menos un elemento.' });
  }

  try {
    await connectDB();

    let approvedCount = 0;
    let revalidatedCount = 0;
    const approvalErrors: any[] = [];
    const revalidationErrors: any[] = [];

    await Promise.all(documents.map(async (doc: DocumentToApprove) => {
      try {
        let updatedDoc;
        let pathToRevalidate = '';

        switch (doc.type) {
          case 'PillarPage':
            const pillarPage = await PillarPage.findById(doc.id);
            if (!pillarPage || !pillarPage.proposedContent) break;
            
            pillarPage.content = pillarPage.proposedContent;
            pillarPage.proposedContent = undefined; // Limpiar el contenido propuesto
            pillarPage.status = 'published';
            updatedDoc = await pillarPage.save();
            
            if (updatedDoc) {
              pathToRevalidate = `/pillar/${updatedDoc.slug}`;
            }
            break;

          case 'Post':
            const post = await Post.findById(doc.id);
            if (!post || !post.proposedContent) break;

            post.content = post.proposedContent;
            post.proposedContent = undefined;
            post.status = 'published';
            updatedDoc = await post.save();

            if (updatedDoc) {
              pathToRevalidate = `/blog/${updatedDoc.slug}`;
            }
            break;

          case 'Product':
            const product = await Product.findById(doc.id);
            if (!product || !product.proposedContent) break;

            product.descripcionExtensa = product.proposedContent;
            product.proposedContent = undefined;
            product.contentStatus = 'published';
            updatedDoc = await product.save();

            if (updatedDoc) {
              pathToRevalidate = `/productos/detail/${updatedDoc.slug}`;
            }
            break;

          default:
            console.warn(`Tipo de documento desconocido para aprobación: ${doc.type}`);
            return;
        }

        if (updatedDoc) {
          approvedCount++;
          // Revalidar la página para que los cambios sean visibles públicamente
          if (pathToRevalidate) {
            try {
              await res.revalidate(pathToRevalidate);
              revalidatedCount++;
              console.log(`✅ Página revalidada: ${pathToRevalidate}`);
            } catch (revalError: any) {
              console.error(`Error al revalidar la ruta ${pathToRevalidate}:`, revalError);
              revalidationErrors.push({ id: doc.id, path: pathToRevalidate, error: revalError.message });
            }
          }
        }
      } catch (dbError: any) {
        console.error(`Error al aprobar el documento ${doc.id}:`, dbError);
        approvalErrors.push({ id: doc.id, error: dbError.message });
      }
    }));

    const finalMessage = `Proceso de aprobación completado. Documentos aprobados: ${approvedCount}. Páginas revalidadas: ${revalidatedCount}.`;
    
    console.log(finalMessage);

    res.status(200).json({ 
      message: finalMessage, 
      data: {
        totalDocumentsAttempted: documents.length,
        successfulApprovals: approvedCount,
        successfulRevalidations: revalidatedCount,
        approvalErrors,
        revalidationErrors
      } 
    });

  } catch (error: any) {
    console.error('Error en el proceso de aprobación de cambios:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
}

import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/mongoose';
import PillarPage from '../../../../models/PillarPage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    await connectDB();

    const { _id, title, topic, slug, content, seoTitle, seoDescription } = req.body;

    if (!_id || !title || !topic || !slug || !content) {
      return res.status(400).json({ message: 'ID, título, tema, slug y contenido son requeridos.' });
    }

    const pillarPage = await PillarPage.findById(_id);

    if (!pillarPage) {
      return res.status(404).json({ message: 'Página Pilar no encontrada.' });
    }

    // Verificar que el nuevo slug no esté en uso por otra página
    if (slug !== pillarPage.slug) {
      const existingSlug = await PillarPage.findOne({ slug });
      if (existingSlug) {
        return res.status(409).json({ message: 'El nuevo slug ya está en uso por otra página.' });
      }
    }

    // Actualizar los campos
    pillarPage.title = title;
    pillarPage.topic = topic;
    pillarPage.slug = slug;
    pillarPage.content = content;
    pillarPage.seoTitle = seoTitle;
    pillarPage.seoDescription = seoDescription;

    await pillarPage.save();

    res.status(200).json(pillarPage);
  } catch (error: any) {
    console.error('Error al actualizar la página pilar:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
}

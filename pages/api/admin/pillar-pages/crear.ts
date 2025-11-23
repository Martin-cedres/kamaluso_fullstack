import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/mongoose';
import PillarPage from '../../../../models/PillarPage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    await connectDB();

    const { title, topic, slug, content, seoTitle, seoDescription } = req.body;

    if (!title || !topic || !slug) {
      return res.status(400).json({ message: 'Título, tema y slug son requeridos.' });
    }

    // Verificar si el slug ya existe y hacerlo único si es necesario
    let uniqueSlug = slug;
    let counter = 1;
    while (await PillarPage.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    const newPillarPage = new PillarPage({
      title,
      topic,
      slug: uniqueSlug,
      content: content || '<p>Contenido pendiente de generación...</p>', // Placeholder para pasar validación de Mongoose
      seoTitle: seoTitle || '', // Ensure seoTitle is not undefined
      seoDescription: seoDescription || '', // Ensure seoDescription is not undefined
      status: 'published', // Always published on manual creation
      clusterPosts: [],
      clusterProducts: [],
    });

    await newPillarPage.save();

    res.status(201).json(newPillarPage);
  } catch (error: any) {
    console.error('Error al crear la página pilar:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message, stack: error.stack });
  }
}

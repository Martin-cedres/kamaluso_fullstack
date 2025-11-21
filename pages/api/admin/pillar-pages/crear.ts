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

    // Verificar si el slug ya existe
    const existingPage = await PillarPage.findOne({ slug });
    if (existingPage) {
      return res.status(409).json({ message: 'El slug ya existe. Por favor, elige otro título.' });
    }

    const newPillarPage = new PillarPage({
      title,
      topic,
      slug,
      content: content || '', // Ensure content is not undefined
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
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
}

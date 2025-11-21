import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../../lib/mongoose';
import PillarPage from '../../../../models/PillarPage';
import { generateWithFallback } from '../../../../lib/gemini-agent';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await connectDB();

  const { id, topic, title } = req.body;

  if (!id || !topic || !title) {
    return res.status(400).json({ message: 'Missing pillar page ID, topic or title' });
  }

  try {
    const pillarPage = await PillarPage.findById(id);

    if (!pillarPage) {
      return res.status(404).json({ message: 'Pillar page not found' });
    }

    // Construct a comprehensive prompt for AI to generate pillar page content
    const prompt = `Genera un artículo completo y extenso (al menos 1500 palabras) para una página pilar sobre el tema "${topic}" con el título "${title}".
    El artículo debe ser informativo, atractivo y optimizado para SEO, cubriendo en profundidad el tema. Incluye secciones con subtítulos relevantes, una introducción, desarrollo de puntos clave y una conclusión.
    El contenido debe ser original y útil para el usuario, enfocándose en resolver dudas y aportar valor.
    Formato: Utiliza Markdown para los subtítulos (## H2, ### H3) y párrafos. No incluyas el título principal del artículo en la respuesta, solo el contenido del cuerpo.
    `;

    const generatedContent = await generateWithFallback(prompt);

    pillarPage.proposedContent = generatedContent;
    pillarPage.status = 'pending_review';
    await pillarPage.save();

    res.status(200).json({ message: 'Contenido generado y pendiente de revisión', proposedContent: generatedContent });
  } catch (error: any) {
    console.error('Error generating pillar page content with AI:', error);
    res.status(500).json({ message: 'Error al generar contenido con IA', error: error.message });
  }
}

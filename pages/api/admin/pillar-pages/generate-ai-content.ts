import type { NextApiRequest, NextApiResponse } from 'next';
import { generateWithFallback } from '../../../../lib/gemini-agent';
import dbConnect from '../../../../lib/mongoose';
import PillarPage from '../../../../models/PillarPage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'POST') {
    const { title, topic } = req.body;

    if (!title || !topic) {
      return res.status(400).json({ message: 'El título y el tema son requeridos para generar contenido con IA.' });
    }

    try {
      // Prompt para generar el contenido principal
      // Prompt para generar el contenido principal
      const contentPrompt = `Eres un especialista en SEO para papelería en Uruguay. Tu objetivo es generar contenido extenso y de alta calidad para una página pilar.
      
      **Título de la Página Pilar:** "${title}"
      **Tema Principal del Cluster:** "${topic}"

      Genera un artículo completo y detallado (mínimo 1500 palabras) que aborde el tema principal de forma exhaustiva.
      
      **FORMATO OBLIGATORIO: HTML**
      - Usa etiquetas <h2> para los subtítulos principales.
      - Usa etiquetas <h3> para secciones dentro de los subtítulos.
      - Usa etiquetas <p> para los párrafos.
      - Usa etiquetas <ul> y <li> para listas.
      - Usa etiquetas <strong> para resaltar frases clave.
      - NO uses etiquetas <html>, <head> o <body>. Devuelve solo el contenido del cuerpo.
      - NO uses Markdown (nada de ## o **).
      - NO incluyas el título H1 al principio (ya se renderiza en la plantilla).

      Incluye:
      - Una introducción atractiva.
      - Información útil y práctica para el público uruguayo interesado en papelería.
      - Palabras clave relacionadas con "${topic}" y "papelería en Uruguay".
      - Un tono profesional, informativo y persuasivo.
      - Conclusión.`;

      // Prompt para generar el título SEO
      const seoTitlePrompt = `Genera un título SEO optimizado para Google para la siguiente página pilar de papelería en Uruguay. Debe ser conciso (máximo 60 caracteres), atractivo y contener palabras clave relevantes.
      
      **Título de la Página Pilar:** "${title}"
      **Tema Principal del Cluster:** "${topic}"
      
      Título SEO:`;

      // Prompt para generar la descripción SEO
      const seoDescriptionPrompt = `Genera una meta descripción SEO optimizada para Google para la siguiente página pilar de papelería en Uruguay. Debe ser concisa (máximo 160 caracteres), atractiva, resumir el contenido y contener palabras clave relevantes.
      
      **Título de la Página Pilar:** "${title}"
      **Tema Principal del Cluster:** "${topic}"
      
      Meta Descripción:`;

      const [generatedContent, generatedSeoTitle, generatedSeoDescription] = await Promise.all([
        generateWithFallback(contentPrompt),
        generateWithFallback(seoTitlePrompt),
        generateWithFallback(seoDescriptionPrompt),
      ]);

      res.status(200).json({
        content: generatedContent,
        seoTitle: generatedSeoTitle.replace('Título SEO:', '').trim(), // Limpiar el prefijo del prompt
        seoDescription: generatedSeoDescription.replace('Meta Descripción:', '').trim(), // Limpiar el prefijo del prompt
      });

    } catch (error: any) {
      console.error('Error al generar contenido con IA:', error);
      res.status(500).json({ message: 'Error al generar contenido con IA', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

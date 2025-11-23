import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import connectDB from '../../../../lib/mongoose';
import { generateContentSmart } from '../../../../lib/gemini-client';
import PillarPage from '../../../../models/PillarPage';
import Product from '../../../../models/Product';
import Post from '../../../../models/Post';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado.' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const { pillarTopic, pillarTitle, pillarSeoDescription, selectedPosts, selectedProducts } = req.body;

  if (!pillarTopic || !pillarTitle) {
    return res.status(400).json({ message: 'Faltan datos requeridos (topic, title).' });
  }

  try {
    await connectDB();

    // 1. Obtener detalles de los posts y productos seleccionados para el contexto
    const posts = await Post.find({ _id: { $in: selectedPosts } }, 'title excerpt slug');
    const products = await Product.find({ _id: { $in: selectedProducts } }, 'nombre descripcion slug');

    const postsContext = posts.map(p => `- [Post] ${p.title}: ${p.excerpt || ''} (Slug: ${p.slug})`).join('\n');
    const productsContext = products.map(p => `- [Producto] ${p.nombre}: ${(p.descripcion || '').substring(0, 100)}... (Slug: ${p.slug})`).join('\n');

    // 2. Generar el contenido de la Página Pilar con IA
    const prompt = `
      Actúa como un redactor SEO experto. Tu tarea es escribir el CONTENIDO COMPLETO para una nueva "Página Pilar" sobre el tema: "${pillarTopic}".

      TÍTULO DE LA PÁGINA: "${pillarTitle}"
      META DESCRIPCIÓN: "${pillarSeoDescription}"

      OBJETIVO:
      Esta página debe ser la autoridad máxima en el sitio sobre "${pillarTopic}". Debe cubrir el tema en profundidad, responder preguntas frecuentes y servir como centro de navegación hacia los artículos y productos relacionados.

      CONTENIDO RELACIONADO (CLUSTER):
      Debes mencionar y enlazar conceptualmente (no te preocupes por el HTML exacto de los enlaces aún, pero sí por el flujo del texto) los siguientes recursos:
      
      ARTÍCULOS DEL BLOG:
      ${postsContext}

      PRODUCTOS:
      ${productsContext}

      ESTRUCTURA REQUERIDA (Formato HTML):
      - Usa etiquetas <h2>, <h3>, <p>, <ul>, <li>.
      - NO uses <h1> (ya lo tenemos en el título).
      - NO incluyas <html>, <head> o <body> tags.
      - Incluye una introducción fuerte.
      - Desarrolla secciones informativas sobre el tema.
      - Incluye una sección de "Productos Recomendados" donde hables de los productos del cluster.
      - Incluye una sección de "Aprende Más" donde menciones los artículos del blog.
      - Conclusión.

      Escribe el contenido en HTML limpio, listo para guardar en la base de datos.
    `;

    console.log('Generando contenido para Pillar Page:', pillarTitle);
    const generatedContent = await generateContentSmart(prompt);

    // Limpiar bloques de código si la IA los pone
    const cleanContent = generatedContent.replace(/```html/g, '').replace(/```/g, '').trim();

    // 3. Crear la Página Pilar
    // Generar un slug robusto manejando acentos
    const slug = pillarTitle
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
      .replace(/[^a-z0-9]+/g, '-')     // Reemplazar no alfanuméricos con guiones
      .replace(/(^-|-$)/g, '');        // Eliminar guiones al inicio/final

    const newPillarPage = await PillarPage.create({
      title: pillarTitle,
      slug: slug + '-' + Date.now().toString().slice(-4), // Asegurar unicidad básica
      topic: pillarTopic,
      content: cleanContent,
      seoTitle: pillarTitle,
      seoDescription: pillarSeoDescription,
      clusterPosts: selectedPosts,
      clusterProducts: selectedProducts,
      status: 'published', // O 'pending_review' si prefieres
    });

    res.status(201).json({
      message: 'Cluster construido con éxito',
      pillarPage: newPillarPage
    });

  } catch (error: any) {
    console.error('Error construyendo el cluster:', error);
    res.status(500).json({ message: 'Error interno al construir el cluster', error: error.message });
  }
}

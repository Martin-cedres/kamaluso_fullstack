import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import connectDB from '../../../../lib/mongoose';
import { generateContentSmart } from '../../../../lib/gemini-client';
import PillarPage from '../../../../models/PillarPage';
import Product from '../../../../models/Product';
import Post from '../../../../models/Post';
import SeoStrategy from '../../../../models/SeoStrategy';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado.' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // Aceptamos strategyId opcional para el flujo automático
  const { pillarTopic, pillarTitle, pillarSeoDescription, selectedPosts, selectedProducts, strategyId } = req.body;

  if (!pillarTopic || !pillarTitle) {
    return res.status(400).json({ message: 'Faltan datos requeridos (topic, title).' });
  }

  try {
    await connectDB();

    // 1. Obtener detalles de los posts y productos seleccionados para el contexto
    const posts = await Post.find({ _id: { $in: selectedPosts || [] } }, 'title excerpt slug');
    const products = await Product.find({ _id: { $in: selectedProducts || [] } }, 'nombre descripcion slug imageUrl basePrice');

    const postsContext = posts.map(p => `- [Post] ${p.title}: ${p.excerpt || ''} (Slug: ${p.slug})`).join('\n');

    // Enriquecemos el contexto de productos para la IA
    const productsContext = products.map(p => `
      - [PRODUCTO] ID: ${p._id}
        Nombre: ${p.nombre}
        Slug: ${p.slug}
        Precio: $${p.basePrice}
        Desc: ${(p.descripcion || '').substring(0, 150)}...
    `).join('\n');

    // 2. Generar el contenido de la Página Pilar con IA (Prompt Mejorado para Ventas)
    const prompt = `
      INSTRUCCIÓN DIRECTA: Genera el contenido HTML para una Página Pilar.

      DATOS:
      - Tema: "${pillarTopic}"
      - Título: "${pillarTitle}"
      - Meta Descripción: "${pillarSeoDescription}"

      PRODUCTOS DISPONIBLES:
      ${productsContext}

      ARTÍCULOS RELACIONADOS:
      ${postsContext}

      REQUISITOS DE FORMATO:
      1. Usa <h2>, <h3>, <p>, <ul>, <li>. NO uses <h1>, <html>, <body>.
      2. Para productos: inserta {{PRODUCT_CARD:slug-del-producto}} en su propia línea
      3. Para artículos: <a href="/blog/slug-post">Título Post</a>
      4. Tono profesional, cercano, persuasivo (Tú/Nosotros)

      ESTRUCTURA OBLIGATORIA:
      - Intro con gancho (problema/necesidad)
      - Desarrollo educativo ligado a soluciones
      - Sección de productos destacados
      - Conclusión con CTA

      REGLAS CRÍTICAS:
      - NO escribas introducciones tipo "Aquí tienes", "Entendido", "Como experto..."
      - NO uses placeholders: "(empresa)", "(año)", "[dato]"
      - Contenido listo para publicar SIN edición
      - Años concretos: 2025/2026
      
      IMPORTANTE: Devuelve ÚNICAMENTE el HTML del contenido. Comienza con <h2> y termina con la última etiqueta.
    `;

    console.log('Generando contenido VENDEDOR para Pillar Page:', pillarTitle);
    const generatedContent = await generateContentSmart(prompt);

    // Limpieza EXHAUSTIVA de respuestas conversacionales
    const cleanContent = generatedContent
      .replace(/```html/gi, '')
      .replace(/```/g, '')
      .replace(/^[\s\S]*?(?=<h)/i, '') // Eliminar TODO antes del primer <h2> o <h3>
      .replace(/¡Entendido![\s\S]*?(?=<)/gi, '')
      .replace(/Aquí tienes[\s\S]*?(?=<)/gi, '')
      .replace(/Como[\s\S]*?SEO[\s\S]*?(?=<)/gi, '')
      .replace(/Actuando como[\s\S]*?(?=<)/gi, '')
      .replace(/Espero que[\s\S]*$/gi, '')
      .trim();

    // 3. Crear la Página Pilar
    const slug = pillarTitle
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newPillarPage = await PillarPage.create({
      title: pillarTitle,
      slug: slug + '-' + Date.now().toString().slice(-4),
      topic: pillarTopic,
      content: cleanContent,
      seoTitle: pillarTitle,
      seoDescription: pillarSeoDescription,
      clusterPosts: selectedPosts,
      clusterProducts: selectedProducts,
      status: 'published',
    });

    // 4. Si venimos de una estrategia automática, actualizamos su estado y generamos posts de apoyo
    if (strategyId) {
      const strategy = await SeoStrategy.findById(strategyId);
      if (!strategy) {
        return res.status(404).json({ message: 'Estrategia no encontrada.' });
      }

      // 4. Generar Artículos de Apoyo (Cluster Posts) si vienen en la estrategia
      if (strategy.suggestedPosts && strategy.suggestedPosts.length > 0) {
        console.log(`Generando ${strategy.suggestedPosts.length} artículos de apoyo para la estrategia ${strategyId}...`);

        const pillarSlug = newPillarPage.slug; // Usar el slug de la Pillar Page recién creada

        for (const postTitle of strategy.suggestedPosts) {
          // Primero, generar METADATA completa (SEO + Subtítulo)
          const metadataPrompt = `
            TAREA: Genera metadata SEO para un artículo de blog.
            
            DATOS:
            - Título: "${postTitle}"
            - Tema: "${pillarTopic}"
            - Keywords: ${strategy.targetKeywords.join(', ')}
            
            FORMATO DE SALIDA (solo JSON, sin texto adicional):
            {
              "subtitle": "Subtítulo atractivo máx 120 caracteres",
              "seoTitle": "Título SEO 50-60 caracteres con keyword",
              "seoDescription": "Meta descripción 150-160 caracteres persuasiva",
              "excerpt": "Resumen 2-3 líneas máx 200 caracteres"
            }
          `;

          const metadataResponse = await generateContentSmart(metadataPrompt);
          const cleanMetadataJson = metadataResponse
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .replace(/^[\s\S]*?(?={)/i, '') // Eliminar texto antes del JSON
            .replace(/}[\s\S]*$/i, '}') // Eliminar texto después del JSON
            .trim();
          const metadata = JSON.parse(cleanMetadataJson);

          // Luego, generar CONTENIDO completo
          const postPrompt = `
            TAREA: Escribe un artículo de blog completo en HTML.

            DATOS:
            - Título: "${postTitle}"
            - Subtítulo: "${metadata.subtitle}"
            - Tema cluster: "${pillarTopic}"
            - Keywords: ${strategy.targetKeywords.slice(0, 5).join(', ')}
            - Enlace requerido: <a href="/pillar/${pillarSlug}">${pillarTitle}</a>
            
            ESTRUCTURA (mínimo 800 palabras):
            <p><strong>Introducción</strong>: Gancho (2-3 párrafos)</p>
            <h2>Primera Sección</h2>
            <p>Contenido con ejemplos...</p>
            <ul><li>Puntos específicos</li></ul>
            <h2>Segunda Sección</h2>
            <p>Más desarrollo...</p>
            <h3>Subsección</h3>
            <p>Detalles...</p>
            <h2>Tercera Sección</h2>
            <p>Profundización...</p>
            <h2>Conclusión</h2>
            <p>Resumen + CTA suave</p>
            
            REGLAS:
            1. EXTENSIÓN: 800-1500 palabras
            2. SUBTÍTULOS: Mínimo 3-4 H2 y 1-2 H3
            3. SIN PLACEHOLDERS: Ejemplos completos, nunca "(empresa)" o "[dato]"
            4. KEYWORDS: Integradas naturalmente
            5. NO escribas: "Claro", "Aquí tienes", "Como experto"
            6. IMPORTANTE: NO incluyas el Título H1 ni el Subtítulo al principio. Empieza directo con el contenido.
            
            SALIDA: Solo HTML. Comienza con <p> o <h2>, termina con última etiqueta.
          `;

          const postContent = await generateContentSmart(postPrompt);

          // Limpieza exhaustiva del contenido (compatible con ES5)
          // Limpieza exhaustiva del contenido (compatible con ES5)
          let cleanContent = postContent
            .replace(/```html/gi, '')
            .replace(/```/g, '')
            // Eliminar H1 y Subtítulo porque ya se muestran en el frontend
            .replace(/<h1[^>]*>[\s\S]*?<\/h1>/gi, '')
            .replace(/<p class="lead"[^>]*>[\s\S]*?<\/p>/gi, '')
            // Limpieza de textos conversacionales
            .replace(/¡Entendido![\s\S]*?(?=<)/gi, '')
            .replace(/Aquí tienes[\s\S]*?(?=<)/gi, '')
            .replace(/Claro,?[\s\S]*?(?=<)/gi, '')
            .replace(/Como[\s\S]*?redactor[\s\S]*?(?=<)/gi, '')
            .replace(/Espero[\s\S]*$/gi, '')
            .trim();

          // Generar slug limpio (sin números)
          const postSlug = postTitle
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
            .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
            .replace(/\s+/g, '-') // Espacios a guiones
            .replace(/-+/g, '-') // Múltiples guiones a uno
            .replace(/(^-|-$)/g, ''); // Eliminar guiones al inicio/final

          // Generar tags automáticamente basados en keywords de la estrategia
          const postTags = strategy.targetKeywords.slice(0, 3); // Usar las 3 primeras keywords como tags

          try {
            await Post.create({
              title: postTitle,
              slug: postSlug,
              subtitle: metadata.subtitle,
              content: cleanContent,
              excerpt: metadata.excerpt,
              tags: postTags,
              status: 'published',
              seoTitle: metadata.seoTitle,
              seoDescription: metadata.seoDescription
            });
          } catch (error: any) {
            // Si hay error de slug duplicado, agregar sufijo numérico mínimo
            if (error.code === 11000) {
              const uniqueSlug = `${postSlug}-${Math.floor(Math.random() * 99)}`;
              await Post.create({
                title: postTitle,
                slug: uniqueSlug,
                subtitle: metadata.subtitle,
                content: cleanContent,
                excerpt: metadata.excerpt,
                tags: postTags,
                status: 'published',
                seoTitle: metadata.seoTitle,
                seoDescription: metadata.seoDescription
              });
            } else {
              throw error; // Re-lanzar si es otro tipo de error
            }
          }
        }
      }

      // 5. Actualizar estado de la estrategia
      strategy.status = 'generated';
      await strategy.save();
    }

    res.status(200).json({ message: 'Cluster generado con éxito', pillarPageId: newPillarPage._id });

  } catch (error: any) {
    console.error('Error building cluster:', error);
    res.status(500).json({ message: 'Error interno', error: error.message });
  }
}

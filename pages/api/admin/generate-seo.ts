import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import connectDB from '../../../lib/mongoose';
import Product from '../../../models/Product';
import Category from '../../../models/Category'; // Asegurarse de importar Category
import { getSearchTrends } from '../../../lib/keyword-research';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { productId, nombre: bodyNombre, descripcion: bodyDescripcion, categoria: bodyCategoria } = req.body;

  if (!productId && (!bodyNombre || !bodyDescripcion)) {
    return res.status(400).json({ message: 'Se requiere "productId" o "nombre" y "descripcion".' });
  }

  try {
    await connectDB();

    let nombre, descripcion, categoriaNombre;

    if (productId) {
      const product = await Product.findById(productId).populate('categoria');
      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      nombre = product.nombre;
      descripcion = product.descripcion;
      categoriaNombre = product.categoria ? (product.categoria as any).nombre : 'General';
    } else {
      nombre = bodyNombre;
      descripcion = bodyDescripcion;
      categoriaNombre = bodyCategoria || 'General';
    }

    // ¡NUEVO PASO! Se realiza la investigación de tendencias.
    const trends = await getSearchTrends(nombre, categoriaNombre);

    // Usar el agente inteligente de Gemini que gestiona la rotación de claves y el fallback de modelos.
    const { generateWithFallback } = await import('../../../lib/gemini-agent');

    const storeName = "Papelería Personalizada Kamaluso";

    let specializedInstructions = '';
    const lowerNombre = nombre.toLowerCase();
    const lowerCategoria = (categoriaNombre || '').toLowerCase();

    if (lowerNombre.includes('agenda') && lowerNombre.includes('2026')) {
      specializedInstructions = `
      **Instrucciones SEO de MÁXIMA prioridad para Agendas 2026:**
      - El objetivo es DOMINAR el posicionamiento en Google Uruguay para "agendas 2026" y términos relacionados.
      - **Keywords Obligatorias:** En 'seoKeywords', DEBES incluir una mezcla de estas variaciones: "agendas 2026 Uruguay", "comprar agenda 2026", "agendas personalizadas 2026", "planners 2026 Uruguay", "mejor agenda 2026", "agendas para profesionales 2026", "agendas para estudiantes Uruguay", "regalos empresariales fin de año".
      - **Enfoque del Contenido:**
        - 'seoDescription': Debe ser una llamada a la acción irresistible. Ejemplo: "Empieza a planificar tu éxito. Descubre las agendas 2026 personalizadas más completas de Uruguay. ¡Pide la tuya y haz que el 2026 sea tu año! Envíos a todo el país."
        - 'descripcionExtensa': Debe ser muy persuasiva. Estructúrala con subtítulos (<h3>) como "Planificación sin Esfuerzo para tu 2026", "Un Diseño que Inspira Productividad" y "El Regalo Corporativo Perfecto". Conecta las características del producto con los beneficios de la organización y el logro de metas.
        - 'puntosClave': Deben ser beneficios directos, no solo características. Ejemplo: "Planifica tu año completo, mes a mes" en lugar de "Vista mensual". "Diseño 100% a tu gusto" en lugar de "Personalizable".
      `;
    } else if (lowerNombre.includes('libreta') || lowerNombre.includes('cuaderno') || lowerCategoria.includes('libreta') || lowerCategoria.includes('cuaderno')) {
      specializedInstructions = `
      **Instrucciones SEO de alta prioridad para Libretas y Cuadernos:**
      - El objetivo es posicionar este producto para búsquedas de "libretas personalizadas" y "cuadernos corporativos" en Uruguay.
      - **Keywords Obligatorias:** En 'seoKeywords', DEBES incluir una mezcla de: "libretas personalizadas Uruguay", "cuadernos corporativos", "comprar libretas online Uruguay", "cuadernos para empresas con logo", "regalos empresariales originales", "merchandising para empresas Uruguay", "libretas para notas", "cuadernos de dibujo".
      - **Enfoque del Contenido:**
        - 'seoDescription': Debe resaltar la versatilidad. Ejemplo: "Desde la oficina a tus ideas personales. Descubre nuestras libretas y cuadernos personalizados en Uruguay. Calidad premium para tu marca o tu día a día. ¡Pide los tuyos!"
        - 'descripcionExtensa': Estructúrala con subtítulos (<h3>) como "La Herramienta Perfecta para tus Ideas", "Calidad que se Siente en cada Página" y "Eleva tu Marca con Cuadernos Corporativos". Enfócate en la calidad del papel, los tipos de tapa y las infinitas posibilidades de personalización para uso personal o empresarial.
        - 'puntosClave': Deben ser beneficios como "Ideal para notas, dibujos o journaling", "Personalización completa con tu logo o diseño", "Calidad premium, hojas que no traspasan".
      `;
    }

    // ¡NUEVO! Sección del prompt con las tendencias encontradas.
    const trendsPromptSection = `
      **Intel de Búsqueda en Tiempo Real:** He investigado las tendencias de búsqueda actuales en Uruguay para un producto como este. Esto es lo que encontré:
      - **Resumen de Tendencias:** ${trends.trendsSummary}
      - **Keywords Populares:** ${trends.keywords.join(', ')}
      
      **Misión Crítica:** Usa esta información de tendencias como tu guía principal para decidir el enfoque del contenido y las palabras clave a utilizar. El campo 'seoKeywords' debe inspirarse fuertemente en esta lista.
    `;

    const prompt = `
      Eres un experto de clase mundial en SEO para e-commerce y un copywriter de respuesta directa obsesionado con las ventas. Tu base de operaciones es Uruguay y tu cliente es "${storeName}".
      Tu única misión es crear contenido de producto que domine absolutamente los rankings de Google Uruguay para sus keywords objetivo y que convierta el máximo porcentaje de visitantes en compradores. Cada palabra debe tener un propósito: rankear o vender.

      **Tus Principios Inquebrantables:**
      1.  **Obsesión por el #1 en Google:** El contenido debe estar perfectamente optimizado. La keyword principal debe aparecer en el 'seoTitle', al inicio del 'seoDescription' y en el primer párrafo de la 'descripcionExtensa'.
      2.  **Copywriting Persuasivo (Framework AIDA):** La 'descripcionExtensa' debe seguir la estructura AIDA:
          - **Atención:** Un titular o primera frase que enganche al lector de inmediato.
          - **Interés:** Despertar la curiosidad destacando los aspectos únicos o más fascinantes del producto.
          - **Deseo:** Transformar el interés en deseo. Pinta una imagen mental vívida de cómo el producto mejora la vida del cliente. Enfócate en los beneficios emocionales (ej: la satisfacción de la organización, la alegría de dar un regalo único) no solo en las características.
          - **Acción:** Un llamado a la acción claro, precedido por un "Llamado al Valor" (ej: "Empieza a organizar tu éxito hoy. ¡Pide tu agenda ahora!").
      3.  **Inteligencia de Búsqueda en Tiempo Real:** He investigado las tendencias de búsqueda actuales en Uruguay para este producto. Esta es tu inteligencia de mercado. Úsala como guía principal para tu estrategia de keywords.
          - **Resumen de Tendencias:** ${trends.trendsSummary}
          - **Keywords Populares:** ${trends.keywords.join(', ')}
      4.  **Geo-localización y Confianza:** Menciona sutilmente que el taller está en "San José" y se realizan "envíos a todo el país" para generar confianza y mejorar el SEO local.

      ${specializedInstructions}
      
      **Producto a Optimizar:**
      - Nombre: ${nombre}
      - Descripción actual (usar como contexto, no para copiar): ${descripcion}
      - Categoría: ${categoriaNombre}

      Genera un JSON válido (sin texto adicional antes ni después del JSON) con la siguiente estructura. Rellena TODOS los campos con contenido de altísima calidad.

      {
        "seoTitle": "Título SEO (máx. 60 chars). Debe ser magnético para clics. Fórmula: [Keyword Principal] | [Beneficio Clave] | ${storeName}",
        "seoDescription": "Meta descripción (máx. 155 chars). Usa la keyword principal al inicio. Debe ser una mini-página de ventas que provoque curiosidad y termine con un llamado a la acción fuerte.",
        "descripcionBreve": "Un 'elevator pitch' de 1-2 frases. Debe generar un impacto inmediato y comunicar el valor principal del producto.",
        "puntosClave": ["Un array de 3 a 5 strings. Cada string debe ser un BENEFICIO directo y cuantificable (ej: 'Planifica tu año entero, sin olvidar nada' en vez de 'Vista anual')."],
        "descripcionExtensa": "Descripción detallada en HTML, aplicando el framework AIDA como se te indicó. Usa <h3> para subtítulos que resalten beneficios. Usa <strong> para palabras clave importantes.",
        "seoKeywords": ["Un array de 10-15 strings, basado en la inteligencia de mercado provista. Incluye una mezcla de keywords de alta competencia, 'long-tail' y preguntas que un cliente potencial haría."],
        "faqs": [
          {
            "question": "Genera una pregunta frecuente que un cliente indeciso haría antes de comprar.",
            "answer": "Genera una respuesta que elimine esa fricción, refuerce la confianza y empuje sutilmente hacia la venta."
          },
          {
            "question": "Genera una segunda pregunta frecuente sobre la personalización o el envío.",
            "answer": "Genera una respuesta clara, útil y que transmita un excelente servicio al cliente."
          }
        ],
        "useCases": [
          "Genera un caso de uso que lo posicione como el regalo perfecto para una ocasión específica.",
          "Genera otro caso de uso para un nicho de cliente específico (ej: 'El planner definitivo para emprendedoras en Uruguay').",
          "Genera un tercer caso de uso que demuestre su versatilidad y justifique su valor."
        ]
      }
    `;
    
    const geminiResponseText = await generateWithFallback(prompt);
    
    const cleanedText = geminiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
    let generatedContent;
    try {
      generatedContent = JSON.parse(cleanedText);
    } catch (jsonParseError) {
      console.error('Error al parsear la respuesta JSON de Gemini. Respuesta cruda:', cleanedText);
      throw new Error('La respuesta de Gemini no es un JSON válido.');
    }

    const responsePayload = {
      generatedContent,
      trends, // Devolvemos las tendencias para el frontend.
    };

    // Si se proveyó un productId, actualizamos el producto en la BD
    if (productId) {
      await Product.findByIdAndUpdate(productId, {
        seoTitle: generatedContent.seoTitle,
        seoDescription: generatedContent.seoDescription,
        descripcionBreve: generatedContent.descripcionBreve,
        puntosClave: generatedContent.puntosClave,
        descripcionExtensa: generatedContent.descripcionExtensa,
        seoKeywords: generatedContent.seoKeywords,
        faqs: generatedContent.faqs,
        useCases: generatedContent.useCases,
      });
      // Devolvemos solo un mensaje de éxito pero podríamos devolver el payload si el front lo necesitara
      return res.status(200).json({ message: `Producto "${nombre}" actualizado con éxito.`, trends });
    }

    // Si no, devolvemos el contenido y las tendencias para que el script externo/frontend lo maneje
    res.status(200).json(responsePayload);

  } catch (error: any) {
    console.error('Error generando contenido SEO:', error);
    const message = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error interno al generar el contenido', error: message });
  }
}
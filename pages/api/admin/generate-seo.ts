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

    // ¡NUEVO PASO! Análisis de Competencia
    const { analyzeCompetitors } = await import('../../../lib/competitor-research');
    const competitorAnalysis = await analyzeCompetitors(nombre, categoriaNombre);

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
      Eres el Director de Marketing Digital y Estratega SEO de "Kamaluso", la papelería personalizada líder en Uruguay.
      PERO TAMBIÉN eres un **Psicólogo de Ventas experto** (estilo Robert Cialdini + David Ogilvy).

      **TU DOBLE MISIÓN:**
      1.  **SEO (La Ciencia):** Rankear #1 en Google Uruguay para "${nombre}".
      2.  **CRO (El Arte):** Convertir visitantes en compradores obsesionados usando persuasión psicológica.

      **TUS HERRAMIENTAS PSICOLÓGICAS (ÚSALAS):**
      - **Prueba Social Implícita:** "Únete a las miles de personas organizadas..."
      - **Escasez/Urgencia (Sutil):** "Ediciones limitadas hechas a mano..."
      - **Autoridad:** "Diseñado por expertos en productividad..."
      - **Pertenencia:** "Para quienes se toman sus sueños en serio..."
      - **Justificación Lógica:** El cerebro compra por emoción pero justifica con lógica. Dales ambas.

      **INTELIGENCIA DE MERCADO (TENDENCIAS):**
      - **Resumen:** ${trends.trendsSummary}
      - **Keywords Hot:** ${trends.keywords.join(', ')}

      **INTELIGENCIA DE COMPETENCIA (TU VENTAJA):**
      ${competitorAnalysis}
      *Instrucción:* Ataca sus debilidades. Si ellos son "baratos", tú eres "inversión duradera". Si son "lentos", tú eres "envío flash".

      ${specializedInstructions}

      **INFORMACIÓN CLAVE DEL NEGOCIO KAMALUSO:**
      - **Personalización de Tapas:** Nuestras agendas, libretas y cuadernos tienen tapas 100% personalizables (diseño, colores, logos, nombres).
      - **Variedad de Interiores:** Ofrecemos la colección más amplia de Uruguay en interiores especializados (rayado, cuadriculado, grillas para bullet journal, hojas en blanco, calendarios mensuales/semanales, puntillado, etc.).
      - **Propuesta de Valor Única:** El cliente diseña la tapa a su gusto Y elige el interior que mejor se adapte a su uso específico.
      *Instrucción:* Cuando describas la personalización, enfatiza que "podés diseñar la tapa como quieras" y "elegir entre docenas de tipos de interior según tu necesidad".

      **REGLAS DE ORO PARA EL OUTPUT (CRÍTICO):**
      1. **CERO META-COMENTARIOS:** NO incluyas textos como "(justificación)", "(escasez)", "(prueba social)", etc. El output debe ser TEXTO FINAL para el cliente.
      2. **CERO INSTRUCCIONES EN EL TEXTO:** No expliques por qué escribiste algo. Solo escríbelo.
      3. **NATURALIDAD:** Las técnicas psicológicas deben ser invisibles en la lectura.
      


      **DATOS DEL PRODUCTO:**
      - Nombre: ${nombre}
      - Contexto base: ${descripcion}
      - Categoría: ${categoriaNombre}

      **FORMATO DE SALIDA (JSON PURO):**
      Genera un JSON válido con esta estructura exacta.

      {
        "seoTitle": "Título SEO (máx 60 chars). Fórmula: [Keyword Principal] + [Beneficio Emocional] | Kamaluso. Ej: 'Agenda 2026: Domina tu Tiempo con Estilo | Kamaluso'",
        "seoDescription": "Meta descripción (máx 155 chars). Debe ser un 'mini-anuncio' persuasivo. Usa verbos de acción y toca un punto de dolor.",
        "descripcionBreve": "Elevator pitch de 2 líneas. Enfócate en la TRANSFORMACIÓN que vive el cliente al usar el producto.",
        "puntosClave": [
          "Beneficio Psicológico 1 (ej: 'Siente la paz mental de tener todo bajo control')",
          "Beneficio Funcional 1 (ej: 'Papel de 100g que ama tu pluma')",
          "Beneficio de Estatus/Identidad (ej: 'El cuaderno que te distingue en la reunión')",
          "Beneficio de Urgencia/Exclusividad"
        ],
        "descripcionExtensa": "HTML puro. Escribe una CARTA DE VENTAS, no una descripción técnica. \n\n<p><strong>Gancho Emocional:</strong> Empieza con una pregunta o afirmación que toque una fibra sensible sobre organización o creatividad.</p>\n\n<h3>La Solución que Estabas Buscando</h3>\n<p>Presenta el producto como el héroe que resuelve ese problema.</p>\n\n<h3>Por qué te vas a Enamorar (Detalles)</h3>\n<p>Describe las características físicas pero tradúcelas a sensaciones (tacto, vista, durabilidad).</p>\n\n<h3>Más que una simple ${categoriaNombre}</h3>\n<p>Apela a la identidad del comprador (emprendedora, artista, estudiante de honor).</p>\n\n<p><strong>Tu Garantía de Felicidad:</strong> Menciona la calidad garantizada y la atención personalizada.</p>\n\n<p><strong>Llamada a la Acción (Cierre):</strong> ¡No esperes a que se agoten! Tu mejor versión empieza hoy.</p>",
        "seoKeywords": ["Array de 12-15 keywords. Mezcla: Keyword Principal, Long-tail, Preguntas y Keywords de Tendencia."],
        "faqs": [
          {
            "question": "Una pregunta que elimine una objeción de compra (ej: ¿El papel traspasa?)",
            "answer": "Respuesta honesta y tranquilizadora que resalte la calidad."
          },
          {
            "question": "Pregunta sobre personalización o envíos (fricción logística)",
            "answer": "Respuesta clara que venda la comodidad y rapidez del servicio."
          }
        ],
        "useCases": [
          "Caso de uso aspiracional 1",
          "Caso de uso aspiracional 2",
          "Caso de uso práctico 3"
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
      console.log('Guardando contenido generado en BD:', Object.keys(generatedContent));

      const updatedProduct = await Product.findByIdAndUpdate(productId, {
        seoTitle: generatedContent.seoTitle,
        seoDescription: generatedContent.seoDescription,
        descripcionBreve: generatedContent.descripcionBreve,
        puntosClave: generatedContent.puntosClave,
        descripcionExtensa: generatedContent.descripcionExtensa,
        seoKeywords: generatedContent.seoKeywords,
        faqs: generatedContent.faqs,
        useCases: generatedContent.useCases,
      }, { new: true }); // { new: true } devuelve el documento actualizado

      // Revalidar la página del producto para que los cambios se reflejen de inmediato
      if (updatedProduct && updatedProduct.slug) {
        try {
          await res.revalidate(`/productos/detail/${updatedProduct.slug}`);
          console.log(`Página revalidada: /productos/detail/${updatedProduct.slug}`);
        } catch (revalError) {
          console.error('Error al revalidar la página:', revalError);
          // No fallamos la request si la revalidación falla, pero lo logueamos
        }
      }
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
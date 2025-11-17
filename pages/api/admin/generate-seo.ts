import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import connectDB from '../../../lib/mongoose';
import Product from '../../../models/Product';
import Category from '../../../models/Category'; // Asegurarse de importar Category

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
      // Asumimos que 'categoria' es un objeto poblado con un campo 'nombre'
      categoriaNombre = product.categoria ? (product.categoria as any).nombre : 'General';
    } else {
      nombre = bodyNombre;
      descripcion = bodyDescripcion;
      categoriaNombre = bodyCategoria || 'General';
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ message: 'Falta la variable GEMINI_API_KEY en el servidor.' });
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const modelPro = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const modelFlash = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
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

    const prompt = `
      Eres un experto senior en SEO para e-commerce y copywriting persuasivo, con base en Uruguay. Tu cliente es "${storeName}", un taller en San José que realiza envíos a todo el país.
      Tu misión es crear contenido que posicione en Google Uruguay y convierta visitas en ventas.
      **Principios Clave que DEBES seguir:**
      1. **Geo-localización Estratégica:** Menciona que nuestro taller se encuentra en "San José" y que realizamos "envíos a todo el país". Esto genera confianza y mejora el SEO local.
      2. **Intención de Búsqueda:** Piensa en POR QUÉ alguien buscaría este producto. ¿Es un regalo? ¿Una solución a un problema de organización? ¿Una herramienta para su marca? La 'descripcionExtensa' debe responder a esa intención.
      ${specializedInstructions}
      Producto:
      - Nombre: ${nombre}
      - Descripción actual: ${descripcion}
      - Categoría: ${categoriaNombre}
      Genera un JSON válido (sin texto adicional antes ni después del JSON) con esta estructura. Es crucial que completes TODOS los campos del JSON.
      {
        "seoTitle": "Título SEO (máx. 60 caracteres). Fórmula: [Nombre del Producto] | [Categoría] | ${storeName}",
        "seoDescription": "Meta descripción atractiva (máx. 155 caracteres). Incluye llamado a la acción y orientación local (Uruguay, regalos empresariales). DEBE terminar con una llamada a la acción clara y enérgica como '¡Pide la tuya ahora!' o 'Descúbrela aquí'.",
        "descripcionBreve": "Resumen comercial de 1 o 2 frases que invite a comprar o regalar.",
        "puntosClave": ["Un array de 3 a 5 strings, donde cada string es un beneficio o característica clave."],
        "descripcionExtensa": "Descripción detallada en formato HTML compatible con texto enriquecido (<p>, <strong>, <ul>, <li>, <h3>). Resalta personalización, calidad y opciones para empresas (logo, regalos corporativos, etc.).",
        "seoKeywords": ["Un array de 10 strings. Debe incluir: 3 keywords de alta competencia (ej: 'agendas Uruguay'), 4 de 'long-tail' (ej: 'comprar agenda con tapa dura en Montevideo'), y 3 en formato de pregunta (ej: '¿cuál es la mejor agenda para estudiantes?')."],
        "faqs": [
          {
            "question": "Genera una pregunta frecuente realista y útil sobre este producto.",
            "answer": "Genera una respuesta clara, concisa y vendedora a esa pregunta."
          },
          {
            "question": "Genera una segunda pregunta frecuente, diferente y complementaria.",
            "answer": "Genera su correspondiente respuesta."
          }
        ],
        "useCases": [
          "Genera un caso de uso o idea creativa para este producto (ej: 'Perfecto para regalar en eventos corporativos').",
          "Genera otro caso de uso para un tipo de cliente diferente (ej: 'Ideal para estudiantes que buscan organizarse').",
          "Genera un tercer caso de uso que destaque su versatilidad."
        ]
      }
    `;

    const isQuotaOrRateError = (err: any) => {
      if (!err) return false;
      const msg = String(err?.message || '').toLowerCase();
      const status = err?.status || err?.code || null;
      return status === 429 || status === 403 || status === 402 || msg.includes('quota') || msg.includes('limit') || msg.includes('rate') || msg.includes('insufficient');
    };

    const generateWithModelAndRetries = async (modelInstance: any, promptText: string, maxRetries = 3) => {
      let attempts = 0;
      let lastError: any = null;
      while (attempts < maxRetries) {
        try {
          const result = await modelInstance.generateContent(promptText);
          return (await result.response).text();
        } catch (err: any) {
          attempts++;
          lastError = err;
          console.warn(`Intento ${attempts} fallido para modelo. Mensaje:`, err?.message || err);
          if (attempts >= maxRetries) break;
          await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempts - 1)));
        }
      }
      throw lastError;
    };

    let geminiResponseText = '';
    try {
      geminiResponseText = await generateWithModelAndRetries(modelPro, prompt, 3);
    } catch (errPro: any) {
      console.warn('gemini-2.5-pro falló:', errPro?.message || errPro);
      if (isQuotaOrRateError(errPro) || true) {
        try {
          geminiResponseText = await generateWithModelAndRetries(modelFlash, prompt, 3);
        } catch (errFlash: any) {
          console.error('gemini-2.5-flash también falló:', errFlash?.message || errFlash);
          throw new Error(`Fallaron PRO y FLASH: ${errFlash?.message || errFlash}`);
        }
      } else {
        throw errPro;
      }
    }

    const cleanedText = geminiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
    let generatedContent;
    try {
      generatedContent = JSON.parse(cleanedText);
    } catch (jsonParseError) {
      console.error('Error al parsear la respuesta JSON de Gemini. Respuesta cruda:', cleanedText);
      throw new Error('La respuesta de Gemini no es un JSON válido.');
    }

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
      return res.status(200).json({ message: `Producto "${nombre}" actualizado con éxito.` });
    }

    // Si no, devolvemos el contenido para que el script externo lo maneje
    res.status(200).json(generatedContent);

  } catch (error: any) {
    console.error('Error generando contenido SEO:', error);
    const message = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error interno al generar el contenido', error: message });
  }
}
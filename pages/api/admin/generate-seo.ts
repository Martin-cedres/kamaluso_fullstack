// /pages/api/generate-seo.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Solo aceptar método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { nombre, descripcion, categoria } = req.body;

  // Validar datos mínimos
  if (!nombre || !descripcion) {
    return res.status(400).json({ message: 'Nombre y descripción son requeridos' });
  }

  try {
    // Verificar API Key
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ message: 'Falta la variable GEMINI_API_KEY en el servidor.' });
    }

    // Inicializar cliente de Gemini
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Nombre de la tienda
    const storeName = "Papelería Personalizada Kamaluso";

    // Lógica para detectar el tipo de producto y añadir instrucciones especiales
    let specializedInstructions = '';
    const lowerNombre = nombre.toLowerCase();
    const lowerCategoria = categoria.toLowerCase();

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

    // PROMPT SEO OPTIMIZADO para atraer tanto clientes finales como empresas
    const prompt = `
      Eres un experto en SEO para e-commerce y copywriting persuasivo, con base en Uruguay. Tu cliente es "${storeName}", un taller en San José que realiza envíos a todo el país.
      Tu misión es crear contenido que posicione en Google Uruguay y convierta visitas en ventas.

      **Principios Clave que DEBES seguir:**
      1. **Geo-localización Estratégica:** Menciona que nuestro taller se encuentra en "San José" y que realizamos "envíos a todo el país". Esto genera confianza y mejora el SEO local.
      2. **Intención de Búsqueda:** Piensa en POR QUÉ alguien buscaría este producto. ¿Es un regalo? ¿Una solución a un problema de organización? ¿Una herramienta para su marca? La 'descripcionExtensa' debe responder a esa intención.
      3. **Estrategia de Keywords Mixta:** En 'seoKeywords', incluye una mezcla de keywords de alta competencia (ej: "papelería personalizada") y de nicho o "long-tail" (ej: "cuaderno con logo para eventos en Uruguay").

      Mantén un tono natural, inspirador, profesional y alegre.
      
      ${specializedInstructions}

      Producto:
      - Nombre: ${nombre}
      - Descripción actual: ${descripcion}
      - Categoría: ${categoria || 'General'}

      Genera un JSON válido (sin texto adicional antes ni después del JSON) con esta estructura. Es crucial que completes TODOS los campos del JSON.
      {
        "seoTitle": "Título SEO (máx. 60 caracteres). Fórmula: [Nombre del Producto] | [Categoría] | ${storeName}",
        "seoDescription": "Meta descripción atractiva (máx. 155 caracteres). Incluye llamado a la acción y orientación local (Uruguay, regalos empresariales).",
        "descripcionBreve": "Resumen comercial de 1 o 2 frases que invite a comprar o regalar.",
        "puntosClave": ["Un array de 3 a 5 strings, donde cada string es un beneficio o característica clave."],
        "descripcionExtensa": "Descripción detallada en formato HTML compatible con texto enriquecido (<p>, <strong>, <ul>, <li>, <h3>). Resalta personalización, calidad y opciones para empresas (logo, regalos corporativos, etc.).",
        "seoKeywords": ["Un array de 7 a 10 strings, donde cada string es una palabra clave relevante para SEO. Incluye términos como regalos empresariales, papelería personalizada Uruguay, agendas corporativas, branding, merchandising, San José."]
      }
    `;

    // Configuración de reintentos
    const MAX_RETRIES = 3;
    let attempts = 0;
    let geminiResponseText = '';

    while (attempts < MAX_RETRIES) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        geminiResponseText = response.text();
        break; // Éxito, salir del bucle
      } catch (retryError: any) { // Usar 'any' para el tipo de error si no hay un tipo más específico
        attempts++;
        console.warn(`Intento ${attempts} fallido al llamar a Gemini. Reintentando...`, retryError.message);
        if (attempts >= MAX_RETRIES) {
          throw new Error(`Fallo al generar contenido con Gemini después de ${MAX_RETRIES} intentos: ${retryError.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1))); // Espera 1s, 2s, 4s...
      }
    }

    // Limpiar y parsear JSON con manejo robusto
    const cleanedText = geminiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
    let generatedContent;
    try {
      generatedContent = JSON.parse(cleanedText);
    } catch (jsonParseError) {
      console.error('Error al parsear la respuesta JSON de Gemini. Respuesta cruda:', cleanedText);
      throw new Error('La respuesta de Gemini no es un JSON válido. Por favor, inténtalo de nuevo.');
    }

    // Devolver contenido generado
    res.status(200).json(generatedContent);

  } catch (error) {
    console.error('Error generando contenido SEO:', error);
    const message = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error interno al generar el contenido', error: message });
  }
}

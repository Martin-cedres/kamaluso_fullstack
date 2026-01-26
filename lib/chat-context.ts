import { shippingInfo } from './data/shipping';
import { faqsData } from './data/faqs';
import { getAllProductsForContext } from './services/product-service';

export async function buildSystemPrompt(relevantProducts?: any[], intent: string = 'indefinido') {
    // 1. Obtener productos dinámicos con más detalle (Misma lógica anterior)
    let productsContext = "No se pudo cargar el catálogo de productos.";
    try {
        const products = relevantProducts && relevantProducts.length > 0
            ? relevantProducts
            : await getAllProductsForContext();

        productsContext = products.map((p: any) => {
            const points = p.keyPoints && p.keyPoints.length > 0 ? " Detalles: " + p.keyPoints.join(", ") : "";
            const desc = p.description ? String(p.description) : "";
            const longD = p.longDescription ? String(p.longDescription) : "";
            const longDescSnippet = longD ? " Info Extra: " + longD.substring(0, 300) : "";
            let socialProof = "";
            if (p.rating && p.rating >= 4.5 && p.reviewCount > 0) {
                socialProof = ` [⭐ FAVORITO: ${p.rating}/5 estrellas (${p.reviewCount} opiniones)]`;
            }
            const productLink = `[Ver ${p.name}](https://www.papeleriapersonalizada.uy/productos/detail/${p.slug})`;
            return "- " + p.name + " (" + p.category + "): $U " + p.price + "." + socialProof + points + longDescSnippet + ". " + desc.substring(0, 150) + "... (" + productLink + ")";
        }).join('\n');
    } catch (error) {
        console.error("Error cargando productos para contexto:", error);
    }

    // LÓGICA CONDICIONAL SEGÚN INTENCIÓN
    const isTransactional = ['compra', 'duda_producto', 'envios'].includes(intent);

    const salesInstructions = [
        '### **TU PERSONA: Asistente de Ventas Experta y Apasionada de Kamaluso**',
        '**Estilo de Comunicación:**',
        '- **Cercanía y Calidez:** ¡Imagina que estás atendiendo a una amiga en tu propia tienda! Usa un tono alegre, servicial y un poco informal. Los emojis son clave para mostrar tu personalidad 😊✨.',
        '- **Concisión Efectiva:** Tus respuestas deben ser como un tweet: cortas, directas y valiosas. **Apunta a 2-3 frases (máximo 50 palabras).** El objetivo es informar rápido y llevar al cliente al siguiente paso.',
        '- **Pasión por el Detalle:** Eres una experta en papelería personalizada. Habla con confianza sobre la calidad y las opciones de diseño.',
        '',
        '**TU MISIÓN: Convertir Dudas en Ventas**',
        'Tu objetivo no es solo responder, es inspirar y guiar al cliente hacia la compra. Debes facilitarles el camino y mostrarles por qué Kamaluso es la mejor opción.',
        '',
        '### **REGLAS DE ORO (INQUEBRANTABLES):**',
        '**1. CERO INVENCIONES:** NUNCA inventes precios, detalles o stock. Si no sabes algo, di con amabilidad: "¡Qué buena pregunta! Permíteme consultarlo con el equipo para darte el dato exacto" y ofrece el link a WhatsApp.',
        '**2. ENLACES SIEMPRE:** Cada vez que menciones un producto o categoría, DEBES incluir el link Markdown para que el cliente pueda hacer clic. Es la acción más importante.',
        '**3. RECOMENDACIÓN BAJO DEMANDA:** **NO** sugieras otros productos a menos que el cliente te lo pida explícitamente (ej: "¿qué más tienes?", "¿me recomiendas algo?"). Si lo hace, recomienda 1-2 productos RELEVANTES de tu contexto, priorizando los favoritos (⭐).',
    ].join('\n');

    const supportInstructions = [
        '### **PERSONA: Eres el asistente experto y empático de Kamaluso.**',
        'Tu misión es resolver el problema del cliente, asegurándote de que se sienta escuchado y ayudado.',
        '',
        '### **LAS 4 REGLAS DE ORO (INQUEBRANTABLES):**',
        '**1. Escucha y Valida:** Empieza reconociendo el problema del cliente. Ej: "Lamento mucho que hayas tenido este inconveniente", "Entiendo tu frustración".',
        '**2. Ofrece Soluciones, no Excusas:** Céntrate en el siguiente paso. La solución principal casi siempre será contactar a un humano. No intentes resolver problemas complejos de logística o calidad tú mismo.',
        '**3. WhatsApp es Prioridad:** La llamada a la acción principal es dirigir al cliente a WhatsApp para una atención personalizada. Usa SIEMPRE este formato: "[Escríbenos por WhatsApp](https://wa.me/59898615074)". El número oficial de Kamaluso es **098615074**; proporciónalo siempre que el cliente lo pida o sea necesario para concretar la venta.',
        '**4. Tono Kamaluso:** Mantén un tono calmado, profesional y muy empático. Tu objetivo es transformar una mala experiencia en una positiva.'
    ].join('\n');

    const instructions = isTransactional ? salesInstructions : supportInstructions;

    // 2. Construir Prompt Base
    const promptParts = [
        instructions,
        '',
        '## Información Crítica de la Empresa (para tu referencia)',
        '- **Taller y Retiros:** San José de Mayo (calle Massini 136).',
        '- **Envíos a Montevideo:** Por COTMI o Agencia.',
        '- **Formatos de Diseño:** Aceptamos JPG/PDF en alta calidad.',
        '- **Garantía de Calidad:** Si cometemos un error, reponemos el producto sin costo.',
        '',
        '## Catálogo de Productos para tu Contexto Actual',
        productsContext,
        '',
        '## FAQs Resumidas (Preguntas Frecuentes)',
        faqsData.map(f => 'P: ' + f.question + ' R: ' + f.answer).join('\n').substring(0, 1000),
        '',
    ];

    return promptParts.join('\n');
}

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
    const isSupport = ['reclamo', 'otro'].includes(intent);

    console.log(`🧠 Generando Prompt para Intención: ${intent} (Transactional: ${isTransactional}, Support: ${isSupport})`);

    let instructions = [];

    if (isTransactional) {
        // MODO TWEET + LINK OBLIGATORIO
        instructions = [
            '## MODO: VENTA Y RESPUESTA RÁPIDA 🚀',
            '1. **BREVEDAD EXTREMA:** Máximo 40-50 palabras. Ve al grano.',
            '2. **LINKING OBLIGATORIO:** DEBES incluir un link Markdown a `/envios`, `/productos` o `/regalos-empresariales`.',
            '3. **Formato:** Afirmación -> Dato -> Link.',
            '4. **Ejemplo:** "Sí, el envío demora 48hs. Mira info aquí: [Política de Envíos](/envios)."',
        ];
    } else {
        // MODO SOPORTE / EMPATÍA
        instructions = [
            '## MODO: SOPORTE Y RESOLUCIÓN 🛡️',
            '1. **PRIORIDAD:** Claridad, empatía y resolución.',
            '2. **Extensión:** Puedes explayarte un poco más para explicar bien (máximo 3-4 oraciones).',
            '3. **Links:** Opcionales. Úsalos solo si ayudan. SIEMPRE usa el formato Markdown para enlaces.',
            '4. **WhatsApp Link:** Cuando sugieras contactar por WhatsApp, usa SIEMPRE este formato: "[Escríbenos por WhatsApp](https://wa.me/59898615074)". No muestres el número de teléfono directamente ni uses la frase "Ver Link".',
            '5. **Tono:** Calma al usuario, asegura que hay un equipo humano detrás.',
            '6. **Ejemplo:** "Lamento el inconveniente. [Escríbenos por WhatsApp](https://wa.me/59898615074) para solucionarlo ya mismo."',
        ];
    }

    // 2. Construir Prompt Base
    const promptParts = [
        'Eres "Kamaluso Bot", asistente de papelería.',
        `Tu misión actual es: ${isTransactional ? 'Responder RÁPIDO y VENDER.' : 'Resolver problemas con EMPATÍA.'}`,
        '',
        ...instructions,
        '',
        '## Información Crítica (Resumida)',
        '- **Taller:** San José de Mayo (Retiros calle Massini 136).',
        '- **Mvd:** Envíos por COTMI o Agencia.',
        '- **Diseños:** JPG/PDF alta calidad.',
        '- **Garantía:** Reposición gratis si fallamos.',
        '',
        '## Catálogo Actualizado',
        productsContext,
        '',
        '## FAQs Resumidas',
        faqsData.map(f => 'P: ' + f.question + ' R: ' + f.answer).join('\n').substring(0, 1000), // Limitamos contexto para ahorrar tokens y evitar verborragia
        '',
        'RECUERDA: MÁXIMO 2 FRASES. LINK SIEMPRE.',
    ];

    return promptParts.join('\n');
}

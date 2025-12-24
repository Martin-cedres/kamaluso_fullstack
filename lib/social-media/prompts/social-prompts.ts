// Prompts especializados para generación de contenido en redes sociales

interface Product {
    nombre: string;
    descripcionBreve?: string;
    descripcionExtensa?: string;
    puntosClave?: string[];
    precio?: number;
    basePrice?: number;
    categoria?: string;
}

export interface SocialPromptOptions {
    platform: 'facebook' | 'instagram';
    product: Product;
    tone?: 'professional' | 'casual' | 'promotional';
}

export const generateSocialPrompt = (options: SocialPromptOptions): string => {
    const { platform, product } = options;

    const baseContext = `
Eres el especialista en redes sociales de Papelería Personalizada Kamaluso (papeleriapersonalizada.uy).

PRODUCTO:
- Nombre: ${product.nombre}
- Categoría: ${product.categoria || 'Papelería personalizada'}
- Precio: $U ${product.precio || product.basePrice}
${product.descripcionBreve ? `- Descripción: ${product.descripcionBreve}` : ''}
${product.puntosClave?.length ? `- Puntos clave: ${product.puntosClave.join(', ')}` : ''}

CONTEXTO DEL NEGOCIO:
- Marca: Papelería Personalizada Kamaluso
- Ubicación: San José de Mayo, Uruguay
- Diferenciador: Personalización real, calidad artesanal premium
- Materiales: Papel 80g (no transparenta), Tapas duras con laminado resistente, Espiral metálico
- Envíos: Todo Uruguay (DAC, Correo Uruguayo, COTMI)
- Producción: Hasta 5 días hábiles
- Tono: VOSEO URUGUAYO (buscás, tenés, llevate)
`;

    if (platform === 'facebook') {
        return baseContext + `
PLATAFORMA: Facebook
OBJETIVO: Post conversacional que invite al engagement y las ventas

FORMATO:
- Longitud: 40-80 palabras (2-3 párrafos cortos)
- Tono: Conversacional, cercano, persuasivo pero no agresivo
- Estructura:
  1. Gancho inicial (pregunta o afirmación que llame la atención)
  2. Beneficio principal del producto (traducir característica a beneficio emocional)
  3. CTA claro y directo (ej: "Pedilo hoy", "Conocé más")
- Emojis: Usar 2-3 emojis relevantes de forma natural
- Voseo obligatorio: "buscás", "tenés", "te gusta", "llevate"

HASHTAGS:
- Cantidad: 3-5 hashtags máximo (Facebook no depende tanto de hashtags)
- Mix: 1-2 de marca (#Kamaluso, #PapeleriaPersonalizada) + 2-3 temáticos (#AgendaPersonalizada, #Uruguay)

SALIDA REQUERIDA (JSON):
{
  "caption": "Texto del post de 40-80 palabras con emojis y voseo uruguayo",
  "hashtags": ["#Kamaluso", "#PapeleriaPersonalizada", "#Uruguay", "#ProductoRelevante"],
  "cta": "Texto breve del llamado a la acción (ej: 'Pedilo hoy 👉 Link en comentarios')"
}

IMPORTANTE:
- NO usar "tú" ni español neutro, SOLO voseo uruguayo
- NO usar "increíble", "fantástico", "único en su clase" (muy genérico)
- SÍ usar "práctico", "durable", "premium", "personalizado", "a medida"
- Relacionar SIEMPRE características con beneficios prácticos o emocionales
`;
    } else {
        // Instagram
        return baseContext + `
PLATAFORMA: Instagram
OBJETIVO: Caption corto, visual-first, que invite a la interacción

FORMATO:
- Longitud: 100-150 caracteres MÁXIMO (Instagram es visual, el caption es secundario)
- Tono: Casual, aspiracional, directo
- Estructura:
  1. Emoji inicial relevante
  2. Beneficio principal en una frase corta
  3. Pregunta de engagement o CTA breve
- Emojis: Usar 3-5 emojis de forma estratégica
- Voseo obligatorio: "buscás", "tenés", "te gusta"

HASHTAGS:
- Cantidad: 8-15 hashtags (crítico para alcance en IG)
- Mix balanceado:
  * 2-3 de marca (#Kamaluso, #PapeleriaPersonalizada, #PapeleriaUruguay)
  * 3-5 temáticos específicos (#AgendaPersonalizada, #LibretaPersonalizada, #RegalosPersonalizados)
  * 3-5 populares/amplios (#Papeleria, #Uruguay, #Productividad, #Organizacion)
  * 1-2 locales (#SanJose, #UruguayEmprendedor)

SALIDA REQUERIDA (JSON):
{
  "caption": "Emoji + texto corto (100-150 chars) + pregunta/CTA con voseo uruguayo",
  "hashtags": [
    "#Kamaluso",
    "#PapeleriaPersonalizada",
    "#AgendaPersonalizada",
    "#Uruguay",
    "#Papeleria",
    "#RegalosPersonalizados",
    "#Productividad",
    "#DisenioUruguay",
    "... (hasta 15 hashtags relevantes)"
  ]
}

IMPORTANTE:
- Caption MUY CORTO (la imagen habla)
- Hashtags son TU ARMA PRINCIPAL en Instagram para alcance
- NO usar "tú", SOLO voseo uruguayo
- Pregunta de engagement al final para fomentar comentarios
`;
    }
};

// Función para generar contenido con Gemini AI
export const generateSocialContentWithAI = async (
    options: SocialPromptOptions
): Promise<{ caption: string; hashtags: string[]; cta?: string }> => {
    const prompt = generateSocialPrompt(options);

    // Usar el sistema de rotación de claves existente
    const { generateContentSmart } = await import('../../gemini-client');

    const finalPrompt = prompt + '\n\nResponde SOLO con el JSON, sin explicaciones ni markdown.';

    const rawText = await generateContentSmart(finalPrompt);

    // Limpiar markdown si viene con ```json
    const cleanText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
        const parsed = JSON.parse(cleanText);
        return {
            caption: parsed.caption || '',
            hashtags: parsed.hashtags || [],
            cta: parsed.cta
        };
    } catch (error) {
        console.error('Error parseando respuesta de Gemini:', rawText);
        throw new Error('No se pudo parsear la respuesta de IA');
    }
};

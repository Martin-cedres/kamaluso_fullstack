# Social Media Orchestrator Skill

Esta habilidad permite al asistente coordinar y generar contenido persuasivo para las redes sociales de Kamaluso (Instagram y Facebook), alineado con el tono de marca y los objetivos comerciales.

## Propósito
- Crear copys (captions) optimizados para Instagram y Facebook.
- Generar listas de hashtags estratégicos para maximizar el alcance local en Uruguay.
- Adaptar las características técnicas de los productos (papel 80g, tapas duras, producción local) en beneficios emocionales y prácticos.
- Mantener la consistencia del **Voseo Uruguayo**.

## Directrices de Plataforma

### 1. Instagram (Aspiracional y Directo)
- **Longitud**: Corta (100-150 caracteres). La imagen es la protagonista.
- **Estructura**: Emoji inicial → Beneficio principal en una frase → Pregunta de engagement o CTA breve.
- **Hashtags**: Cruciales (8-15). Mix balanceado entre marca, temática, populares y locales (#SanJose, #Uruguay).
- **Voseo**: Obligatorio ("Buscás", "Tenés", "Llevate").

### 2. Facebook (Conversacional e Informativo)
- **Longitud**: Media (40-80 palabras).
- **Estructura**: Gancho → Beneficio detallado → CTA directo.
- **Hashtags**: Pocos (3-5). Menos críticos que en IG.
- **Voseo**: Obligatorio.

## Contexto de Marca (Key Selling Points)
- **Ubicación**: San José de Mayo, Uruguay.
- **Tiempos**: Producción en hasta 5 días hábiles.
- **Calidad**: Papel 80g (no transparenta), Tapas duras con laminado resistente.
- **Logística**: DAC, Correo Uruguayo, COTMI.

## Instrucciones para el Agente
1. Al generar contenido para un nuevo producto o blog, consultá siempre `lib/social-media/prompts/social-prompts.ts` para asegurar la paridad con la lógica del sistema.
2. Usá `VOSEO URUGUAYO` exclusivamente. Evitá el español neutro o el "tú".
3. Si el usuario pide una campaña, proponé un calendario que combine:
   - Posts de Producto (venta directa).
   - Posts Educativos/SEO (curiosidades del papel 80g, ventajas de proveedores locales).
   - Posts de interacción (preguntas sobre organización).

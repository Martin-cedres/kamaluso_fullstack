---
description: Especialista en optimización de prompts para Google Gemini y gestión de integración con IA
---

# Skill: AI Prompt Engineer

## Propósito
Esta habilidad guía al agente para optimizar prompts de IA, gestionar la integración con Google Gemini, manejar límites de tokens, implementar estrategias de fallback y asegurar la calidad de los outputs generados por IA.

## Arquitectura del Sistema de IA en Kamaluso

### 1. Cliente Centralizado
- **Ubicación**: `lib/gemini-client.ts`
- **Función Wrapper**: `lib/gemini-agent.ts` → `generateWithFallback()`
- **Modelos Disponibles**:
  - **FLASH**: `gemini-2.5-flash` (PRIORIDAD 1 - modelo principal)
  - **PRO**: `gemini-2.5-pro` (PRIORIDAD 2 - fallback de emergencia, actualmente no funcional)
  - **VISION**: Para análisis de imágenes (usa las mismas claves)

### 2. Configuración de Claves
```env
# Múltiples claves separadas por comas para rotación automática
GEMINI_PRO_API_KEYS=clave1,clave2,clave3
GEMINI_FLASH_API_KEYS=clave1,clave2
```

### 3. Flujo de Resiliencia
**ACTUALIZADO:** Prioridad cambiada debido a que las claves PRO no están funcionando.

1. Intenta con `gemini-2.5-flash` usando primera clave FLASH
2. Si falla por cuota → Rota a siguiente clave FLASH
3. Si todas las claves FLASH fallan → Cambia a `gemini-2.5-pro` (fallback de emergencia)
4. Rota entre claves PRO
5. Solo lanza error si todas las opciones fallan

## Principios de Optimización de Prompts

### 1. Contexto Específico del Negocio
Siempre incluir en los prompts:
- **Ubicación**: San José de Mayo, Uruguay
- **Público Objetivo**: Ver `seo-expert` skill para diferenciar entre B2B (Sublimación) y B2C (Regalos)
- **USPs**: Tapa dura, papel 80g, laminado resistente, producción local
- **Voseo Uruguayo**: OBLIGATORIO usar "tenés", "buscás", "pedí"

### 2. Limitaciones de Tokens
- **Modelo PRO**: ~30K tokens de input, ~8K de output
- **Modelo FLASH**: ~1M tokens de input, ~8K de output
- **Estrategia**: Si el contexto es muy grande (ej: todo el catálogo de productos), usar FLASH directamente o fragmentar

### 3. Estructura de Prompts Efectivos

#### Para Contenido SEO:
```
ROL: Experto en SEO para e-commerce uruguayo
CONTEXTO: [Datos del producto + categoría + productos relacionados]
TAREA: Generar [título/descripción/keywords]
RESTRICCIONES:
- Voseo uruguayo obligatorio
- [Si NO es sublimación] PROHIBIDO mencionar "sublimación"
- Máximo X caracteres
- Incluir keyword principal: [keyword]
OUTPUT: Formato JSON {seoTitle, metaDescription, keywords}
```

#### Para Análisis Multimodal:
```typescript
const imagePart = await urlToGoogleGenerativeAIPart(imageUrl);
const prompt = [
  "Sos un experto en e-commerce de papelería personalizada.",
  "Describí esta imagen del producto para el alt-text.",
  "Contexto: Es un [tipo de producto] de Kamaluso.",
  "Usá voseo uruguayo y destacá características visibles.",
  imagePart
];
```

## Casos de Uso en Kamaluso

### 1. Generación de SEO de Productos
- **API**: `pages/api/admin/generate-seo.ts`
- **Características**: Prompts dinámicos según categoría, fallback automático
- **Referencia**: `lib/prompts.ts` para plantillas base

### 2. Generación de Alt-Text
- **API**: `pages/api/admin/generate-alt-text.ts`
- **Modelo**: Usa `gemini-2.5-flash-latest` con visión
- **Input**: Imagen + contexto del producto

### 3. Topic Clusters (Enlazado Interno)
- **API**: `pages/api/admin/clusters/generate-links.ts`
- **Flujo**: Análisis de contenido → Sugerencias → Revisión humana → Publicación
- **Contexto Grande**: Incluye página pilar + todos los posts + productos del cluster

### 4. Blog Content Pipeline
- **APIs**:
  - `generate-ideas.ts`: 10 ideas relacionadas con productos
  - `generate-outline.ts`: Estructura SEO del artículo
  - `optimize-post.ts`: Inserción de enlaces internos + pulido

## Mejores Prácticas

### 1. Validación de Output
```typescript
try {
  const result = await generateWithFallback(prompt);
  const parsed = JSON.parse(result);
  
  // Validar estructura
  if (!parsed.seoTitle || !parsed.metaDescription) {
    throw new Error("Output incompleto de IA");
  }
  
  // Validar voseo
  if (parsed.seoTitle.includes("tienes") || parsed.seoTitle.includes("buscas")) {
    console.warn("⚠️ La IA no usó voseo uruguayo");
  }
  
  return parsed;
} catch (error) {
  // Fallback manual o reintentar con prompt más explícito
}
```

### 2. Manejo de Errores Específicos
- **429 (Quota Exceeded)**: El sistema rota automáticamente
- **400 (Bad Request)**: Revisar tamaño del prompt o formato de imagen
- **500 (API Error)**: Verificar claves en `.env.local`

### 3. Testing de Calidad
Antes de aprobar un cambio en prompts:
1. Probar con al menos 3 productos de categorías diferentes
2. Verificar que se use voseo
3. Confirmar que no se mencione "sublimación" en productos B2C
4. Validar longitud máxima de caracteres

### 4. Optimización de Costos
**NOTA:** Ahora FLASH es el modelo principal, por lo que estas guías se invierten.

- FLASH es gratuito y el modelo por defecto para todas las tareas
- Usar PRO solo si estás seguro de que las claves vuelven a funcionar y necesitas mayor calidad
- FLASH es adecuado para: alt-texts, SEO, topic clusters, blog, y la mayoría de tareas
- El sistema ya está optimizado para usar el modelo más económico primero

## Scripts de Utilidad

### Probar Conexión y Claves
```bash
node scripts/test-gemini-keys.js
```

### Enriquecer Keywords Masivamente
```bash
npx ts-node scripts/enrich-keywords.ts
```

## Recursos Relacionados
- [Cliente Gemini](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/lib/gemini-client.ts)
- [Prompts Base](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/lib/prompts.ts)
- [Documentación IA](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/AI_README.md)
- [SEO Expert Skill](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/.agent/skills/seo-expert/SKILL.md)

## Checklist para Nuevas Integraciones de IA

Cuando agregues una nueva funcionalidad que use IA:

- [ ] ¿Importaste `generateWithFallback` de `lib/gemini-agent`?
- [ ] ¿El prompt incluye contexto específico de Kamaluso?
- [ ] ¿Especificaste el formato de output esperado (JSON/texto plano)?
- [ ] ¿Agregaste validación del output?
- [ ] ¿Manejaste el caso de error total (todas las claves fallan)?
- [ ] ¿El contenido generado usa voseo uruguayo?
- [ ] ¿Si es contenido B2C, verificaste que no mencione "sublimación"?
- [ ] ¿Probaste con al menos 3 casos diferentes?

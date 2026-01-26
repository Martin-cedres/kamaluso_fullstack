# Database & Sync Guard Skill

Esta habilidad actúa como un guardián de la integridad de los datos en Kamaluso, asegurando que las operaciones de base de datos no rompan relaciones críticas ni degraden el SEO.

## Propósito
- Prevenir la eliminación accidental de productos o artículos vinculados en clusters.
- Asegurar que los cambios en slugs se propaguen o generen las redirecciones necesarias.
- Validar que los metadatos SEO (títulos, descripciones) se mantengan sincronizados entre productos y páginas pilar.
- Mantener estándares de seguridad en la conexión a MongoDB.

## Reglas de Oro
1. **Borrado Lógico sobre Físico**:
   - En lugar de `deleteOne`, preferí cambiar el `status` a `'inactivo'`. Solo eliminá físicamente si es estrictamente necesario y tras verificar referencias.
   
2. **Chequeo de Integridad**:
   - Antes de una operación crítica sobre un `Product` o `Post`, verificá su presencia en:
     - `PillarPage.clusterProducts` o `clusterPosts`.
     - `Post.content` (como enlaces directos).
     - `SeoStrategy` (objetivos de campaña).

3. **Sincronización SEO**:
   - Si se edita un producto técnico (ej: Sublimación), asegurate de que el cambio no contradiga la lógica definida en `lib/prompts.ts`.
   - Mantené la coherencia entre el `seoTitle` del producto y el del cluster al que pertenece.

4. **Seguridad Operacional**:
   - Nunca escribas `MONGODB_URI` en código plano.
   - Usar `connectDB` siempre en entornos de API o `mongoose.connect` con cautela en scripts aislados.
   - Antes de migraciones masivas, generá un backup (via script o dump).

## Flujo de Trabajo para el Agente
- **Investigación**: Usar `grep_search` para encontrar referencias del ID o Slug en otros modelos antes de proponer cambios.
- **Validación**: Al crear contenido, verificar que los enlaces internos (`href`) apunten a rutas existentes y canónicas.
- **Advertencia**: Si una acción del usuario puede romper un cluster de SEO, advertí claramente antes de proceder.

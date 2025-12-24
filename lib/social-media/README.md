# Sistema de Redes Sociales - Guía de Uso

## ✅ Lo que ya está implementado

### 1. Estructura de archivos creada:
```
lib/social-media/
  ├── types/social-content.ts          # Tipos TypeScript
  ├── prompts/social-prompts.ts        # Prompts especializados FB/IG
  └── generators/base-generator.ts     # Generador de contenido

models/
  ├── SocialPost.ts                   # Modelo para posts generados
  └── SocialAccount.ts                # Modelo para cuentas conectadas

pages/api/admin/social/
  └── generate-content.ts             # Endpoint de generación
```

### 2. Funcionalidades:
- ✅ Generación de captions optimizados para Facebook (40-80 palabras)
- ✅ Generación de captions optimizados para Instagram (100-150 caracteres)
- ✅ Hashtags estratégicos por plataforma (3-5 para FB, 8-15 para IG)
- ✅ Selección automática de imagen principal del producto (1200px)
- ✅ Almacenamiento en MongoDB como borradores
- ✅ Uso de Gemini AI con tus prompts actuales
- ✅ Voseo uruguayo integrado

---

## 🧪 Cómo probar (sin API keys todavía)

### Opción 1: Prueba local del generador de contenido

Ejecutá este código en una consola de Node.js o script temporal:

```typescript
import { SocialContentGenerator } from './lib/social-media/generators/base-generator';

const testProduct = {
  _id: 'test123',
  nombre: 'Agenda 2026 Tapa Dura Personalizada',
  descripcionBreve: 'Agenda semanal con tapas duras que resisten todo el año',
  puntosClave: [
    'Tapas duras con laminado resistente',
    'Espiral metálico reforzado',
    'Papel 80g que no transparenta',
    'Personalizada con tu nombre'
  ],
  precio: 890,
  categoria: 'Agendas',
  imagen: 'https://tu-bucket.s3.amazonaws.com/processed/abc123-1200w.webp'
};

const generator = new SocialContentGenerator(process.env.GEMINI_API_KEY!);

// Generar para ambas plataformas
const content = await generator.generateContent(testProduct);

console.log('📘 FACEBOOK:');
console.log('Caption:', content.facebook.caption);
console.log('Hashtags:', content.facebook.hashtags.join(' '));
console.log('CTA:', content.facebook.cta);
console.log('\n📸 INSTAGRAM:');
console.log('Caption:', content.instagram.caption);
console.log('Hashtags:', content.instagram.hashtags.join(' '));
```

### Opción 2: Usar el API endpoint desde el admin

```bash
# POST /api/admin/social/generate-content
curl -X POST http://localhost:3000/api/admin/social/generate-content \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "TU_PRODUCT_ID_REAL",
    "platforms": ["facebook", "instagram"]
  }'
```

**Respuesta esperada**:
```json
{
  "success": true,
  "productName": "Agenda 2026...",
  "content": {
    "facebook": {
      "_id": "...",
      "caption": "¿Buscás una agenda que dure...✨",
      "hashtags": ["#Kamaluso", "#PapeleriaPersonalizada", "#Uruguay"],
      "imageUrl": "https://...-1200w.webp",
      "cta": "Pedila hoy 👉"
    },
    "instagram": {
      "_id": "...",
      "caption": "✨ La agenda que dura TODO el año...",
      "hashtags": ["#Kamaluso", "#AgendaPersonalizada", ...],
      "imageUrl": "https://...-1200w.webp"
    }
  }
}
```

---

## 📋 Próximos pasos

### Para completar la funcionalidad completa necesitás:

1. **Obtener claves de Meta API**:
   - Ir a [Meta for Developers](https://developers.facebook.com/)
   - Crear una aplicación
   - Obtener ACCESS_TOKEN de la página de Facebook
   - Obtener INSTAGRAM_BUSINESS_ACCOUNT_ID

2. **Agregar a `.env.local`**:
   ```bash
   # Ya tenés
   GEMINI_API_KEY=tu_key_actual
   
   # Nuevas (cuando las consigas)
   META_APP_ID=tu_app_id
   META_APP_SECRET=tu_app_secret
   META_ACCESS_TOKEN=tu_access_token
   FACEBOOK_PAGE_ID=tu_page_id
   INSTAGRAM_BUSINESS_ACCOUNT_ID=tu_ig_business_id
   ```

3. **Siguiente fase**: Implementar publicación en Meta API

---

## 💡 Ejemplo de contenido generado

**Producto**: Agenda 2026 Tapa Dura

**Facebook** (conversacional, detallado):
```
¿Buscás una agenda que realmente dure todo el año? 📖

Nuestra Agenda 2026 tiene tapas duras con laminado extra-resistente que aguanta 365 días de uso intenso. Con espiral metálico reforzado que no se desarma y papel de 80g que no transparenta. Además, la personalizamos con tu nombre o logo.

Pedila hoy y organizate con estilo 👉

#Kamaluso #PapeleriaPersonalizada #Uruguay #AgendaPersonalizada
```

**Instagram** (breve, visual-first):
```
✨ La agenda que dura TODO el año. Tapas duras + espiral reforzado + personalización. ¿Cuál es tu color favorito? 💖

#Kamaluso #PapeleriaPersonalizada #AgendaPersonalizada #Uruguay #Papeleria #RegalosPersonalizados #Productividad #DisenioUruguay #LibretaPersonalizada #OrganizacionPersonal #AgendaSemanal #PlannerUruguay
```

---

## 🔧 Personalización de prompts

Si querés ajustar el tono o estructura, editá:
- `lib/social-media/prompts/social-prompts.ts`

Cada plataforma tiene su prompt especializado con:
- Longitud óptima
- Estructura recomendada
- Cantidad de hashtags
- Tono de comunicación
- Voseo uruguayo obligatorio

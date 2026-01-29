# 🎬 Guía de Creación de Video con IA para Kamaluso

Esta guía está diseñada para ayudarte a potenciar tu proyecto y redes sociales con clips de video profesionales generados por IA, de forma gratuita.

## 🚀 Herramientas Recomendadas (Enero 2026)

| **ElevenLabs** | Voz en off (TTS) realista | 10,000 caracteres/mes gratis, voces muy humanas. |
| **Suno / Udio** | Música y jingles personalizados | 10-50 créditos diarios, música de calidad estudio. |
| **CapCut** | Ensamblaje, Texto y Subtítulos | Herramienta gratuita #1 para unir todo y añadir textos. |
| **Luma / Kling** | Video cinematográfico | Base visual del video (clips de 5-10s). |

---

## ✍️ Prompts Estratégicos para Kamaluso

Para obtener videos que vendan tus agendas y libretas, usa este estilo de prompts (en inglés suelen funcionar mejor):

### Escena de Producto (Cinematic)
> *Prompt:* "Macro close-up shot of a luxury personalized agenda with a floral leather cover, smooth camera panning, soft natural sunlight hitting the golden spiral, 4k, cinematic lighting."

### Escena de Uso (Lifestyle)
> *Prompt:* "A hand elegantly opening a customized planner on a clean white desk, beautiful stationery flatlay, soft aesthetic, high quality, realistic movement."

### Efecto Creativo (Pika/Kling)
> *Prompt:* "A stationery box transforming into a beautiful personalized notebook, magical sparkles, high detail, vibrant colors."

---

## 📱 Flujo de Trabajo para Redes Sociales (Reels/TikTok)

1.  **Generación de Clips:** Genera 3 o 4 clips de 5 segundos cada uno usando **Luma** o **Kling**.
2.  **Edición en Canva/CapCut:** Une los clips. Agrega música en tendencia.
3.  **Branding:** Superpón tu logo y textos tipo "Organizá tu 2026 con estilo".
4.  **Llamada a la Acción:** Termina con un código QR o link a `kamaluso.com`.

---

## 🎙️ Producción Completa: Voz, Música y Texto

Para que tus videos de Kamaluso pasen de "bien" a "profesional", necesitas integrar audio y narrativa. Este es el flujo recomendado:

### 1. La Voz de tu Marca (Voz en Off)
Usa **ElevenLabs** para generar la narración:
- **Prompt sugerido:** "Hola, soy [Nombre] de Kamaluso. Organizá tu 2026 con nuestras agendas personalizadas. Calidad premium hecha en Uruguay."
- **Tip:** Elige una voz que suene "Natural" o "Cercana".

### 2. Música y Ritmo (Soundtrack)
Usa **Suno** o **Udio** para crear un jingle único:
- **Prompt sugerido:** "Acoustic pop, happy, chill, uplifting, acoustic guitar and soft piano, 100 BPM, background music for stationery brand."

### 3. Texto y Subtítulos Dinámicos
Usa **CapCut** para ensamblar todo:
- **Auto-captions:** CapCut genera subtítulos automáticamente que aparecen al ritmo de la voz.
- **Textos de impacto:** Añade frases como "100% Personalizado" o "Envíos a todo el país" con animaciones sencillas.

---

## ⏳ Cómo crear videos de 30 segundos (o más) gratis

La mayoría de las IAs generan clips de 5 a 10 segundos para mantener la coherencia. Para llegar a los 30 segundos tienes tres caminos:

### 1. El Método de "Extensión" (Recomendado para coherencia)
Herramientas como **Luma Dream Machine** o **Kling AI** permiten "extender" un video ya generado.
- Generas los primeros 5-10 segundos.
- Pulsas en "Extend Video".
- Escribes qué quieres que pase después.
- Repites hasta llegar a los 30 segundos. *Nota: Esto consume más créditos, pero el video es una sola toma fluida.*

### 2. El Método de "Stitching" (Ensamblaje)
Es el más eficiente para redes sociales (Reels/TikTok).
- Generas 5 clips diferentes de 6 segundos cada uno (escenas distintas: el producto, alguien usándolo, un detalle del logo, etc.).
- Los llevas a **CapCut** (móvil/PC) o **Canva**.
- Aplicas transiciones suaves y música.
- **Resultado:** Un video dinámico de 30 segundos que no aburre al espectador.

### 3. IAs de Larga Duración
- **FlexClip:** Su generador de texto a video puede crear piezas de hasta 1 minuto de una sola vez, usando clips de stock o generados.
- **InVideo AI:** Puedes pedirle "Crea un video de 30 segundos sobre agendas personalizadas" y te armará el guion, la voz en off y las imágenes (suele tener marca de agua en la versión gratis).

---

## 💻 Integración en la Web (Kamaluso Fullstack)

Para usar videos en tu sitio sin afectar la velocidad:

1.  **Formato:** Usa archivos `.webm` (son mucho más ligeros que `.mp4`).
2.  **Hosting:** Sube los videos a Cloudinary o búscalos en tu carpeta `public/` (si son muy pequeños).
3.  **Código sugerido:**
```tsx
<video 
  autoPlay 
  muted 
  loop 
  playsInline 
  poster="/fallback-image.webp"
  className="w-full h-full object-cover"
>
  <source src="/tu-video-ia.webm" type="video/webm" />
  Tu navegador no soporta videos.
</video>
```

> [!TIP]
> **Autoplay:** Para que un video se reproduzca solo, DEBE estar en silencio (`muted`). ¡No lo olvides!

---

## 📖 Caso Práctico: Agenda Semana a la Vista (para FlexClip)

Si vas a usar el generador de **Texto a Video** de **FlexClip**, copia y pega esta estructura para obtener un video profesional:

### Guion / Descripción para el Generador:
> **Título del Video:** Tu Semana con Estilo - Kamaluso
>
> **Descripción:** Un video promocional para una agenda "Semana a la Vista" personalizada. El video debe mostrar un ambiente cálido y organizado. Comienza con un plano detalle de la tapa personalizada con un diseño elegante. Luego, muestra el interior abriéndose para revelar la organización semanal clara y espaciosa. Incluye tomas de alguien escribiendo con una lapicera de calidad. Termina con el logo de Kamaluso y un mensaje "Hecho en Uruguay". Música acústica y relajante.

### Desglose de Escenas (Contenido):
1.  **Escena 1:** Tapa de la agenda sobre un escritorio. Texto: "Tu identidad en cada página".
2.  **Escena 2:** Interior de la agenda (Semana a la vista). Texto: "Toda tu semana en un vistazo".
3.  **Escena 3:** Detalle de los anillos y papel. Texto: "Calidad artesanal uruguaya".
4.  **Escena 4:** Cierre con logo. Texto: "Diseñá la tuya en kamaluso.com".

### Prompts para clips individuales (IA):
- **Tapa:** "Macro close-up of a premium customized planner cover, intricate design, soft morning light, 4k."
- **Interior:** "Slow motion opening of a weekly planner, showing clean empty white pages, minimalist aesthetic."

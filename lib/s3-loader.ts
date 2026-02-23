interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function s3Loader({ src, width, quality }: ImageLoaderProps): string {
  // Rutas locales (empiezan con /)
  if (src.startsWith('/')) {
    // Si ya es una ruta de nuestra API de imágenes, no la tocamos (evitar recursión)
    if (src.startsWith('/api/images/')) return src;

    // For Next.js 16+, local images need to return the src with width parameter
    return `${src}?w=${width}&q=${quality || 75}`;
  }

  // Si no es una URL de S3, devolverla tal cual (ej: googleusercontent)
  if (!src.includes('amazonaws.com')) return src;

  // Extraer la ruta relativa de la URL de S3
  // Ejemplo: https://bucket.s3.region.amazonaws.com/uploads/uuid.png -> uploads/uuid.png
  try {
    const s3Url = new URL(src);
    let key = s3Url.pathname.substring(1); // Remover el primer slash

    // Si es una imagen que puede ser optimizada (WebP)
    if (key.endsWith('.webp')) {
      const imageWidths = [480, 800, 1200, 1920];
      const bestFitSize = imageWidths.find(w => w >= width) || imageWidths[imageWidths.length - 1];

      // Si es de la carpeta processed, intentamos pedir la variante de tamaño
      if (key.startsWith('processed/')) {
        // Limpiar variantes previas si existen
        const baseKey = key.replace(/-\d+w\.webp$/, '');
        // El proxy en pages/api/proxy-image.ts ya maneja el -1200w por defecto, 
        // pero aquí podemos ser más específicos.
        const targetKey = `${baseKey.replace('.webp', '')}-${bestFitSize}w.webp`;
        return `/api/images/${targetKey}`;
      }
    }

    // Para cualquier otro caso (uploads/, PNGs, JPGs sin procesar), usamos el proxy con la key original
    return `/api/images/${key}`;

  } catch (e) {
    console.error('Error parsing S3 URL in loader:', e);
    return src;
  }
}
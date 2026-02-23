interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function s3Loader({ src, width, quality }: ImageLoaderProps): string {
  // Rutas locales (empiezan con /)
  if (src.startsWith('/')) {
    // For Next.js 16+, local images need to return the src with width parameter
    return `${src}?w=${width}&q=${quality || 75}`;
  }

  // Si no es una URL HTTPS, devolverla tal cual
  if (!src.startsWith('https://')) return src;

  // Para imágenes WebP optimizadas de S3
  if (src.endsWith('.webp')) {
    const imageWidths = [480, 800, 1200, 1920];
    const bestFitSize = imageWidths.find(w => w >= width) || imageWidths[imageWidths.length - 1];

    // Check if the src already has a size variant pattern (-XXXw)
    const hasSizeVariant = /-\d+w\.webp$/.test(src);

    // Si la imagen está en processed, DEBEMOS implementar width para que Next.js no se queje.
    // Si la variante no existe (404), OptimizedImage.tsx hará el fallback automático.
    if (hasSizeVariant || src.includes('/processed/')) {
      // Clean the src to get the base URL, e.g., '.../image-800w.webp' -> '.../image'
      const cleanSrc = src.replace(/-\d+w\.webp$/, '.webp');
      const baseUrl = cleanSrc.slice(0, -5);

      // Generate the sized variant URL
      const generatedUrl = `${baseUrl}-${bestFitSize}w.webp`;
      return generatedUrl;
    } else {
      // Para otros casos de S3 que no sean processed, devolvemos original
      // Nota: Si esto causa el warning de "not implement width", Next.js es muy estricto.
      // Pero usualmente solo se activa si se usa el loader.
      return src;
    }
  }

  // Para imágenes JPG/PNG antiguas (no optimizadas), devolverlas sin modificar
  // Esto evita errores de Next.js mientras migras las imágenes
  return src;
}
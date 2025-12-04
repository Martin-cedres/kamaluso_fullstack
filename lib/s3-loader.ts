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

    // Clean the src to get the base URL, e.g., '.../image-800w.webp' -> '.../image'
    const cleanSrc = src.replace(/-\d+w\.webp$/, '.webp');
    const baseUrl = cleanSrc.slice(0, -5);

    // Always use the sized variant - Lambda generates these more reliably than the base .webp
    const generatedUrl = `${baseUrl}-${bestFitSize}w.webp`;
    console.log(`s3Loader: src=${src}, width=${width} -> ${generatedUrl}`);
    return generatedUrl;
  }

  // Para imágenes JPG/PNG antiguas (no optimizadas), devolverlas sin modificar
  // Esto evita errores de Next.js mientras migras las imágenes
  return src;
}
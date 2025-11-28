interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function s3Loader({ src, width, quality }: ImageLoaderProps): string {
  // Rutas locales (empiezan con /)
  if (src.startsWith('/')) return src;

  // Si no es una URL HTTPS, devolverla tal cual
  if (!src.startsWith('https://')) return src;

  // Para imágenes WebP optimizadas de S3
  if (src.endsWith('.webp')) {
    const imageWidths = [480, 800, 1200, 1920];
    const bestFitSize = imageWidths.find(w => w >= width) || imageWidths[imageWidths.length - 1];

    // Clean the src to get the base URL, e.g., '.../image-800w.webp' -> '.../image'
    const cleanSrc = src.replace(/-\d+w\.webp$/, '.webp');
    const baseUrl = cleanSrc.slice(0, -5);

    // For the smallest size (mobile) or largest size, fall back to the base .webp image.
    // This is safer, assuming the base .webp always exists but specific small variants might not for non-product images.
    if (bestFitSize <= 480 || bestFitSize >= 1920) {
      return `${baseUrl}.webp`;
    }

    // For medium sizes, use the specific responsive images.
    return `${baseUrl}-${bestFitSize}w.webp`;
  }

  // Para imágenes JPG/PNG antiguas (no optimizadas), devolverlas sin modificar
  // Esto evita errores de Next.js mientras migras las imágenes
  return src;
}
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

    let cleanSrc = src.replace(/-\d+w\.webp$/, '.webp');
    const baseUrl = cleanSrc.slice(0, -5);

    // Para tamaños grandes (>=1920), usar la versión base sin sufijo
    // Esto asegura que funcione con imágenes originales menores a 1920px
    if (bestFitSize >= 1920) {
      return `${baseUrl}.webp`;
    }

    return `${baseUrl}-${bestFitSize}w.webp`;
  }

  // Para imágenes JPG/PNG antiguas (no optimizadas), devolverlas sin modificar
  // Esto evita errores de Next.js mientras migras las imágenes
  return src;
}
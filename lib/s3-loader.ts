interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function s3Loader({ src, width, quality }: ImageLoaderProps): string {
  // Si la imagen es una ruta local (empieza con /), no la procesamos con el loader de S3.
  if (src.startsWith('/')) {
    return src;
  }

  // Las URLs base que guardamos en la DB terminan en ".webp"
  // Ejemplo: https://bucket.s3.region.amazonaws.com/processed/some-uuid.webp
  // Necesitamos insertar el ancho antes de la extensión.
  // Resultado esperado: https://bucket.s3.region.amazonaws.com/processed/some-uuid-400w.webp

  // Validamos que la URL sea la que esperamos
  if (!src.startsWith('https://') || !src.endsWith('.webp')) {
    // Si no es una URL de S3, la devolvemos tal cual para no romper otras imágenes
    return src;
  }

  // Tamaños de imagen que genera nuestra Lambda.
  const imageWidths = [400, 800, 1200];
  
  // Encontrar el tamaño más adecuado sin exceder el ancho original de la imagen.
  // 'width' es el tamaño que next/image considera necesario.
  const bestFitSize = imageWidths.find(w => w >= width) || imageWidths[imageWidths.length - 1];

  // Quitamos la extensión .webp para insertar el tamaño
  const baseUrl = src.slice(0, -5); // Elimina ".webp"

  // Construimos la nueva URL con el tamaño
  const finalUrl = `${baseUrl}-${bestFitSize}w.webp`;

  return finalUrl;
}
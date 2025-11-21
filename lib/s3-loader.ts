interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function s3Loader({ src, width, quality }: ImageLoaderProps): string {
  if (src.startsWith('/')) return src; // Ruta local

  if (!src.startsWith('https://') || !src.endsWith('.webp')) return src;

  const imageWidths = [400, 800, 1200];
  const bestFitSize = imageWidths.find(w => w >= width) || imageWidths[imageWidths.length - 1];

  let cleanSrc = src.replace(/-\d+w\.webp$/, '.webp');
  const baseUrl = cleanSrc.slice(0, -5);

  return `${baseUrl}-${bestFitSize}w.webp`;
}
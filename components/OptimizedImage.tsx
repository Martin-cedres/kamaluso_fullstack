import Image, { ImageProps } from 'next/image';
import s3Loader from '../lib/s3-loader';

/**
 * Componente wrapper de Next.js Image que decide automáticamente
 * si usar el s3Loader o marcar como unoptimized según el tipo de imagen.
 * 
 * - Imágenes WebP de S3 (processed/): Usa s3Loader para responsive loading
 * - Imágenes JPG/PNG antiguas (uploads/): Marca como unoptimized
 * - Imágenes locales (/): Marca como unoptimized
 */
const OptimizedImage = (props: ImageProps) => {
    const { src, alt, ...restProps } = props;

    // Convertir src a string si es un objeto (StaticImport)
    const srcString = typeof src === 'string' ? src : (typeof src === 'object' && 'src' in src ? src.src : '');

    // Determinar si debe usar el loader o ser unoptimized
    const shouldUseLoader =
        typeof srcString === 'string' &&
        srcString.startsWith('https://') &&
        srcString.includes('/processed/') &&
        srcString.endsWith('.webp');

    if (shouldUseLoader) {
        return <Image src={src} alt={alt} loader={s3Loader} {...restProps} />;
    }

    // Para imágenes locales, JPG/PNG antiguas, o cualquier otra
    return <Image src={src} alt={alt} unoptimized {...restProps} />;
};

export default OptimizedImage;

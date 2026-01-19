import Image, { ImageProps } from 'next/image';
import s3Loader from '../lib/s3-loader';
import { useState, useEffect } from 'react';

/**
 * Componente wrapper de Next.js Image que decide automáticamente
 * si usar el s3Loader o marcar como unoptimized según el tipo de imagen.
 * 
 * Incluye sistema de fallback inteligente:
 * - Imágenes WebP de S3 (processed/): Usa s3Loader para responsive loading
 * - Si falla la variante (-XXXw.webp): Fallback automático a imagen base
 * - Imágenes JPG/PNG antiguas (uploads/): Marca como unoptimized
 * - Imágenes locales (/): Marca como unoptimized
 */
const OptimizedImage = (props: ImageProps) => {
    const { src, alt, ...restProps } = props;

    // Helper para obtener string de src
    const getSrcString = (s: string | any) =>
        typeof s === 'string' ? s : (typeof s === 'object' && 'src' in s ? s.src : '');

    const originalSrc = getSrcString(src);

    // Lógica para predecir la URL optimizada en S3
    const getPotentialS3Url = (original: string) => {
        if (!original.startsWith('https://')) return null;
        if (original.includes('/processed/') && original.endsWith('.webp')) return original; // Ya es óptima

        // Intento de conversión: reemplazar /uploads/ por /processed/ y cambiar extensión
        // Nota: Esto asume que la estructura de archivos de imagen coincide
        if (original.includes('/uploads/')) {
            let newUrl = original.replace('/uploads/', '/processed/');
            // Reemplazar extensión por .webp
            newUrl = newUrl.replace(/\.[^/.]+$/, '.webp');
            return newUrl;
        }
        return null;
    };

    const targetS3Url = getPotentialS3Url(originalSrc);

    // Si no podemos construir una URL de S3 (ej: imagen local), usamos la original directo
    // Si podemos, intentamos cargar esa primero
    const [imageSrc, setImageSrc] = useState<string | typeof src>(targetS3Url || src);
    const [useCustomLoader, setUseCustomLoader] = useState(!!targetS3Url);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const newTarget = getPotentialS3Url(getSrcString(src));
        if (newTarget) {
            setImageSrc(newTarget);
            setUseCustomLoader(true);
        } else {
            setImageSrc(src);
            setUseCustomLoader(false);
        }
        setHasError(false);
    }, [src]);

    const handleError = () => {
        if (hasError) return;

        // Si falló la carga con S3 (404), hacemos fallback a la original con Vercel
        if (useCustomLoader && imageSrc !== src) {
            console.log(`OptimizedImage: Fallback S3 (${imageSrc}) -> Vercel (${originalSrc})`);
            setImageSrc(src); // Volver a original
            setUseCustomLoader(false); // Desactivar loader custom (activa Vercel)
            setHasError(true);
        }
    };

    return (
        <Image
            src={imageSrc}
            alt={alt}
            loader={useCustomLoader ? s3Loader : undefined} // undefined activa el default (Vercel) si no hay loader global
            onError={handleError}
            // Eliminamos unoptimized para permitir que Vercel actúe en el fallback
            {...restProps}
        />
    );
};

export default OptimizedImage;

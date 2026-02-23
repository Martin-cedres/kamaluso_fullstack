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

    // Lógica para predecir la URL optimizada en S3 (vía proxy)
    const getPotentialS3Url = (original: string) => {
        if (!original.startsWith('https://') && !original.startsWith('/api/images/')) return null;

        // Si ya es una URL de S3 o del proxy
        if (original.includes('amazonaws.com') || original.startsWith('/api/images/')) {
            // Intentamos asegurar que pase por el loader si es WebP
            if (original.endsWith('.webp')) return original;
        }
        return null;
    };

    const targetS3Url = props.unoptimized ? null : getPotentialS3Url(originalSrc);
    const [imageSrc, setImageSrc] = useState<string | typeof src>(targetS3Url || src);
    const [useCustomLoader, setUseCustomLoader] = useState(!!targetS3Url);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const currentSrc = getSrcString(src);
        const newTarget = props.unoptimized ? null : getPotentialS3Url(currentSrc);
        if (newTarget) {
            setImageSrc(newTarget);
            setUseCustomLoader(true);
        } else {
            setImageSrc(src);
            setUseCustomLoader(false);
        }
        setHasError(false);
    }, [src, props.unoptimized]);

    const handleError = () => {
        if (hasError) return;

        // Si falló la carga con el loader (ej: 404 variante), hacemos fallback a la original
        if (useCustomLoader && imageSrc !== src) {
            console.log(`OptimizedImage: Fallback loader (${imageSrc}) -> Original (${originalSrc})`);
            setImageSrc(src); // Volver a original
            setUseCustomLoader(false); // Desactivar loader custom para esta instancia
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
            loading={restProps.priority ? undefined : restProps.loading || 'lazy'}
            decoding={restProps.priority ? undefined : 'async'}
        />
    );
};

export default OptimizedImage;

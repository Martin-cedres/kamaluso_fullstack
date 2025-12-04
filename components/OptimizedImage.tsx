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

    // Convertir src a string si es un objeto (StaticImport)
    const srcString = typeof src === 'string' ? src : (typeof src === 'object' && 'src' in src ? src.src : '');

    // Estados para manejo de fallback
    const [imageSrc, setImageSrc] = useState<string | typeof src>(src);
    const [hasError, setHasError] = useState(false);

    // Reset cuando cambia la prop src
    useEffect(() => {
        setImageSrc(src);
        setHasError(false);
    }, [src]);

    // Determinar si debe usar el loader o ser unoptimized
    const shouldUseLoader =
        typeof srcString === 'string' &&
        srcString.startsWith('https://') &&
        srcString.includes('/processed/') &&
        srcString.endsWith('.webp');

    // Handler de error para fallback automático
    const handleError = () => {
        if (hasError) return; // Ya intentamos el fallback

        const currentSrc = typeof imageSrc === 'string' ? imageSrc : (typeof imageSrc === 'object' && 'src' in imageSrc ? imageSrc.src : '');

        // Si es una variante (-XXXw.webp), intentar con la imagen base
        if (typeof currentSrc === 'string' && currentSrc.match(/-\d+w\.webp$/)) {
            const baseSrc = currentSrc.replace(/-\d+w\.webp$/, '.webp');
            console.log(`OptimizedImage: Fallback de ${currentSrc} a ${baseSrc}`);
            setImageSrc(baseSrc);
            setHasError(true);
        } else {
            // Ya es imagen base o no es WebP, usar placeholder
            console.log(`OptimizedImage: Imagen no encontrada: ${currentSrc}`);
            setImageSrc('/placeholder.png');
            setHasError(true);
        }
    };

    if (shouldUseLoader) {
        return <Image src={imageSrc} alt={alt} loader={s3Loader} onError={handleError} {...restProps} />;
    }

    // Para imágenes locales, JPG/PNG antiguas, o cualquier otra
    return <Image src={imageSrc} alt={alt} unoptimized onError={handleError} {...restProps} />;
};

export default OptimizedImage;

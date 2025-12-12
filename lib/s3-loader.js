"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = s3Loader;
function s3Loader({ src, width, quality }) {
    // Rutas locales (empiezan con /)
    if (src.startsWith('/')) {
        // For Next.js 16+, local images need to return the src with width parameter
        return `${src}?w=${width}&q=${quality || 75}`;
    }
    // Si no es una URL HTTPS, devolverla tal cual
    if (!src.startsWith('https://'))
        return src;
    // Para imágenes WebP optimizadas de S3
    if (src.endsWith('.webp')) {
        const imageWidths = [480, 800, 1200, 1920];
        const bestFitSize = imageWidths.find(w => w >= width) || imageWidths[imageWidths.length - 1];
        // Check if the src already has a size variant pattern (-XXXw)
        const hasSizeVariant = /-\d+w\.webp$/.test(src);
        // Si la imagen YA tiene una variante (ej: fue subida con Lambda), generar la URL con el tamaño apropiado
        // Si NO tiene variante, es la imagen base y la devolvemos sin modificar
        if (hasSizeVariant || src.includes('/processed/')) {
            // Clean the src to get the base URL, e.g., '.../image-800w.webp' -> '.../image'
            const cleanSrc = src.replace(/-\d+w\.webp$/, '.webp');
            const baseUrl = cleanSrc.slice(0, -5);
            // Generate the sized variant URL
            const generatedUrl = `${baseUrl}-${bestFitSize}w.webp`;
            console.log(`s3Loader: src=${src}, width=${width} -> ${generatedUrl}`);
            return generatedUrl;
        }
        else {
            // Imagen base sin variantes, devolverla sin modificar
            console.log(`s3Loader: Imagen base sin variantes, retornando: ${src}`);
            return src;
        }
    }
    // Para imágenes JPG/PNG antiguas (no optimizadas), devolverlas sin modificar
    // Esto evita errores de Next.js mientras migras las imágenes
    return src;
}

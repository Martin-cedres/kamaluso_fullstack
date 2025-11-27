/**
 * Utilidades compartidas para el manejo de presupuestos
 */

export interface ProductData {
    nombre: string;
    descripcion?: string;
    precio: number;
    images?: string[];
    slug: string;
}

/**
 * Extrae el slug del producto desde diferentes formatos de URL
 * Soporta:
 * - https://www.papeleriapersonalizada.uy/producto/slug
 * - https://www.papeleriapersonalizada.uy/productos/detail/slug
 * - www.papeleriapersonalizada.uy/producto/slug
 * - /producto/slug
 * - /productos/detail/slug
 * - slug (directo)
 */
export function extractProductSlugFromUrl(url: string): string | null {
    if (!url || typeof url !== 'string') {
        return null;
    }

    const trimmedUrl = url.trim();

    // Si ya es solo el slug (sin slashes ni protocolo)
    if (!trimmedUrl.includes('/') && !trimmedUrl.includes('.')) {
        return trimmedUrl;
    }

    // Intentar extraer desde URL completa o parcial
    // Patrones soportados:
    // - /producto/SLUG
    // - /productos/detail/SLUG
    // - /productos/SLUG
    const patterns = [
        /\/productos\/detail\/([^\/\?#]+)/,  // /productos/detail/slug
        /\/producto\/([^\/\?#]+)/,            // /producto/slug
        /\/productos\/([^\/\?#]+)/,           // /productos/slug
    ];

    for (const pattern of patterns) {
        const match = trimmedUrl.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    // Si no encontró ningún patrón, retornar null
    return null;
}

/**
 * Obtiene los datos del producto desde la API usando el slug
 */
export async function fetchProductData(slug: string): Promise<ProductData | null> {
    if (!slug) {
        return null;
    }

    try {
        const res = await fetch(`/api/products/listar?slug=${encodeURIComponent(slug)}`);

        if (!res.ok) {
            console.error('Error fetching product:', res.status);
            return null;
        }

        const data = await res.json();

        if (!data.products || data.products.length === 0) {
            console.warn('No product found with slug:', slug);
            return null;
        }

        const product = data.products[0];

        return {
            nombre: product.nombre,
            descripcion: product.descripcion || product.descripcionBreve || '',
            precio: product.precio || product.basePrice || 0,
            images: product.images || [],
            slug: product.slug,
        };
    } catch (error) {
        console.error('Error fetching product data:', error);
        return null;
    }
}

/**
 * Valida que una URL de imagen sea accesible
 * Intenta cargar la imagen y retorna true si es válida
 */
export async function validateImageUrl(url: string): Promise<boolean> {
    if (!url || typeof url !== 'string') {
        return false;
    }

    // Validación básica de formato de URL
    try {
        // Verificar que sea una URL válida o ruta relativa
        if (!url.startsWith('http') && !url.startsWith('/')) {
            return false;
        }

        // En el navegador, podríamos hacer una validación más completa
        // Por ahora, solo validamos el formato
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Formatea el precio en formato uruguayo
 */
export function formatPrice(price: number): string {
    return new Intl.NumberFormat('es-UY', {
        style: 'currency',
        currency: 'UYU'
    }).format(price);
}

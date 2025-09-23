// lib/utils.ts

/**
 * Normaliza un string para ser usado en una URL (slug).
 * Convierte a minúsculas, quita espacios extra y reemplaza espacios por guiones.
 * @param s El string a normalizar.
 * @returns El string normalizado.
 */
export function toSlug(s: any): string {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
}

/**
 * Genera la URL (href) para un producto, manejando diferentes estructuras de datos.
 * @param p El objeto del producto.
 * @returns El path de la URL para el producto.
 */
export function getProductHref(p: any): string {
  // Always use _id for the most robust linking
  const productId = p._id || ''
  if (productId) {
    return `/productos/detail/${encodeURIComponent(productId)}`
  }
  // Fallback if no _id (should not happen if products come from DB)
  return `/productos/detail/not-found`
}

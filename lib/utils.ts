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

/**
 * Dispara la revalidación bajo demanda para las páginas de un producto.
 * @param categoria La categoría del producto.
 * @param slug El slug del producto.
 */
export async function revalidateProductPaths(categoria: string, slug: string) {
  const pathsToRevalidate = [
    '/',
    '/productos',
    `/productos/${categoria}`,
    `/productos/${categoria}/${slug}`,
  ];

  const secret = process.env.REVALIDATE_TOKEN;
  if (!secret) {
    console.error('REVALIDATE_TOKEN no está configurado.');
    return;
  }

  // Usamos NEXTAUTH_URL como base para la URL de la API interna
  const baseUrl = process.env.NEXTAUTH_URL;
  if (!baseUrl) {
    console.error('NEXTAUTH_URL no está configurado. No se puede revalidar.');
    return;
  }

  for (const path of pathsToRevalidate) {
    try {
      const response = await fetch(`${baseUrl}/api/revalidate?secret=${secret}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path }),
      });

      if (response.ok) {
        console.log(`Successfully revalidated: ${path}`);
      } else {
        const errorBody = await response.json();
        console.error(`Failed to revalidate ${path}:`, errorBody.message);
      }
    } catch (error) {
      console.error(`Error calling revalidate API for ${path}:`, error);
    }
  }
}

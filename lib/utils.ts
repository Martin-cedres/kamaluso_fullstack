// lib/utils.ts

/**
 * Normaliza un string para ser usado en una URL (slug).
 * Convierte a minúsculas, quita espacios extra y reemplaza espacios por guiones.
 * @param s El string a normalizar.
 * @returns El string normalizado.
 */
export function toSlug(s: any): string {
  if (!s) return '';
  s = String(s);

  // 1. Convert to lowercase
  // 2. Normalize accented characters (e.g., á -> a)
  // 3. Replace non-alphanumeric characters (except hyphens) with nothing
  // 4. Replace spaces and multiple hyphens with a single hyphen
  // 5. Remove leading/trailing hyphens
  return s
    .normalize("NFD") // Normalize to NFD (Canonical Decomposition Form)
    .replace(/\p{M}/gu, "") // Remove diacritics (accents)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove all non-alphanumeric chars except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with single hyphen
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Genera la URL (href) para un producto, manejando diferentes estructuras de datos.
 * @param p El objeto del producto.
 * @returns El path de la URL para el producto.
 */
export function getProductHref(p: any): string {
  if (p._id) {
    return `/productos/detail/${p.slug}`;
  }
  // Fallback if essential data is missing
  return `/productos/not-found`;
}

/**
 * Dispara la revalidación bajo demanda para las páginas de una categoría.
 * @param categorySlug El slug de la categoría afectada.
 * @param parentCategorySlug Opcional: El slug de la categoría padre, si existe.
 */
export async function revalidateCategoryPaths(categorySlug: string, parentCategorySlug?: string) {
  const pathsToRevalidate = [
    '/',
    `/productos/${categorySlug}`,
  ];

  if (parentCategorySlug) {
    pathsToRevalidate.push(`/productos/${parentCategorySlug}`);
  }

  const secret = process.env.REVALIDATE_TOKEN;
  if (!secret) {
    console.error('REVALIDATE_TOKEN no está configurado.');
    return;
  }

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

/**
 * Dispara la revalidación bajo demanda para las páginas de un producto.
 * @param categoria La categoría del producto.
 * @param slug El slug del producto.
 */
export async function revalidateProductPaths(categoria: string, slug: string, id: string) {
  const pathsToRevalidate = [
    '/',
    '/productos',
    `/productos/${categoria}`,
    `/productos/detail/${slug}`,
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

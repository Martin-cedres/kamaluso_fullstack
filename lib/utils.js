"use strict";
// lib/utils.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSlug = toSlug;
exports.getProductHref = getProductHref;
exports.revalidateCategoryPaths = revalidateCategoryPaths;
exports.revalidateProductPaths = revalidateProductPaths;
/**
 * Normaliza un string para ser usado en una URL (slug).
 * Convierte a minúsculas, quita espacios extra y reemplaza espacios por guiones.
 * @param s El string a normalizar.
 * @returns El string normalizado.
 */
function toSlug(s) {
    if (!s)
        return '';
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
function getProductHref(p) {
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
async function revalidateCategoryPaths(categorySlug, parentCategorySlug) {
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
            }
            else {
                const errorBody = await response.json();
                console.error(`Failed to revalidate ${path}:`, errorBody.message);
            }
        }
        catch (error) {
            console.error(`Error calling revalidate API for ${path}:`, error);
        }
    }
}
/**
 * Dispara la revalidación bajo demanda para las páginas de un producto.
 * @param categoria El slug de la categoría principal del producto.
 * @param subCategoriaSlug El slug de la subcategoría (si existe).
 * @param slug El slug del producto.
 * @param id El ID del producto.
 */
async function revalidateProductPaths(categoria, subCategoriaSlug, slug, id) {
    const pathsToRevalidate = [
        '/',
        '/productos',
        `/productos/${categoria}`,
        `/productos/detail/${slug}`,
    ];
    // Si hay una subcategoría, añadir su path específico
    if (subCategoriaSlug) {
        pathsToRevalidate.push(`/productos/${categoria}/${subCategoriaSlug}`);
    }
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
            }
            else {
                const errorBody = await response.json();
                console.error(`Failed to revalidate ${path}:`, errorBody.message);
            }
        }
        catch (error) {
            console.error(`Error calling revalidate API for ${path}:`, error);
        }
    }
}

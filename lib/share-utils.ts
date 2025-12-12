/**
 * Utilidades para compartir productos en redes sociales
 */

/**
 * Genera URL para compartir en WhatsApp
 */
export function getWhatsAppShareUrl(url: string, productName: string): string {
    const message = `¡Mirá este producto increíble! ${productName}\n${url}`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/**
 * Genera URL para compartir en Facebook
 */
export function getFacebookShareUrl(url: string): string {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

/**
 * Genera URL para compartir en Twitter/X
 */
export function getTwitterShareUrl(url: string, productName: string): string {
    const text = `¡Mirá este producto! ${productName}`;
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

/**
 * Copia texto al portapapeles
 * @returns Promise que resuelve a true si fue exitoso, false si falló
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback para navegadores antiguos
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            return successful;
        }
    } catch (err) {
        console.error('Error al copiar al portapapeles:', err);
        return false;
    }
}

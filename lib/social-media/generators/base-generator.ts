// Generador base de contenido para redes sociales

import { GeneratedSocialContent, SocialPostContent } from '../types/social-content';
import { generateSocialContentWithAI } from '../prompts/social-prompts';

interface Product {
    _id: string;
    nombre: string;
    descripcionBreve?: string;
    descripcionExtensa?: string;
    puntosClave?: string[];
    precio?: number;
    basePrice?: number;
    categoria?: string;
    imagen?: string;
    imageUrl?: string;
    images?: string[];
    slug?: string;
}

export class SocialContentGenerator {
    constructor() {
        // Ahora usa el sistema de rotación de claves internamente
    }

    /**
     * Obtiene la imagen principal del producto
     * Siempre usa la primera imagen (producto completo, no interiores)
     */
    private getProductMainImage(product: Product): string {
        // Prioridad: imageUrl (viene de API) > imagen > images[0]
        if (product.imageUrl) return product.imageUrl;
        if (product.imagen) return product.imagen;
        if (product.images && product.images.length > 0) return product.images[0];
        return '/placeholder.png';
    }

    /**
     * Convierte URL de S3 a la versión de 1200px (ideal para redes sociales)
     */
    private getOptimizedImageUrl(imageUrl: string): string {
        // Si ya es una URL de S3 procesada, obtener el baseKey
        const s3Pattern = /processed\/([^-]+)(-\d+w)?\.webp/;
        const match = imageUrl.match(s3Pattern);

        if (match) {
            const baseKey = match[1];
            // Usar versión de 1200w (perfecto para FB/IG que piden 1080x1080)
            return imageUrl.replace(s3Pattern, `processed/${baseKey}-1200w.webp`);
        }

        // Si no matchea el patrón, devolver original
        return imageUrl;
    }

    /**
     * Genera contenido para Facebook e Instagram de un producto
     */
    async generateContent(product: Product): Promise<GeneratedSocialContent> {
        console.log(`🤖 Generando contenido social para: ${product.nombre}`);

        // Obtener imagen principal optimizada
        const mainImage = this.getProductMainImage(product);
        const optimizedImage = this.getOptimizedImageUrl(mainImage);

        // Generar contenido para Facebook
        console.log('📘 Generando contenido para Facebook...');
        const facebookContent = await generateSocialContentWithAI(
            {
                platform: 'facebook',
                product,
                tone: 'casual'
            }
        );

        // Generar contenido para Instagram
        console.log('📸 Generando contenido para Instagram...');
        const instagramContent = await generateSocialContentWithAI(
            {
                platform: 'instagram',
                product,
                tone: 'casual'
            }
        );

        const result: GeneratedSocialContent = {
            facebook: {
                caption: facebookContent.caption,
                hashtags: facebookContent.hashtags,
                imageUrl: optimizedImage,
                cta: facebookContent.cta
            },
            instagram: {
                caption: instagramContent.caption,
                hashtags: instagramContent.hashtags,
                imageUrl: optimizedImage
            }
        };

        console.log('✅ Contenido generado exitosamente');
        return result;
    }

    /**
     * Genera contenido solo para una plataforma específica
     */
    async generateForPlatform(
        product: Product,
        platform: 'facebook' | 'instagram'
    ): Promise<SocialPostContent> {
        const mainImage = this.getProductMainImage(product);
        const optimizedImage = this.getOptimizedImageUrl(mainImage);

        const content = await generateSocialContentWithAI(
            {
                platform,
                product,
                tone: 'casual'
            }
        );

        return {
            caption: content.caption,
            hashtags: content.hashtags,
            imageUrl: optimizedImage,
            cta: content.cta
        };
    }
}

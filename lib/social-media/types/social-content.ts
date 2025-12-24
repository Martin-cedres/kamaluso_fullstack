// Tipos para el sistema de redes sociales

export type SocialPlatform = 'facebook' | 'instagram';

export type ContentStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export interface SocialPostContent {
    caption: string;
    hashtags: string[];
    imageUrl: string;
    cta?: string; // Call to action (para Facebook)
}

export interface GeneratedSocialContent {
    facebook: SocialPostContent;
    instagram: SocialPostContent;
}

export interface SocialPost {
    _id?: string;
    productId: string;
    productName: string;
    platform: SocialPlatform;

    // Contenido
    caption: string;
    hashtags: string[];
    imageUrl: string;

    // Estado
    status: ContentStatus;
    scheduledAt?: Date;
    publishedAt?: Date;
    publishedUrl?: string; // URL del post en la plataforma

    // Analytics (se completan después de publicar)
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;

    // Metadata
    prompt: string; // Prompt usado para generar
    generatedWith: string; // Modelo de IA usado (ej: "gemini-2.5-pro")
    createdAt: Date;
    updatedAt: Date;
}

export interface SocialAccount {
    _id?: string;
    platform: SocialPlatform;
    accountName: string;
    accountId: string; // ID en la plataforma (Page ID, Instagram Business Account ID)
    accessToken: string; // Encriptado
    refreshToken?: string;
    tokenExpiresAt?: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

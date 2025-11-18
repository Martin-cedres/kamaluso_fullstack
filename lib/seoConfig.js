/**
 * @file Centralized configuration for SEO and site-wide metadata.
 * Using a single source of truth for this data makes the site more maintainable.
 */

export const siteConfig = {
  // Utiliza una variable de entorno para la URL base, con un fallback para desarrollo.
  // Asegúrate de añadir NEXT_PUBLIC_SITE_URL a tu archivo .env.local
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.papeleriapersonalizada.uy',
  // Datos de la organización para el Schema.org
  organization: {
    name: 'Kamaluso',
    logo: 'https://www.papeleriapersonalizada.uy/logo.png', // URL completa del logo
    facebook: 'https://www.facebook.com/kamalusosj/',
    instagram: 'https://www.instagram.com/kamaluso_sanjose',
  },
  // Datos de contacto para el Schema.org
  contact: {
    phone: '+59898615074',
    type: 'customer service',
    areaServed: 'UY',
    availableLanguage: ['Spanish'],
  },
  // Idioma principal del sitio
  language: 'es-UY',
};
import Head from 'next/head'

interface SeoMetaProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: string
}

const SeoMeta = ({
  title = 'Papelería Personalizada | Kamaluso',
  description = 'Encuentra agendas, libretas, recetarios y planners, en tapa dura laminada, 100% personalizados en papeleria personalizada Kamaluso. Diseños únicos y materiales de alta calidad. ¡Enviamos a todo Uruguay!.',
  image = '/logo.webp',
  url = '/',
  type = 'website',
}: SeoMetaProps) => {
  const siteUrl = 'https://www.papeleriapersonalizada.uy'
  const absoluteUrl = url.startsWith('http') ? url : `${siteUrl}${url}`
  const absoluteImage = image.startsWith('http') ? image : `${siteUrl}${image}`

  return (
    <Head>
      {/* SEO básico */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={absoluteUrl} />

      {/* Performance Hint */}
      <link rel="preconnect" href="https://strapi-bucket-kamaluso.s3.sa-east-1.amazonaws.com" />

      <meta name="robots" content="index, follow" />
      <meta name="language" content="es" />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/favicon.ico" />

      {/* Open Graph / Facebook, WhatsApp, etc. */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={absoluteUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:site_name" content="Kamaluso Papelería" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={absoluteUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />

    </Head>
  )
}

export default SeoMeta

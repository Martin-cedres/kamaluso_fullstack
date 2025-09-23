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
  description = 'Kamaluso ofrece agendas, libretas y cuadernos personalizables en San José de Mayo. Envíos a todo Uruguay.',
  image = '/logo.webp',
  url = '/',
  type = 'website',
}: SeoMetaProps) => {
  const siteUrl = 'https://www.papeleriapersonalizada.uy'
  const absoluteImage = image.startsWith('http') ? image : `${siteUrl}${image}`
  const absoluteUrl = url.startsWith('http') ? url : `${siteUrl}${url}`

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={absoluteUrl} />

      {/* Favicon */}
      <link rel="icon" href="/logo.webp" type="image/webp" />
      <link rel="shortcut icon" href="/logo.webp" type="image/webp" />
      <link rel="apple-touch-icon" href="/logo.webp" />

      {/* Open Graph / Facebook, WhatsApp, etc. */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={absoluteUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:site_name" content="Kamaluso Papelería" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={absoluteUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />
    </Head>
  )
}

export default SeoMeta

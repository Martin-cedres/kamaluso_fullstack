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
  description = 'Kamaluso ofrece agendas, libretas y cuadernos con tapa dura personalizados en San José de Mayo. Envíos a todo Uruguay.',
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

      {/* Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "@id": `${siteUrl}/#website`,
                url: siteUrl,
                name: title,
                description: description,
                publisher: { "@id": `${siteUrl}/#organization` },
                potentialAction: {
                  "@type": "SearchAction",
                  target: `${siteUrl}/buscar?q={search_term_string}`,
                  "query-input": "required name=search_term_string"
                },
                inLanguage: "es-UY"
              },
              {
                "@type": "Organization",
                "@id": `${siteUrl}/#organization`,
                name: "Kamaluso",
                url: siteUrl,
                logo: { "@type": "ImageObject", url: `${siteUrl}/logo.png` },
                sameAs: [
                  "https://www.facebook.com/kamalusosj/",
                  "https://www.instagram.com/kamaluso_sanjose",
                
                ],
                contactPoint: {
                  "@type": "ContactPoint",
                  telephone: "+59898615074",
                  contactType: "customer service",
                  areaServed: "UY",
                  availableLanguage: ["Spanish"]
                }
              },
              {
                "@type": "Service",
                name: "Papelería Personalizada",
                description: description,
                areaServed: { "@type": "Country", name: "Uruguay" },
                serviceType: "Productos personalizables"
              }
            ]
          })
        }}
      />
    </Head>
  )
}

export default SeoMeta

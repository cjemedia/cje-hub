import { Metadata } from 'next'

const siteUrl = 'https://www.ciarajevans.com'
// Open Graph image should be 1200x630 pixels for optimal display
// If og-image.png doesn't exist, create it by resizing cje19.png to 1200x630
const defaultImage = `${siteUrl}/images/og-image.png` // Default OG image (1200x630)
const siteName = 'Ciara J. Evans | The CJE Experience'
const defaultDescription = 'Where creativity, clarity, and connection meet. Purpose-driven storytelling, speaking, and strategic visibility.'

export interface PageMetadata {
  title: string
  description: string
  image?: string
  url?: string
  noIndex?: boolean
}

export function generateMetadata({
  title,
  description,
  image = defaultImage,
  url,
  noIndex = false,
}: PageMetadata): Metadata {
  const fullTitle = title.includes('|') ? title : `${title} | ${siteName}`
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl
  const imageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`

  return {
    title: fullTitle,
    description,
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: fullUrl,
      siteName,
      title: fullTitle,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: fullUrl,
    },
  }
}


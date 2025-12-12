import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/hub/', '/admin/', '/api/'],
    },
    sitemap: 'https://www.ciarajevans.com/sitemap.xml',
  }
}


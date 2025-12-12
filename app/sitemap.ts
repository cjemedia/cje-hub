import { MetadataRoute } from 'next'
import { createServiceClient } from '@/lib/supabase/service'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.ciarajevans.com'
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { 
      url: baseUrl, 
      lastModified: new Date(), 
      changeFrequency: 'weekly', 
      priority: 1 
    },
    { 
      url: `${baseUrl}/events`, 
      lastModified: new Date(), 
      changeFrequency: 'weekly', 
      priority: 0.9 
    },
    { 
      url: `${baseUrl}/coaching`, 
      lastModified: new Date(), 
      changeFrequency: 'monthly', 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/tools`, 
      lastModified: new Date(), 
      changeFrequency: 'monthly', 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/branding`, 
      lastModified: new Date(), 
      changeFrequency: 'monthly', 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/partnerships`, 
      lastModified: new Date(), 
      changeFrequency: 'monthly', 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/business-resources`, 
      lastModified: new Date(), 
      changeFrequency: 'monthly', 
      priority: 0.7 
    },
    { 
      url: `${baseUrl}/booking`, 
      lastModified: new Date(), 
      changeFrequency: 'monthly', 
      priority: 0.7 
    },
    { 
      url: `${baseUrl}/privacy`, 
      lastModified: new Date(), 
      changeFrequency: 'yearly', 
      priority: 0.3 
    },
  ]

  // Fetch approved events from database
  try {
    const supabase = createServiceClient()
    const { data: events } = await supabase
      .from('events')
      .select('id, slug, updated_at, date')
      .eq('status', 'approved')
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true })

    const eventPages: MetadataRoute.Sitemap = (events || []).map((event: { id: string; slug: string | null; updated_at: string | null; date: string }) => ({
      url: `${baseUrl}/events/${event.slug || event.id}`,
      lastModified: event.updated_at ? new Date(event.updated_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

    return [...staticPages, ...eventPages]
  } catch (error) {
    console.error('Error fetching events for sitemap:', error)
    // Return static pages only if database fetch fails
    return staticPages
  }
}


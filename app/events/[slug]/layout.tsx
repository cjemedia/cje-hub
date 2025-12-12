import { Metadata } from 'next'
import { generateMetadata as createPageMetadata } from '@/lib/metadata'
import { createClient } from '@/lib/supabase/server'

type Props = {
  params: { slug: string }
}

// Generate metadata for dynamic event detail pages
// Note: When implementing event detail pages, update this to fetch actual event data
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const supabase = await createClient()
    
    // Fetch event by slug
    const { data: event } = await supabase
      .from('events')
      .select('title, description, date, location, image_urls, image_url')
      .eq('slug', params.slug)
      .single()
    
    if (event) {
      const eventDate = new Date(event.date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
      
      return createPageMetadata({
        title: event.title,
        description: event.description || `Join us on ${eventDate} at ${event.location} for ${event.title}.`,
        url: `/events/${params.slug}`,
        image: (event.image_urls && event.image_urls[0]) || event.image_url || undefined,
      })
    }
  } catch (error) {
    // Fall through to default metadata
  }
  
  // Fallback metadata
  return createPageMetadata({
    title: 'Event Details',
    description: 'View details for this upcoming event.',
    url: `/events/${params.slug}`,
  })
}

export default function EventDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


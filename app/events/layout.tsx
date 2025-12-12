import { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateMetadata({
  title: 'Events & Speaking',
  description: 'Book Ciara J. Evans for your next event. Keynote speaker, workshop facilitator, and host specializing in purpose-driven storytelling and strategic visibility.',
  url: '/events',
})

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


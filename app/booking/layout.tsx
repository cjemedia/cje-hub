import { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateMetadata({
  title: 'Book a Call',
  description: 'Schedule a consultation call with Ciara J. Evans. Discuss your project, goals, and how we can work together.',
  url: '/booking',
})

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


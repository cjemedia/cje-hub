import { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateMetadata({
  title: 'Coaching & Programs',
  description: 'Purpose-driven coaching programs for students and entrepreneurs. Scholarship preparation, personal branding, and strategic visibility.',
  url: '/coaching',
})

export default function CoachingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


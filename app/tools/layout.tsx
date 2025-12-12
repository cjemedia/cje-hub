import { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateMetadata({
  title: 'Tools & Resources',
  description: 'Essential tools and resources for purpose-driven entrepreneurs and business owners.',
  url: '/tools',
})

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


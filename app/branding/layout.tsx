import { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateMetadata({
  title: 'Branding & Web Design',
  description: 'Custom websites, client portals, and brand strategy. Fully custom design, mobile responsive, with free hosting and post-launch support.',
  url: '/branding',
})

export default function BrandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


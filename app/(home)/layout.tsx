import { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateMetadata({
  title: 'Home',
  description: 'Where creativity, clarity, and connection meet. Purpose-driven storytelling, speaking, and strategic visibility.',
  url: '/',
  image: '/images/cje19.png',
})

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


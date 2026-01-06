import Image from 'next/image'
import Link from 'next/link'

type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface LogoProps {
  size?: LogoSize
  href?: string
  className?: string
  inverted?: boolean
}

const sizeClasses: Record<LogoSize, string> = {
  xs: 'h-8 w-auto',
  sm: 'h-12 sm:h-16 w-auto max-w-[120px] sm:max-w-[160px]',
  md: 'h-16 sm:h-24 md:h-32 w-auto max-w-[200px] sm:max-w-[300px] md:max-w-[400px]',
  lg: 'h-24 sm:h-32 md:h-40 w-auto max-w-[300px] sm:max-w-[400px] md:max-w-[500px]',
  xl: 'h-32 md:h-40 w-auto max-w-[400px] md:max-w-[500px]',
}

export default function Logo({ 
  size = 'md', 
  href, 
  className = '',
  inverted = true 
}: LogoProps) {
  const imageElement = (
    <Image
      src="/images/cje-logo.png"
      alt="The CJE Experience"
      width={500}
      height={500}
      priority={size === 'lg' || size === 'xl'}
      quality={85}
      className={`${sizeClasses[size]} transition-opacity hover:opacity-80 ${inverted ? 'brightness-0 invert' : ''} ${className}`}
    />
  )

  if (href) {
    return (
      <Link href={href} className="group" aria-label="The CJE Experience - Home">
        {imageElement}
      </Link>
    )
  }

  return imageElement
}
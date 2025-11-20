import Link from 'next/link'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface ButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  icon?: LucideIcon
  className?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

export default function Button({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className = '',
  type = 'button',
  disabled = false,
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-tiffany'

  const variants = {
    primary:
      'bg-primary-tiffany text-primary-white hover:bg-primary-tiffany/90 shadow-lg hover:shadow-xl',
    secondary:
      'bg-primary-charcoal text-primary-white hover:bg-primary-charcoal/90 shadow-lg hover:shadow-xl',
    outline:
      'border-2 border-primary-tiffany text-primary-tiffany hover:bg-primary-tiffany hover:text-primary-white',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const disabledStyles = disabled
    ? 'opacity-50 cursor-not-allowed pointer-events-none'
    : ''
  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`

  const content = (
    <>
      {Icon && <Icon size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} className="mr-2" />}
      {children}
    </>
  )

  if (href) {
    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Link href={href} className={classes}>
          {content}
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={classes}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
    >
      {content}
    </motion.button>
  )
}



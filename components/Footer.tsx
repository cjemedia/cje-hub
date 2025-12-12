import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, Globe, Instagram, Linkedin } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-dark-light text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Image
              src="/images/cje-logo.png"
              alt="The CJE Experience"
              width={200}
              height={200}
              quality={85}
              className="h-auto w-[200px] brightness-0 invert"
            />
            <p className="text-white/70 text-sm">
              Inspiring purpose-driven action through storytelling, speaking, and strategic visibility.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-white/70 hover:text-accent transition-colors text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="text-white/70 hover:text-accent transition-colors text-sm"
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  href="/coaching"
                  className="text-white/70 hover:text-accent transition-colors text-sm"
                >
                  Coaching
                </Link>
              </li>
              <li>
                <Link
                  href="/booking"
                  className="text-white/70 hover:text-accent transition-colors text-sm"
                >
                  Book a Call
                </Link>
              </li>
              <li>
                <Link
                  href="/business-resources"
                  className="text-white/70 hover:text-accent transition-colors text-sm"
                >
                  B.Y.O.B.
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-white/70 hover:text-accent transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-white/70 hover:text-accent transition-colors text-sm"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-primary-white/70 text-sm">
                <Phone size={16} className="text-accent" />
                <a
                  href="tel:7737278262"
                  className="hover:text-primary-tiffany transition-colors"
                >
                  (773) 727-8262
                </a>
              </li>
              <li className="flex items-center space-x-3 text-primary-white/70 text-sm">
                <Mail size={16} className="text-accent" />
                <a
                  href="mailto:media@ciarajevans.com"
                  className="hover:text-primary-tiffany transition-colors"
                >
                  media@ciarajevans.com
                </a>
              </li>
              <li className="flex items-center space-x-3 text-primary-white/70 text-sm">
                <Globe size={16} className="text-accent" />
                <a
                  href="https://www.ciarajevans.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-tiffany transition-colors"
                >
                  www.ciarajevans.com
                </a>
              </li>
            </ul>
            <div className="flex items-center space-x-4 mt-6">
              <a
                href="https://instagram.com/ciaraj.media"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-accent transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://linkedin.com/in/ciarajevans"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-accent transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-white/50 flex flex-col md:flex-row items-center justify-center gap-3">
          <p>© {currentYear} The CJE Experience. All rights reserved.</p>
          <Link
            href="/privacy"
            className="text-white/70 hover:text-accent transition-colors"
          >
            Privacy Policy
          </Link>
          <span className="text-white/30">•</span>
          <Link
            href="/terms"
            className="text-white/70 hover:text-accent transition-colors"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  )
}


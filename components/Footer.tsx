import Link from 'next/link'
import { Mail, Phone, Globe, Instagram, Linkedin } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-dark-light text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <img
              src="/images/cje-media-logo.png"
              alt="CJE Media"
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
                  href="/speaking"
                  className="text-white/70 hover:text-accent transition-colors text-sm"
                >
                  Speaking
                </Link>
              </li>
              <li>
                <Link
                  href="/programs"
                  className="text-white/70 hover:text-accent transition-colors text-sm"
                >
                  Programs
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
                  href="https://cje-gk7q2rsk7-cje-media.vercel.app/hub/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-accent transition-colors text-sm"
                >
                  CJE Hub
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

        <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-white/50">
          <p>© {currentYear} CJE Media LLC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}


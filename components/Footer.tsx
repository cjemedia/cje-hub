import Link from 'next/link'
import { Mail, Phone, Globe, Instagram, Linkedin } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary-black text-primary-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <img
              src="/images/cje-media-logo.png"
              alt="CJE Media"
              className="h-auto w-[200px]"
            />
            <p className="text-primary-white/70 text-sm">
              Where creativity, clarity, and connection meet.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-primary-white/70 hover:text-primary-tiffany transition-colors text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-primary-white/70 hover:text-primary-tiffany transition-colors text-sm"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/booking"
                  className="text-primary-white/70 hover:text-primary-tiffany transition-colors text-sm"
                >
                  Book a Call
                </Link>
              </li>
              <li>
                <Link
                  href="https://cje-gk7q2rsk7-cje-media.vercel.app/hub/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-white/70 hover:text-primary-tiffany transition-colors text-sm"
                >
                  CJE Hub
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-serif text-lg mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-primary-white/70 text-sm">
                <Phone size={16} className="text-primary-tiffany" />
                <a
                  href="tel:7737278262"
                  className="hover:text-primary-tiffany transition-colors"
                >
                  (773) 727-8262
                </a>
              </li>
              <li className="flex items-center space-x-3 text-primary-white/70 text-sm">
                <Mail size={16} className="text-primary-tiffany" />
                <a
                  href="mailto:media@ciarajevans.com"
                  className="hover:text-primary-tiffany transition-colors"
                >
                  media@ciarajevans.com
                </a>
              </li>
              <li className="flex items-center space-x-3 text-primary-white/70 text-sm">
                <Globe size={16} className="text-primary-tiffany" />
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
                className="text-primary-white/70 hover:text-primary-tiffany transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://linkedin.com/in/ciarajevans"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-white/70 hover:text-primary-tiffany transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-white/10 mt-12 pt-8 text-center text-sm text-primary-white/50">
          <p>© {currentYear} CJE Media LLC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}


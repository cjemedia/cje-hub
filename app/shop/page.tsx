'use client'

import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Button from '@/components/Button'
import { ArrowRight, Package, FileText, CheckCircle, Mail, Target, GraduationCap, Sparkles } from 'lucide-react'

export default function ShopPage() {
  const products = [
    {
      icon: Target,
      title: 'Purpose Starter Kit',
      description: 'Essential resources to begin your purpose discovery journey, including worksheets, reflection prompts, and action guides.',
      status: 'coming-soon',
    },
    {
      icon: FileText,
      title: 'Goal-Setting & Life Alignment Workbook',
      description: 'A comprehensive workbook to help you set meaningful goals and align your daily actions with your long-term vision.',
      status: 'coming-soon',
    },
    {
      icon: CheckCircle,
      title: 'Brand Audit Checklist',
      description: 'A detailed checklist to evaluate your current brand presence and identify areas for improvement and growth.',
      status: 'coming-soon',
    },
    {
      icon: Mail,
      title: 'Pitch Email Templates',
      description: 'Professional email templates for pitching yourself, your services, or your brand to potential clients and partners.',
      status: 'coming-soon',
    },
    {
      icon: Package,
      title: 'Event Host Script Template',
      description: 'A customizable script template for hosting events, complete with transitions, engagement prompts, and timing notes.',
      status: 'coming-soon',
    },
    {
      icon: GraduationCap,
      title: 'Scholarship Resume + Essay Blueprint',
      description: 'Templates and guides for creating standout scholarship resumes and compelling application essays.',
      status: 'coming-soon',
    },
    {
      icon: Sparkles,
      title: 'Purpose Mapping Notion Template',
      description: 'A comprehensive Notion template to map out your purpose, goals, and action plans in one organized workspace.',
      status: 'coming-soon',
    },
  ]

  return (
    <main className="min-h-screen bg-dark overflow-x-hidden">
      <Navigation />

      {/* HERO SECTION */}
      <section className="relative min-h-[60vh] flex items-center justify-center bg-dark pt-32 pb-16">
        <div className="section-max-width text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-4 py-2 bg-accent/10 rounded-full mb-6">
              <span className="text-accent font-semibold text-sm">Digital Products</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Shop
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Purpose-driven resources, templates, and tools to accelerate your journey. 
              From brand building to scholarship success, find everything you need to take action.
            </p>
          </motion.div>
        </div>
      </section>

      {/* PRODUCTS GRID */}
      <section className="section-padding bg-dark-light">
        <div className="section-max-width">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-dark p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-white/20 flex flex-col"
              >
                <div className="w-16 h-16 bg-accent/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/30 transition-colors">
                  <product.icon size={32} className="text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{product.title}</h3>
                <p className="text-white/80 leading-relaxed mb-6 flex-grow">{product.description}</p>
                {product.status === 'coming-soon' ? (
                  <div className="pt-4 border-t border-white/10">
                    <span className="text-accent/70 text-sm font-medium">Coming Soon</span>
                  </div>
                ) : (
                  <Button href="/booking" variant="outline" size="md" className="mt-auto">
                    Get Now
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="section-padding bg-dark">
        <div className="section-max-width">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Need Something Custom?
            </h2>
            <p className="text-lg text-white/80 mb-8 leading-relaxed">
              Looking for personalized resources or have questions about upcoming products? Let's connect and discuss how we can support your journey.
            </p>
            <Button href="/booking" size="lg" className="btn-primary">
              <span>Get in Touch</span>
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}


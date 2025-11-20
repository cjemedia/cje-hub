'use client'

import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Button from '@/components/Button'
import { ArrowRight, Sparkles, Users, Target, Mail, Phone } from 'lucide-react'
import { useState } from 'react'

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      alert('Thank you for your message! We\'ll get back to you soon.')
      setFormData({ name: '', email: '', message: '' })
    } catch (error) {
      alert('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-white via-primary-white to-primary-charcoal/5 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl md:text-7xl font-serif font-bold text-primary-black"
            >
              Where Creativity,
              <br />
              <span className="text-primary-tiffany">Clarity</span>, and
              <br />
              Connection Meet
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl text-primary-charcoal/70 max-w-3xl mx-auto"
            >
              Marketing agency and event experiences for purpose-driven brands,
              creators, and entrepreneurs.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Button href="/services" size="lg" icon={ArrowRight}>
                Explore Services
              </Button>
              <Button href="/booking" variant="outline" size="lg">
                Book a Call
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-primary-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary-black mb-6">
                About Ciara J Evans
              </h2>
              <div className="space-y-4 text-primary-charcoal/80 leading-relaxed">
                <p>
                  At 26, Ciara J Evans is a dynamic creative director and
                  entrepreneur who has built CJE Media into a full-service
                  marketing agency and CJE Experiences into a transformative
                  event company.
                </p>
                <p>
                  With a passion for purpose-driven storytelling, Ciara helps
                  content creators, celebrities, attorneys, and entrepreneurs
                  build brands that resonate. Her approach blends strategic
                  thinking with creative excellence, ensuring every project
                  aligns with your vision and values.
                </p>
                <p>
                  Beyond strategy, Ciara is an accomplished public speaker and
                  MC, bringing energy and authenticity to every stage she
                  graces. Her work is for the culture—authentic, impactful, and
                  beautifully executed.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-2 gap-6"
            >
              {[
                { icon: Sparkles, label: 'Creative Strategy', value: '100+' },
                { icon: Users, label: 'Happy Clients', value: '50+' },
                { icon: Target, label: 'Events Hosted', value: '25+' },
                { icon: ArrowRight, label: 'Years Experience', value: '5+' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-primary-charcoal/5 p-6 rounded-lg text-center"
                >
                  <stat.icon
                    size={32}
                    className="text-primary-tiffany mx-auto mb-3"
                  />
                  <div className="text-3xl font-serif font-bold text-primary-black mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-primary-charcoal/70">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-primary-charcoal/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary-black mb-4">
              Let's Connect
            </h2>
            <p className="text-xl text-primary-charcoal/70">
              Ready to bring your vision to life? Get in touch.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <motion.a
              href="mailto:media@ciarajevans.com"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="bg-primary-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow flex items-center space-x-4"
            >
              <div className="bg-primary-tiffany/10 p-3 rounded-lg">
                <Mail size={24} className="text-primary-tiffany" />
              </div>
              <div>
                <div className="font-semibold text-primary-black">Email</div>
                <div className="text-primary-charcoal/70 text-sm">
                  media@ciarajevans.com
                </div>
              </div>
            </motion.a>

            <motion.a
              href="tel:7737278262"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="bg-primary-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow flex items-center space-x-4"
            >
              <div className="bg-primary-tiffany/10 p-3 rounded-lg">
                <Phone size={24} className="text-primary-tiffany" />
              </div>
              <div>
                <div className="font-semibold text-primary-black">Phone</div>
                <div className="text-primary-charcoal/70 text-sm">
                  (773) 727-8262
                </div>
              </div>
            </motion.a>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="bg-primary-white p-8 rounded-lg shadow-md"
          >
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-primary-charcoal mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-primary-charcoal/20 rounded-lg focus:ring-2 focus:ring-primary-tiffany focus:border-transparent"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-primary-charcoal mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-primary-charcoal/20 rounded-lg focus:ring-2 focus:ring-primary-tiffany focus:border-transparent"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-primary-charcoal mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-primary-charcoal/20 rounded-lg focus:ring-2 focus:ring-primary-tiffany focus:border-transparent resize-none"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </motion.form>
        </div>
      </section>

      <Footer />
    </main>
  )
}


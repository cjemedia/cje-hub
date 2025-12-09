'use client'

import Link from 'next/link'
import { useState } from 'react'
import { UtensilsCrossed, Menu, X } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export default function RestaurantMenu() {
  const [isOpen, setIsOpen] = useState(false)
  
  // Menu built from actual food photos - descriptions match what's in the images
  const menuSections = [
    {
      category: 'Appetizers',
      items: [
        { 
          name: 'Burrata & Prosciutto', 
          description: 'Creamy burrata cheese, thinly sliced prosciutto, arugula, cherry tomatoes, balsamic reduction, extra virgin olive oil', 
          price: '$18', 
          image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80' 
        },
        { 
          name: 'Tuna Tartare', 
          description: 'Fresh diced tuna, avocado, cucumber, sesame oil, soy sauce, microgreens, crispy wonton chips', 
          price: '$22', 
          image: 'https://images.unsplash.com/photo-1574781330855-d0db8cc4a8d2?w=800&q=80' 
        },
        { 
          name: 'Artisan Bruschetta', 
          description: 'Grilled sourdough, heirloom tomatoes, fresh basil, garlic, mozzarella, aged balsamic', 
          price: '$15', 
          image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80' 
        },
        { 
          name: 'Pan-Seared Scallops', 
          description: 'Large sea scallops, cauliflower purée, crispy pancetta, pea shoots, lemon beurre blanc', 
          price: '$28', 
          image: 'https://images.unsplash.com/photo-1609501676725-7186f3a1f24f?w=800&q=80' 
        },
      ],
    },
    {
      category: 'Mains',
      items: [
        { 
          name: 'Grilled Salmon', 
          description: 'Wild-caught salmon, roasted vegetables, quinoa pilaf, lemon herb butter, dill', 
          price: '$36', 
          image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800&q=80' 
        },
        { 
          name: 'Braised Beef Short Rib', 
          description: 'Slow-braised short ribs, creamy polenta, roasted root vegetables, red wine jus, fresh herbs', 
          price: '$44', 
          image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&q=80' 
        },
        { 
          name: 'Roasted Chicken', 
          description: 'Herb-roasted half chicken, garlic mashed potatoes, seasonal vegetables, natural jus', 
          price: '$32', 
          image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80' 
        },
        { 
          name: 'Wild Mushroom Risotto', 
          description: 'Creamy arborio rice, mixed wild mushrooms, parmesan, truffle oil, fresh parsley', 
          price: '$34', 
          image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&q=80' 
        },
        { 
          name: 'Prime Ribeye Steak', 
          description: 'Grilled ribeye, roasted potatoes, grilled asparagus, béarnaise sauce, red wine reduction', 
          price: '$52', 
          image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80' 
        },
      ],
    },
    {
      category: 'Desserts',
      items: [
        { 
          name: 'Warm Chocolate Cake', 
          description: 'Molten chocolate center, vanilla ice cream, fresh berries, chocolate sauce, mint', 
          price: '$16', 
          image: 'https://images.unsplash.com/photo-1606312619070-d48b4b2b0c8a?w=800&q=80' 
        },
        { 
          name: 'Classic Cheesecake', 
          description: 'New York style cheesecake, mixed berry compote, graham cracker crust, whipped cream', 
          price: '$14', 
          image: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=800&q=80' 
        },
        { 
          name: 'Tiramisu', 
          description: 'Espresso-soaked ladyfingers, mascarpone cream, cocoa powder, coffee beans, dark chocolate shavings', 
          price: '$15', 
          image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80' 
        },
        { 
          name: 'Vanilla Crème Brûlée', 
          description: 'Rich vanilla custard, caramelized sugar top, fresh berries, mint sprig', 
          price: '$13', 
          image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea4e6f1?w=800&q=80' 
        },
      ],
    },
    {
      category: 'Beverages',
      items: [
        { 
          name: 'Wine Selection', 
          description: 'Curated selection of wines by the glass or bottle, featuring local and international varietals', 
          price: '$12-$250', 
          image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80' 
        },
        { 
          name: 'Craft Cocktails', 
          description: 'House-crafted cocktails, classic favorites, seasonal specialties, premium spirits', 
          price: '$16', 
          image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&q=80' 
        },
        { 
          name: 'Champagne & Sparkling', 
          description: 'Selection of premium champagnes and sparkling wines, by the glass or bottle', 
          price: '$28-$600', 
          image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80' 
        },
        { 
          name: 'Espresso & Coffee', 
          description: 'Italian espresso, single-origin coffee, cappuccino, latte, macchiato', 
          price: '$7', 
          image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800&q=80' 
        },
      ],
    },
  ]

  return (
    <main className="min-h-screen bg-[#1a1612] text-white">
      {/* Demo Banner */}
      <div className="bg-[#81D8D0] text-dark text-center py-2 text-sm">
        This is a demo site. <a href="/demos" className="underline">View all demos</a>
      </div>
      {/* Simple Navigation */}
      <nav className="bg-black/60 backdrop-blur-sm border-b border-amber-900/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/demos/restaurant" className="text-2xl font-bold text-amber-400">
              Ember Restaurant
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/demos/restaurant" className="text-gray-300 hover:text-amber-400 font-medium">
                Home
              </Link>
              <Link href="/demos/restaurant/menu" className="text-amber-400 hover:text-amber-300 font-medium">
                Menu
              </Link>
              <Link href="/demos/restaurant/reservation" className="text-gray-300 hover:text-amber-400 font-medium">
                Reservation
              </Link>
              <Link href="/demos" className="text-xs text-gray-500 hover:text-gray-300">
                ← Demos
              </Link>
            </div>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-amber-400 hover:text-amber-300 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-black/95 border-t border-amber-900/30"
            >
              <div className="px-4 py-6 space-y-4">
                <Link
                  href="/demos/restaurant"
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-300 hover:text-amber-400 font-medium transition-colors py-2"
                >
                  Home
                </Link>
                <Link
                  href="/demos/restaurant/menu"
                  onClick={() => setIsOpen(false)}
                  className="block text-amber-400 hover:text-amber-300 font-medium transition-colors py-2"
                >
                  Menu
                </Link>
                <Link
                  href="/demos/restaurant/reservation"
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-300 hover:text-amber-400 font-medium transition-colors py-2"
                >
                  Reservation
                </Link>
                <Link
                  href="/demos"
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-500 hover:text-gray-300 text-xs py-2"
                >
                  ← Demos
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Menu Header */}
      <section className="relative h-[40vh] min-h-[300px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&q=80"
            alt="Food presentation"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/60" />
        </div>
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4">
              Our Menu
            </h1>
            <p className="text-xl text-gray-300">
              Chef's seasonal selection
            </p>
          </div>
        </div>
      </section>

      {/* Menu Content */}
      <section className="py-12 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {menuSections.map((section, sectionIndex) => (
            <motion.div 
              key={sectionIndex} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: sectionIndex * 0.1 }}
              className="mb-16 last:mb-0"
            >
              <div className="flex items-center gap-4 mb-8">
                <UtensilsCrossed size={28} className="text-amber-400" />
                <h2 className="text-3xl sm:text-4xl font-bold text-white">
                  {section.category}
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-amber-900/50 to-transparent" />
              </div>
              <div className="space-y-6 sm:space-y-8">
                {section.items.map((item, itemIndex) => (
                  <motion.div
                    key={itemIndex}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: itemIndex * 0.05 }}
                    className="py-6 border-b border-amber-900/20 last:border-0 hover:bg-white/5 transition-colors rounded-lg px-4"
                  >
                    <div className="w-full">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-2">
                        <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                        <span className="text-amber-400 font-bold text-lg whitespace-nowrap">
                          {item.price}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-black/40 border-t border-amber-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Dine With Us?
          </h2>
          <p className="text-gray-400 mb-8">
            Make a reservation to experience our seasonal menu.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/demos/restaurant"
              className="bg-gray-800 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Back to Home
            </Link>
            <Link
              href="/demos/restaurant/reservation"
              className="bg-amber-500 text-black px-8 py-3 rounded-lg font-medium hover:bg-amber-400 transition-colors inline-block"
            >
              Make Reservation
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-amber-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>© 2024 Ember Restaurant. Demo Site.</p>
        </div>
      </footer>
    </main>
  )
}

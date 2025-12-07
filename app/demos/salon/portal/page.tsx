'use client'

import Link from 'next/link'
import { Calendar, Clock, Star, Gift, Heart, LogOut } from 'lucide-react'

export default function SalonPortal() {
  const upcomingAppointments = [
    {
      date: 'Dec 15, 2024',
      time: '2:00 PM',
      service: 'Full Color & Cut',
      stylist: 'Emma',
    },
    {
      date: 'Dec 22, 2024',
      time: '11:00 AM',
      service: 'Blowout',
      stylist: 'Sarah',
    },
  ]

  const pastAppointments = [
    {
      date: 'Nov 28, 2024',
      service: 'Haircut & Style',
      stylist: 'Emma',
      rating: 5,
    },
    {
      date: 'Oct 15, 2024',
      service: 'Highlights',
      stylist: 'Sarah',
      rating: 5,
    },
  ]

  const favoriteServices = [
    'Full Color & Cut',
    'Blowout',
    'Deep Conditioning',
  ]

  return (
    <main className="min-h-screen bg-[#FAF8F5]">
      {/* Portal Navigation */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-rose-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-6">
              <Link href="/demos/salon" className="text-2xl font-serif font-light tracking-wider text-[#8B4A6B]">
                BELLE
              </Link>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-600 font-light tracking-wide">Client Portal</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm text-gray-600 font-light">Welcome, Maria</span>
              <Link href="/demos" className="text-xs text-gray-400 hover:text-gray-600">
                ← Demos
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Portal Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Welcome Section */}
        <div className="bg-[#8B4A6B] rounded-lg p-10 mb-10 text-white">
          <h1 className="text-4xl font-serif font-light mb-3 tracking-tight">Welcome back, Maria</h1>
          <p className="text-white/90 font-light">Manage your appointments and view your salon history.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-lg p-8 border border-rose-100/50">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-serif font-light text-[#2C2C2C] flex items-center gap-3 tracking-tight">
                  <Calendar size={24} className="text-[#8B4A6B]" />
                  Upcoming Appointments
                </h2>
                <Link
                  href="/demos/salon/services"
                  className="text-[#8B4A6B] hover:text-[#A05C7F] font-light text-sm tracking-wide transition-colors"
                >
                  Book New
                  <span className="text-[#D4A574] ml-1">→</span>
                </Link>
              </div>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appt, index) => (
                    <div
                      key={index}
                      className="border border-rose-100/50 rounded-lg p-6 hover:bg-[#FAF8F5] transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-light text-[#2C2C2C] mb-2 text-lg tracking-wide">{appt.service}</h3>
                          <div className="flex items-center gap-6 text-sm text-gray-600 font-light">
                            <span className="flex items-center gap-2">
                              <Clock size={16} className="text-[#8B4A6B]" />
                              {appt.date} at {appt.time}
                            </span>
                            <span>with {appt.stylist}</span>
                          </div>
                        </div>
                        <button className="text-[#8B4A6B] hover:text-[#A05C7F] text-sm font-light tracking-wide transition-colors">
                          Reschedule
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 font-light">No upcoming appointments.</p>
              )}
            </div>

            {/* Past Appointments */}
            <div className="bg-white rounded-lg p-8 border border-rose-100/50">
              <h2 className="text-2xl font-serif font-light text-[#2C2C2C] mb-8 tracking-tight">Appointment History</h2>
              <div className="space-y-6">
                {pastAppointments.map((appt, index) => (
                  <div
                    key={index}
                    className="border-b border-rose-100/50 pb-6 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-light text-[#2C2C2C] mb-2 text-lg tracking-wide">{appt.service}</h3>
                        <p className="text-sm text-gray-600 font-light">
                          {appt.date} • with {appt.stylist}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(appt.rating)].map((_, i) => (
                          <Star key={i} size={16} className="fill-[#D4A574] text-[#D4A574]" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Loyalty Points */}
            <div className="bg-[#FAF8F5] rounded-lg p-8 border border-[#D4A574]/30">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 border border-[#D4A574]/30 flex items-center justify-center">
                  <Gift size={24} className="text-[#D4A574]" />
                </div>
                <div>
                  <h3 className="font-light text-[#2C2C2C] mb-1 tracking-wide">Loyalty Points</h3>
                  <p className="text-3xl font-light text-[#8B4A6B]">1,250</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-6 font-light leading-relaxed">
                You're 250 points away from your next reward!
              </p>
              <button className="w-full bg-[#8B4A6B] text-white px-4 py-3 rounded-lg text-sm font-light tracking-wide hover:bg-[#A05C7F] transition-colors">
                View Rewards
              </button>
            </div>

            {/* Favorite Services */}
            <div className="bg-white rounded-lg p-8 border border-rose-100/50">
              <h3 className="font-light text-[#2C2C2C] mb-6 flex items-center gap-3 tracking-wide">
                <Heart size={20} className="text-[#8B4A6B]" />
                Favorite Services
              </h3>
              <ul className="space-y-3 mb-6">
                {favoriteServices.map((service, index) => (
                  <li key={index} className="text-sm text-gray-600 font-light flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-[#D4A574] rounded-full" />
                    {service}
                  </li>
                ))}
              </ul>
              <Link
                href="/demos/salon/services"
                className="text-[#8B4A6B] hover:text-[#A05C7F] text-sm font-light tracking-wide transition-colors inline-flex items-center gap-1"
              >
                Browse All Services
                <span className="text-[#D4A574]">→</span>
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg p-8 border border-rose-100/50">
              <h3 className="font-light text-[#2C2C2C] mb-6 tracking-wide">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/demos/salon/services"
                  className="block w-full bg-[#8B4A6B] text-white px-4 py-3 rounded-lg text-center font-light tracking-wide hover:bg-[#A05C7F] transition-colors"
                >
                  Book New Appointment
                </Link>
                <button className="block w-full bg-[#FAF8F5] text-[#2C2C2C] border border-rose-100/50 px-4 py-3 rounded-lg text-center font-light tracking-wide hover:bg-white transition-colors">
                  Update Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="bg-[#2C2C2C] text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm font-light">
          <p>© 2024 Belle Salon. Demo Site.</p>
        </div>
      </footer>
    </main>
  )
}


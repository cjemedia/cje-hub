'use client'

import { useState } from 'react'
import AdminSidebar from './AdminSidebar'
import { Menu } from 'lucide-react'

export default function AdminSidebarWrapper({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 relative pt-16 md:pt-0 md:ml-64">
        {/* Mobile hamburger button */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white hover:bg-[#1a1a1a]/80 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        )}
        {children}
      </main>
    </div>
  )
}


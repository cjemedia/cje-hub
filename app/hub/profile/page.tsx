import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="mb-8">
        <Link
          href="/hub/dashboard"
          className="inline-flex items-center gap-2 text-[#a1a1a1] hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl lg:text-4xl font-semibold text-white mb-2">
          Profile
        </h1>
        <p className="text-[#a1a1a1]">
          Update your contact information
        </p>
      </div>
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-12 text-center">
          <p className="text-white/70">
            Profile editing tools will live here. In the meantime, email media@ciarajevans.com for changes.
          </p>
        </div>
      </div>
    </div>
  )
}


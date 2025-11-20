import HubHeader from '@/components/HubHeader'

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-primary-white">
      <HubHeader title="Profile" subtitle="Update your contact information" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="border-2 border-primary-charcoal/10 rounded-2xl p-12 text-center text-primary-charcoal/70">
          Profile editing tools will live here. In the meantime, email media@ciarajevans.com for changes.
        </div>
      </div>
    </main>
  )
}


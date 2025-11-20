import HubHeader from '@/components/HubHeader'

export default function ClientsPage() {
  return (
    <main className="min-h-screen bg-primary-white">
      <HubHeader title="Clients" subtitle="Manage client profiles and invites" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="border-2 border-primary-charcoal/10 rounded-2xl p-12 text-center text-primary-charcoal/70">
          Admin tools for managing clients will appear here soon.
        </div>
      </div>
    </main>
  )
}


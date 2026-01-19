import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format } from 'date-fns'
import { AddClientButton } from '@/components/admin/AddClientButton'
import { Users, FolderKanban, Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getClients() {
  const supabase = await createClient()

  const { data: clients, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'client')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching clients:', error)
    return []
  }

  const clientsWithCounts = await Promise.all(
    (clients || []).map(async (client) => {
      const [projectsResult, bookingsResult] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact', head: true }).eq('user_id', client.id),
        supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('user_id', client.id),
      ])

      return {
        ...client,
        projectCount: projectsResult.count || 0,
        bookingCount: bookingsResult.count || 0,
      }
    })
  )

  return clientsWithCounts
}

export default async function AdminClientsPage() {
  const clients = await getClients()

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1 w-1 rounded-full bg-[#81D8D0]"></div>
              <span className="text-[#81D8D0] text-sm font-medium uppercase tracking-wider">Admin</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-semibold text-white mb-2">All Clients</h1>
            <p className="text-[#a1a1a1]">Manage and view all client information</p>
          </div>
          <AddClientButton />
        </div>

        {/* Client Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.length === 0 ? (
            <div className="col-span-full bg-[#1a1a1a] border border-[#333333] rounded-xl p-8 text-center text-[#a1a1a1]">
              No clients found
            </div>
          ) : (
            clients.map((client: any) => (
              <Link
                key={client.id}
                href={`/admin/clients/${client.id}`}
                className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-5 hover:border-[#81D8D0]/50 transition-colors flex flex-col"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-lg truncate">{client.name || 'N/A'}</h3>
                    <p className="text-[#a1a1a1] text-sm truncate">{client.email}</p>
                  </div>
                  {client.client_type && (
                    <span className="px-2 py-1 bg-[#81D8D0]/20 text-[#81D8D0] rounded text-xs font-medium flex-shrink-0">
                      {client.client_type}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-[#a1a1a1] mb-3">
                  <div className="flex items-center gap-1.5">
                    <FolderKanban size={14} className="text-[#81D8D0]" />
                    <span>{client.projectCount} project{client.projectCount !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#81D8D0]" />
                    <span>{client.bookingCount} booking{client.bookingCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div className="mt-auto pt-3 border-t border-[#333333] text-xs text-[#a1a1a1]">
                  Added {format(new Date(client.created_at), 'MMM d, yyyy')}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

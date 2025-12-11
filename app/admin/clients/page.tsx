import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { format } from 'date-fns'

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

  // Get counts for each client
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
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1 w-1 rounded-full bg-[#81D8D0]"></div>
            <span className="text-[#81D8D0] text-sm font-medium uppercase tracking-wider">Admin</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-semibold text-white mb-2">All Clients</h1>
          <p className="text-[#a1a1a1]">Manage and view all client information</p>
        </div>

        {/* Search/Filter */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a1a1a1]" size={20} />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full bg-[#1a1a1a] border border-[#333333] rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#81D8D0] transition-colors"
            />
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0a0a0a] border-b border-[#333333]">
                <tr>
                  <th className="text-left px-6 py-4 text-white/80 text-sm font-semibold">Name</th>
                  <th className="text-left px-6 py-4 text-white/80 text-sm font-semibold">Email</th>
                  <th className="text-left px-6 py-4 text-white/80 text-sm font-semibold">Client Type</th>
                  <th className="text-left px-6 py-4 text-white/80 text-sm font-semibold">Projects</th>
                  <th className="text-left px-6 py-4 text-white/80 text-sm font-semibold">Bookings</th>
                  <th className="text-left px-6 py-4 text-white/80 text-sm font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#a1a1a1]">
                      No clients found
                    </td>
                  </tr>
                ) : (
                  clients.map((client: any) => (
                    <tr
                      key={client.id}
                      className="border-b border-[#333333] hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <Link href={`/admin/clients/${client.id}`} className="text-white hover:text-[#81D8D0] transition-colors">
                          {client.name || 'N/A'}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-[#a1a1a1]">{client.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-[#81D8D0]/20 text-[#81D8D0] rounded text-xs font-medium">
                          {client.client_type || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white">{client.projectCount || 0}</td>
                      <td className="px-6 py-4 text-white">{client.bookingCount || 0}</td>
                      <td className="px-6 py-4 text-[#a1a1a1] text-sm">
                        {format(new Date(client.created_at), 'MMM d, yyyy')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}


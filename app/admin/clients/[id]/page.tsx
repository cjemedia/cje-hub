import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft } from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'

export const dynamic = 'force-dynamic'

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Fetch client by ID
  const { data: client } = await supabase
    .from('users')
    .select('*')
    .eq('id', params.id)
    .single()

  // Fetch their projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', params.id)
    .order('created_at', { ascending: false })

  // Fetch their bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', params.id)
    .order('date', { ascending: false })

  if (!client) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white/70">Client not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/clients"
            className="inline-flex items-center gap-2 text-[#81D8D0] hover:text-[#81D8D0]/80 transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            Back to Clients
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1 w-1 rounded-full bg-[#81D8D0]"></div>
            <span className="text-[#81D8D0] text-sm font-medium uppercase tracking-wider">Admin</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-semibold text-white mb-2">{client.name || 'Client'}</h1>
          <p className="text-[#a1a1a1]">Client details and activity</p>
        </div>

        {/* Client Info Card */}
        <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/60 uppercase tracking-wider mb-1 block">Name</label>
              <p className="text-white">{client.name || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs text-white/60 uppercase tracking-wider mb-1 block">Email</label>
              <p className="text-white">{client.email || 'N/A'}</p>
            </div>
            {client.company && (
              <div>
                <label className="text-xs text-white/60 uppercase tracking-wider mb-1 block">Company</label>
                <p className="text-white">{client.company}</p>
              </div>
            )}
            {client.phone && (
              <div>
                <label className="text-xs text-white/60 uppercase tracking-wider mb-1 block">Phone</label>
                <p className="text-white">{client.phone}</p>
              </div>
            )}
            <div>
              <label className="text-xs text-white/60 uppercase tracking-wider mb-1 block">Created</label>
              <p className="text-white">
                {client.created_at ? format(new Date(client.created_at), 'MMM d, yyyy') : 'N/A'}
              </p>
            </div>
            {client.client_type && (
              <div>
                <label className="text-xs text-white/60 uppercase tracking-wider mb-1 block">Client Type</label>
                <span className="inline-block px-2 py-1 bg-[#81D8D0]/20 text-[#81D8D0] rounded text-sm font-medium">
                  {client.client_type}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Projects Section */}
        <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Projects ({projects?.length || 0})</h2>
          {!projects || projects.length === 0 ? (
            <p className="text-[#a1a1a1] text-sm">No projects found for this client.</p>
          ) : (
            <div className="space-y-3">
              {projects.map((project: any) => (
                <Link
                  key={project.id}
                  href={`/admin/projects/${project.id}`}
                  className="block p-4 border border-[#333333] rounded-lg hover:border-[#81D8D0]/50 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{project.name || 'Untitled Project'}</p>
                      {project.description && (
                        <p className="text-sm text-[#a1a1a1] mt-1 line-clamp-1">{project.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {project.status && <StatusBadge status={project.status} />}
                        {project.service_type && (
                          <span className="text-xs text-[#a1a1a1]">{project.service_type}</span>
                        )}
                        {project.created_at && (
                          <span className="text-xs text-[#a1a1a1]">
                            Created {format(new Date(project.created_at), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Bookings Section */}
        <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Bookings ({bookings?.length || 0})</h2>
          {!bookings || bookings.length === 0 ? (
            <p className="text-[#a1a1a1] text-sm">No bookings found for this client.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0a0a0a] border-b border-[#333333]">
                  <tr>
                    <th className="text-left px-4 py-3 text-white/80 text-sm font-semibold">Date</th>
                    <th className="text-left px-4 py-3 text-white/80 text-sm font-semibold">Time</th>
                    <th className="text-left px-4 py-3 text-white/80 text-sm font-semibold">Type</th>
                    <th className="text-left px-4 py-3 text-white/80 text-sm font-semibold">Duration</th>
                    <th className="text-left px-4 py-3 text-white/80 text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking: any) => (
                    <tr key={booking.id} className="border-b border-[#333333] hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-white">
                        {booking.date ? format(new Date(booking.date), 'MMM d, yyyy') : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-[#a1a1a1]">{booking.time || 'N/A'}</td>
                      <td className="px-4 py-3 text-[#a1a1a1]">{booking.type || 'N/A'}</td>
                      <td className="px-4 py-3 text-[#a1a1a1]">{booking.duration ? `${booking.duration} min` : 'N/A'}</td>
                      <td className="px-4 py-3">
                        {booking.status && <StatusBadge status={booking.status} />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText, Download, CheckCircle, Clock } from 'lucide-react'
import HubHeader from '@/components/HubHeader'

export default function ProjectsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/hub/login')
        return
      }

      setUser(user)
      // TODO: Fetch projects from Supabase
      // const { data } = await supabase
      //   .from('projects')
      //   .select('*')
      //   .eq('client_id', user.id)
      // setProjects(data || [])
    }

    getUser()
  }, [router])

  return (
    <main className="min-h-screen bg-primary-white">
      <HubHeader
        user={user}
        showBackButton
        backHref="/hub/dashboard"
        title="Projects & Deliverables"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary-white border-2 border-primary-charcoal/10 rounded-lg p-12 text-center"
          >
            <FileText size={48} className="text-primary-charcoal/30 mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold text-primary-black mb-2">
              No Projects Yet
            </h2>
            <p className="text-primary-charcoal/70">
              Your active projects and deliverables will appear here once they're
              assigned.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary-white border-2 border-primary-charcoal/10 rounded-lg p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-primary-black mb-2">
                      {project.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-primary-charcoal/70">
                      <span
                        className={`px-3 py-1 rounded-full ${
                          project.status === 'active'
                            ? 'bg-primary-tiffany/10 text-primary-tiffany'
                            : project.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                  </div>
                </div>

                {project.deliverables && project.deliverables.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-primary-black mb-4">
                      Deliverables
                    </h4>
                    <div className="space-y-3">
                      {project.deliverables.map((deliverable: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-4 bg-primary-charcoal/5 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <FileText size={20} className="text-primary-tiffany" />
                            <span className="text-primary-charcoal">
                              {deliverable.name}
                            </span>
                          </div>
                          <button className="flex items-center space-x-2 text-primary-tiffany hover:underline">
                            <Download size={18} />
                            <span className="text-sm">Download</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}


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

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-12">
        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary-white border-2 border-primary-charcoal/10 rounded-lg p-6 sm:p-8 lg:p-12 text-center"
          >
            <FileText size={36} className="sm:w-12 sm:h-12 text-primary-charcoal/30 mx-auto mb-3 sm:mb-4" />
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary-black mb-2">
              No Projects Yet
            </h2>
            <p className="text-sm sm:text-base text-primary-charcoal/70">
              Your active projects and deliverables will appear here once they're
              assigned.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary-white border-2 border-primary-charcoal/10 rounded-lg p-4 sm:p-6 lg:p-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-primary-black mb-2 break-words">
                      {project.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-xs sm:text-sm text-primary-charcoal/70">
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${
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
                    <h4 className="font-semibold text-sm sm:text-base text-primary-black mb-3 sm:mb-4">
                      Deliverables
                    </h4>
                    <div className="space-y-2 sm:space-y-3">
                      {project.deliverables.map((deliverable: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-primary-charcoal/5 rounded-lg gap-2 sm:gap-0"
                        >
                          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                            <FileText size={18} className="sm:w-5 sm:h-5 text-primary-tiffany flex-shrink-0" />
                            <span className="text-sm sm:text-base text-primary-charcoal truncate">
                              {deliverable.name}
                            </span>
                          </div>
                          <button className="flex items-center justify-center sm:justify-start space-x-2 text-primary-tiffany hover:underline text-sm sm:text-base">
                            <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
                            <span>Download</span>
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


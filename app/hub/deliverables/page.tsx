'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Download, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useHubUser } from '@/components/hub/HubUserProvider'

export default function DeliverablesPage() {
  const { user } = useHubUser()
  const [deliverables, setDeliverables] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDeliverables = async () => {
      if (!user) return
      const supabase = createClient()

      const { data } = await supabase
        .from('deliverables')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setDeliverables(data || [])
      setLoading(false)
    }

    loadDeliverables()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8">
        <div className="min-h-[60vh] flex items-center justify-center text-[#a1a1a1]">
          Loading resources...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link
          href="/hub/dashboard"
          className="inline-flex items-center gap-2 text-[#a1a1a1] hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl lg:text-4xl font-semibold text-white mb-2">
          Resources
        </h1>
        <p className="text-[#a1a1a1]">
          Download your project deliverables and resources.
        </p>
      </motion.div>

      {deliverables.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-12 text-center"
        >
          <Download className="w-16 h-16 text-[#a1a1a1]/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Resources Yet</h2>
          <p className="text-[#a1a1a1]">
            Your project deliverables and resources will appear here once they're
            available.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {deliverables.map((deliverable) => (
            <motion.div
              key={deliverable.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 hover:border-[#81D8D0]/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-[#81D8D0]/10 text-[#81D8D0] w-12 h-12 rounded-lg flex items-center justify-center">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {deliverable.name || 'Untitled Resource'}
                    </h3>
                    {deliverable.description && (
                      <p className="text-sm text-[#a1a1a1]">{deliverable.description}</p>
                    )}
                  </div>
                </div>
                <button className="bg-[#81D8D0] text-[#0a0a0a] px-6 py-3 rounded-lg font-medium hover:bg-[#81D8D0]/90 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl">
                  <Download size={18} />
                  Download
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}


import { cn } from '@/lib/utils'

const statusConfig: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  inquiry: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Inquiry' },
  consultation: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Consultation' },
  proposal: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Proposal' },
  confirmed: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Confirmed' },
  asset_collection: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Asset Collection' },
  in_progress: { bg: 'bg-[#81D8D0]/20', text: 'text-[#81D8D0]', label: 'In Progress' },
  active: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Active' },
  completed: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Completed' },
  cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Cancelled' },
  // Invoice statuses
  pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pending' },
  paid: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Paid' },
  overdue: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Overdue' },
}

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.pending
  return (
    <span
      className={cn(
        'px-2 py-1 rounded-full text-xs font-medium',
        config.bg,
        config.text
      )
    }
    >
      {config.label}
    </span>
  )
}


import { cn } from '@/lib/utils'

const statusConfig: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  inquiry: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Inquiry' },
  pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pending' },
  confirmed: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Confirmed' },
  in_progress: { bg: 'bg-accent/20', text: 'text-accent', label: 'In Progress' },
  completed: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Completed' },
  cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Cancelled' },
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


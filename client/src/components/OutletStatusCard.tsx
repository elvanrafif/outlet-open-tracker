type OutletStatus = 'open' | 'closed' | 'unknown'

interface OutletStatusCardProps {
  name: string
  address: string
  status: OutletStatus
  openUntil?: string
}

const statusConfig: Record<OutletStatus, { label: string; dot: string; badge: string }> = {
  open: {
    label: 'Open',
    dot: 'bg-green-500',
    badge: 'bg-green-100 text-green-700',
  },
  closed: {
    label: 'Closed',
    dot: 'bg-red-500',
    badge: 'bg-red-100 text-red-700',
  },
  unknown: {
    label: 'Unknown',
    dot: 'bg-gray-400',
    badge: 'bg-gray-100 text-gray-600',
  },
}

export function OutletStatusCard({ name, address, status, openUntil }: OutletStatusCardProps) {
  const { label, dot, badge } = statusConfig[status]

  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-col gap-1 text-left">
        <span className="font-semibold text-gray-900 dark:text-gray-100">{name}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">{address}</span>
        {status === 'open' && openUntil && (
          <span className="text-xs text-gray-400 dark:text-gray-500">Open until {openUntil}</span>
        )}
      </div>

      <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${badge}`}>
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        {label}
      </span>
    </div>
  )
}

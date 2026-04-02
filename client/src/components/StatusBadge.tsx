import { cn } from '@/lib/utils';

export type StatusType = 'on_track' | 'at_risk' | 'overdue' | 'completed' | string;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  showDot?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  on_track:  { label: "On Track",  className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  at_risk:   { label: "At Risk",   className: "bg-amber-500/10  text-amber-600  dark:text-amber-400  border-amber-500/20"  },
  overdue:   { label: "Overdue",   className: "bg-red-500/10    text-red-600    dark:text-red-400    border-red-500/20"    },
  completed: { label: "Completed", className: "bg-blue-500/10   text-blue-600   dark:text-blue-400   border-blue-500/20"   },
};

export const StatusBadge = ({ status, className, showDot = true }: StatusBadgeProps) => {
  const config = STATUS_CONFIG[status] || { label: status, className: "bg-muted text-muted-foreground border-border" };

  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
      config.className,
      className
    )}>
      {showDot && (
        <span className={cn("mr-1.5 h-1 w-1 rounded-full", config.className.split(' ')[1].replace('text-', 'bg-'))} />
      )}
      {config.label}
    </span>
  );
};

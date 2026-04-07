import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  color?: string;
  className?: string;
}

export const MetricCard = ({
  label,
  value,
  icon: Icon,
  description,
  color = "text-primary",
  className,
}: MetricCardProps) => {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 md:p-5 flex items-center gap-4 shadow-sm", className)}>
      <div className={cn("p-2.5 rounded-lg bg-muted shrink-0", color.replace('text-', 'bg-').replace('/40', '/10'))}>
        <Icon className={cn("h-5 w-5", color)} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className={cn("text-xl md:text-2xl font-bold tracking-tight leading-none mt-1", color)}>{value}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1.5 truncate">{description}</p>
        )}
      </div>
    </div>
  );
};

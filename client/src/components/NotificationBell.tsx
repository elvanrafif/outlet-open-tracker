import { useState, useRef, useEffect } from "react";
import { Bell, AlertTriangle, Clock } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export const NotificationBell = () => {
  const { notifications, loading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const hasNotifs = notifications.length > 0;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifikasi${hasNotifs ? ` (${notifications.length})` : ""}`}
      >
        <Bell className={cn("h-4 w-4", hasNotifs && "text-primary")} />
        {hasNotifs && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white ring-2 ring-background">
            {notifications.length > 9 ? "9+" : notifications.length}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop — mobile only */}
          <div
            className="fixed inset-0 z-[100] md:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          <div
            className={cn(
              // Mobile: fixed bottom sheet
              "fixed inset-0 z-[101] flex items-end justify-center p-4",
              // Desktop: absolute dropdown anchored to bell button
              "md:absolute md:inset-auto md:right-0 md:top-full md:mt-2 md:flex md:items-start md:justify-normal md:p-0"
            )}
          >
            <div className="relative z-50 w-full md:w-80 pointer-events-auto animate-in fade-in slide-in-from-bottom-4 md:slide-in-from-top-2 duration-300">
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl ring-1 ring-black/5 dark:ring-white/5">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Alerts</h3>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">System Notifications</p>
                    </div>
                  </div>
                  {hasNotifs && (
                    <span className="rounded-full bg-destructive text-[10px] font-black text-white px-2 py-0.5">
                      {notifications.length}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="max-h-[60svh] md:max-h-[480px] overflow-y-auto no-scrollbar py-2">
                  {loading && (
                    <div className="p-6 text-center text-xs text-muted-foreground">
                      Memuat notifikasi...
                    </div>
                  )}

                  {!loading && notifications.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-8 gap-2">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <Bell className="h-5 w-5 text-muted-foreground/40" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">Semua task aman</p>
                      <p className="text-xs text-muted-foreground/60 text-center">
                        Tidak ada task yang mendekati deadline atau terlambat.
                      </p>
                    </div>
                  )}

                  {!loading && notifications.length > 0 && (
                    <div className="px-3 space-y-1 pb-3">
                      {notifications.map((notif) => (
                        <Link
                          key={notif.id}
                          to={`/project/${notif.projectId}`}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex flex-col gap-1.5 rounded-xl p-4 transition-all cursor-pointer border",
                            notif.type === "overdue"
                              ? "bg-destructive/5 hover:bg-destructive/10 border-destructive/10 hover:border-destructive/30"
                              : "bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/10 hover:border-amber-300/30"
                          )}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 truncate">
                              {notif.projectName}
                            </span>
                            {notif.type === "overdue" ? (
                              <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                            ) : (
                              <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-sm font-bold text-foreground tracking-tight leading-snug">{notif.taskName}</p>
                          <p className={cn(
                            "text-[10px] font-bold uppercase tracking-tight",
                            notif.type === "overdue" ? "text-destructive" : "text-amber-600 dark:text-amber-400"
                          )}>
                            {notif.type === "overdue"
                              ? "Action required: Task is overdue"
                              : `Opening in ${notif.daysLeft} days`}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

import { useState } from "react";
import { Bell, AlertTriangle, Clock, X } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export const NotificationBell = () => {
  const { notifications, loading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const hasNotifs = notifications.length > 0;

  return (
    <div className="relative">
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
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="fixed inset-0 z-40 md:absolute md:inset-auto md:right-0 md:top-full md:mt-2 md:w-80 flex items-end md:items-start justify-center md:justify-normal pointer-events-none"
          >
            {/* Mobile backdrop */}
            <div
              className="md:hidden absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
              onClick={() => setIsOpen(false)}
            />

            <div className="relative z-50 w-full md:w-auto pointer-events-auto animate-in fade-in slide-in-from-bottom-2 md:slide-in-from-top-1 duration-200">
              <div className="mx-4 mb-4 md:mx-0 md:mb-0 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">Notifikasi</h3>
                    {hasNotifs && (
                      <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-bold text-destructive">
                        {notifications.length}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    aria-label="Tutup notifikasi"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="max-h-[65svh] overflow-y-auto">
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
                    <div className="p-2 space-y-1">
                      {notifications.map((notif) => (
                        <Link
                          key={notif.id}
                          to={`/project/${notif.projectId}`}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex flex-col gap-1 rounded-xl p-3 transition-colors cursor-pointer",
                            notif.type === "overdue"
                              ? "bg-destructive/8 hover:bg-destructive/12 border border-destructive/20"
                              : "bg-amber-500/8 hover:bg-amber-500/12 border border-amber-500/20"
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                              {notif.projectName}
                            </span>
                            {notif.type === "overdue" ? (
                              <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />
                            ) : (
                              <Clock className="h-3 w-3 text-amber-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-sm font-semibold text-foreground leading-tight">{notif.taskName}</p>
                          <p className={cn(
                            "text-xs",
                            notif.type === "overdue" ? "text-destructive" : "text-amber-600 dark:text-amber-400"
                          )}>
                            {notif.type === "overdue"
                              ? "Tugas ini sudah melewati deadline!"
                              : `Deadline dalam ${notif.daysLeft} hari lagi.`}
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

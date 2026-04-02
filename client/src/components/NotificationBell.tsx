import { useState } from "react";
import { Bell, AlertTriangle, Clock, X } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export const NotificationBell = () => {
  const { notifications, loading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative rounded-full hover:bg-muted"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className={cn("h-5 w-5", notifications.length > 0 && "text-primary animate-bounce-slow")} />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white border-2 border-background">
            {notifications.length}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-40 md:absolute md:inset-auto md:right-0 md:top-full md:mt-2 md:w-80 md:animate-in md:fade-in md:zoom-in-95 duration-200">
          {/* Backdrop for mobile */}
          <div className="md:hidden fixed inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          
          <div className="relative z-50 overflow-hidden rounded-xl border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b bg-muted/50 p-4">
              <h3 className="font-bold text-sm">Notifications</h3>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="max-h-[70svh] overflow-y-auto p-2 scrollbar-hide">
              {loading && <p className="p-4 text-center text-xs text-muted-foreground">Scanning tasks...</p>}
              
              {!loading && notifications.length === 0 && (
                <div className="p-8 text-center">
                  <Bell className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-xs text-muted-foreground">No urgent tasks at the moment.</p>
                </div>
              )}

              {notifications.map((notif) => (
                <Link 
                  key={notif.id} 
                  to={`/project/${notif.projectId}`}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex flex-col gap-1 rounded-lg p-3 text-left transition-colors hover:bg-muted mb-1 last:mb-0",
                    notif.type === 'overdue' ? "border-l-4 border-destructive bg-destructive/5" : "border-l-4 border-yellow-500 bg-yellow-500/5"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {notif.projectName}
                    </span>
                    {notif.type === 'overdue' ? (
                      <AlertTriangle className="h-3 w-3 text-destructive" />
                    ) : (
                      <Clock className="h-3 w-3 text-yellow-500" />
                    )}
                  </div>
                  <h4 className="text-sm font-semibold leading-tight">{notif.taskName}</h4>
                  <p className="text-xs text-muted-foreground">
                    {notif.type === 'overdue' ? 'Tugas ini sudah telat!' : `Deadline dalam ${notif.daysLeft} hari lagi.`}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

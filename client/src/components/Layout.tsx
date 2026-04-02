import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useTransition } from '@/components/PageTransition';
import { pb } from '@/lib/pb';
import {
  Users,
  LogOut,
  Building2,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { NotificationBell } from '@/components/NotificationBell';
import type { Division } from '@/types/index';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
}

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

export const Layout = ({ children, title, actions }: LayoutProps) => {
  const { user, logout } = useAuth();
  const { triggerTransition } = useTransition();
  const navigate = useNavigate();

  const handleLogout = () => {
    triggerTransition(() => { logout(); navigate("/login"); }, "rtl");
  };
  const location = useLocation();
  const [isProfileOpen, setIsEditProfileOpen] = useState(false);
  const [divisions, setDivisions] = React.useState<Division[]>([]);

  const isAdmin = user?.role === 'superadmin';
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsEditProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  React.useEffect(() => {
    const fetchDivisions = async () => {
      try {
        const records = await pb.collection('divisions').getFullList<Division>();
        setDivisions(records);
      } catch (err) {
        console.error('Error fetching divisions in layout:', err);
      }
    };
    fetchDivisions();
  }, []);

  const divisionName = user?.divisionId 
    ? divisions.find(d => d.id === user.divisionId)?.name || user.divisionId
    : '';

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      {/* ── Top Navbar ── */}
      <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40 flex items-center shrink-0 no-print">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-8 flex items-center justify-between gap-4">
          {/* Left: Logo (Icon Only) */}
          <Link to="/" className="flex items-center group transition-all">
            <div className="p-2.5 rounded-xl bg-primary text-primary-foreground shrink-0 shadow-lg shadow-primary/20 group-hover:scale-110 transition-all border border-white/10">
              <Building2 className="h-5 w-5" />
            </div>
          </Link>

          {/* Center: Title (Responsive) */}
          {title && (
            <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 pointer-events-none">
              <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">{title}</h1>
            </div>
          )}

          {/* Right: Actions & Profile */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              {actions}
              <NotificationBell />
            </div>

            <div className="flex items-center gap-3">
              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setIsEditProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1 pl-1 pr-2 rounded-full border border-border bg-muted/30 hover:bg-muted transition-all cursor-pointer group shadow-sm"
                >
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-black border border-white/10">
                    {user ? getInitials(user.name) : "?"}
                  </div>
                  <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", isProfileOpen && "rotate-180")} />
                </button>

                {isProfileOpen && (
                    <div className="absolute right-0 top-full mt-3 w-64 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                      {/* Profile Header */}
                      <div className="p-5 border-b border-border bg-muted/20">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-sm font-black">
                            {user ? getInitials(user.name) : "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black uppercase tracking-tight truncate text-foreground">{user?.name}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5 truncate">{user?.email}</p>
                          </div>
                        </div>
                        {(divisionName || isAdmin) && (
                          <div className="mt-4 inline-flex items-center rounded-lg bg-primary/10 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-primary border border-primary/10">
                            {isAdmin ? 'Superadmin' : divisionName}
                          </div>
                        )}
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        {isAdmin && (
                          <Link to="/users" onClick={() => setIsEditProfileOpen(false)}>
                            <div className={cn(
                              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                              location.pathname === '/users' ? "bg-primary/5 text-primary" : "hover:bg-muted text-muted-foreground hover:text-foreground"
                            )}>
                              <Users className="h-4 w-4" />
                              <span className="text-[11px] font-black uppercase tracking-widest">User Management</span>
                            </div>
                          </Link>
                        )}
                        
                        <Link to="/settings" onClick={() => setIsEditProfileOpen(false)}>
                          <div className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                            location.pathname === '/settings' ? "bg-primary/5 text-primary" : "hover:bg-muted text-muted-foreground hover:text-foreground"
                          )}>
                            <Settings className="h-4 w-4 group-hover:rotate-45 transition-transform" />
                            <span className="text-[11px] font-black uppercase tracking-widest">Account Settings</span>
                          </div>
                        </Link>
                      </div>

                      {/* Footer / Logout */}
                      <div className="p-2 border-t border-border bg-muted/10">
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive/70 hover:text-destructive hover:bg-destructive/5 transition-all group cursor-pointer"
                        >
                          <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                          <span className="text-[11px] font-black uppercase tracking-widest">Logout</span>
                        </button>
                      </div>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto animate-in fade-in duration-500">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
          {children}
        </div>
      </main>
    </div>
  );
};

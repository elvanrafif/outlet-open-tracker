import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProjects";
import {
  LogOut, Plus, MapPin, Loader2, Users, Building2,
  ChevronRight, CalendarDays, LayoutGrid, TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { pb } from "@/lib/pb";
import { NotificationBell } from "@/components/NotificationBell";
import { DEFAULT_TASKS } from "@/lib/taskTemplates";
import type { Project } from "@/types/index";

const STATUS_CONFIG = {
  on_track:  { label: "On Track",  className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" },
  at_risk:   { label: "At Risk",   className: "bg-amber-100  text-amber-700  dark:bg-amber-900/40  dark:text-amber-400"  },
  overdue:   { label: "Overdue",   className: "bg-red-100    text-red-700    dark:bg-red-900/40    dark:text-red-400"    },
  completed: { label: "Completed", className: "bg-blue-100   text-blue-700   dark:bg-blue-900/40   dark:text-blue-400"   },
} as const;

const inputClass = cn(
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm",
  "placeholder:text-muted-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary",
  "transition-colors"
);

const selectClass = cn(
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary",
  "transition-colors cursor-pointer"
);

const progressBarColor = (pct: number) =>
  pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-primary" : "bg-amber-500";

// ─── Mobile project card ──────────────────────────────────────────────────────
const ProjectCard = ({ project }: { project: Project }) => {
  const statusCfg = STATUS_CONFIG[project.status as keyof typeof STATUS_CONFIG];
  return (
    <Link to={`/project/${project.id}`} className="block">
      <div className="rounded-xl border border-border bg-card p-4 active:bg-muted/40 transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
              {project.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-foreground truncate text-sm">{project.name}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5 truncate">
                <MapPin className="h-3 w-3 shrink-0" />{project.address}
              </p>
            </div>
          </div>
          <span className={cn("shrink-0 inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold", statusCfg?.className)}>
            {statusCfg?.label}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
          <span className="border border-border rounded px-1.5 py-0.5">{project.type.replace("_", " ")}</span>
          <span>{project.brand}</span>
          <span className="ml-auto">
            {new Date(project.openingDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2.5">
          <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-700", progressBarColor(project.progress))}
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-foreground tabular-nums w-8 text-right">{project.progress}%</span>
          <ChevronRight className="h-4 w-4 text-primary shrink-0" />
        </div>
      </div>
    </Link>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
export const DashboardPage = () => {
  const { projects, loading, refresh } = useProjects();
  const { logout, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "", address: "", type: "mall", brand: "", openingDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const project = await pb.collection("projects").create({
        ...formData, status: "on_track", progress: 0, isLocked: false,
      });
      const divisions = await pb.collection("divisions").getFullList();
      const taskPromises = DEFAULT_TASKS.map((tmpl) => {
        const div = divisions.find(
          (d) => d.name.trim().toLowerCase() === tmpl.division.trim().toLowerCase()
        );
        if (!div) return null;
        return pb.collection("tasks").create({
          projectId: project.id, divisionId: div.id, name: tmpl.name, isCompleted: false,
        });
      }).filter(Boolean);
      await Promise.all(taskPromises);
      setIsModalOpen(false);
      setFormData({ name: "", address: "", type: "mall", brand: "", openingDate: "" });
      refresh();
    } catch (err) {
      console.error("Error creating project:", err);
      alert("Gagal membuat project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSuperadmin = user?.role === "superadmin";
  const stats = {
    total:   projects.length,
    onTrack: projects.filter((p) => p.status === "on_track").length,
    atRisk:  projects.filter((p) => p.status === "at_risk").length,
    overdue: projects.filter((p) => p.status === "overdue").length,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-foreground tracking-tight">Outlet Tracker</span>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2">
            <NotificationBell />
            {isSuperadmin && (
              <>
                <Link to="/users">
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground cursor-pointer px-2 md:px-3">
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Users</span>
                  </Button>
                </Link>
                <Button size="sm" className="gap-2 cursor-pointer px-2 md:px-3" onClick={() => setIsModalOpen(true)}>
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">New Project</span>
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={logout}
              className="gap-2 text-muted-foreground hover:text-destructive cursor-pointer px-2 md:px-3">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 md:py-8 space-y-6 md:space-y-8 animate-in fade-in duration-300">
        {/* Page heading */}
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          {user && (
            <p className="text-sm text-muted-foreground mt-0.5">
              Selamat datang, <span className="font-medium text-foreground">{user.name}</span>
              <span className="ml-1.5 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                {user.role === "superadmin" ? "Superadmin" : "Staff"}
              </span>
            </p>
          )}
        </div>

        {/* Stats */}
        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            <StatCard icon={<LayoutGrid className="h-4 w-4" />} label="Total"    value={stats.total}   color="text-foreground" />
            <StatCard icon={<TrendingUp className="h-4 w-4" />}  label="On Track" value={stats.onTrack} color="text-emerald-600 dark:text-emerald-400" />
            <StatCard icon={<CalendarDays className="h-4 w-4" />} label="At Risk" value={stats.atRisk}  color="text-amber-600 dark:text-amber-400" />
            <StatCard icon={<CalendarDays className="h-4 w-4" />} label="Overdue" value={stats.overdue} color="text-red-600 dark:text-red-400" />
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>

        /* Empty state */
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 md:p-20 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Belum ada project yang berjalan.</p>
            {isSuperadmin && (
              <Button size="sm" className="mt-4 gap-2 cursor-pointer" onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4" /> Buat Project Pertama
              </Button>
            )}
          </div>

        ) : (
          <>
            {/* ── Mobile: card list (< md) ── */}
            <div className="md:hidden space-y-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            {/* ── Tablet / Desktop: table (md+) ── */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Outlet</th>
                    <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-center hidden lg:table-cell">Tipe</th>
                    <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-center">Target Opening</th>
                    <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-center">Status</th>
                    <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground min-w-[140px]">Progress</th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {projects.map((project) => {
                    const statusCfg = STATUS_CONFIG[project.status as keyof typeof STATUS_CONFIG];
                    return (
                      <tr key={project.id} className="group hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                              {project.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-foreground truncate">{project.name}</span>
                              <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5 truncate">
                                <MapPin className="h-3 w-3 shrink-0" />{project.address}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center hidden lg:table-cell">
                          <span className="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {project.type.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-sm text-foreground font-medium">
                              {new Date(project.openingDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{project.brand}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={cn("inline-flex rounded-md px-2.5 py-1 text-[11px] font-bold", statusCfg?.className ?? "bg-muted text-muted-foreground")}>
                            {statusCfg?.label ?? project.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                              <div
                                className={cn("h-full rounded-full transition-all duration-700", progressBarColor(project.progress))}
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-foreground tabular-nums w-9 text-right">{project.progress}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link to={`/project/${project.id}`}>
                            <Button variant="ghost" size="sm"
                              className="gap-1.5 text-primary hover:bg-primary/10 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                              Detail <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      {/* ── New Project Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            <div className="mb-4 md:mb-5">
              <h2 className="text-lg font-bold text-foreground">Buat Project Baru</h2>
              <p className="text-sm text-muted-foreground mt-0.5">33 task akan di-generate otomatis.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-sm font-medium text-foreground">Nama Outlet</label>
                  <input required className={inputClass} value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Outlet Sudirman" />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-sm font-medium text-foreground">Alamat</label>
                  <input required className={inputClass} value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Alamat lengkap lokasi" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Tipe</label>
                  <select className={selectClass} value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                    <option value="mall">Mall</option>
                    <option value="stand_alone">Stand Alone</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Brand</label>
                  <input required className={inputClass} value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="JCO / BreadTalk" />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-sm font-medium text-foreground">Target Opening</label>
                  <input required type="date" className={inputClass} value={formData.openingDate}
                    onChange={(e) => setFormData({ ...formData, openingDate: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-2.5 pt-1">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="cursor-pointer">Batal</Button>
                <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</> : "Buat Project"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Stat card ────────────────────────────────────────────────────────────────
interface StatCardProps { icon: React.ReactNode; label: string; value: number; color: string }
const StatCard = ({ icon, label, value, color }: StatCardProps) => (
  <div className="rounded-xl border border-border bg-card px-3 md:px-4 py-3 md:py-3.5 flex items-center gap-2.5 md:gap-3 shadow-sm">
    <div className={cn("p-1.5 md:p-2 rounded-lg bg-muted shrink-0", color)}>{icon}</div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-lg md:text-xl font-bold leading-tight", color)}>{value}</p>
    </div>
  </div>
);

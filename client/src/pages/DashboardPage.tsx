import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProjects";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Plus, MapPin, Loader2,
  CalendarDays, TrendingUp, AlertTriangle,
  Search, X,
  Building2, Lock,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { pb } from "@/lib/pb";
import { DEFAULT_TASKS } from "@/lib/taskTemplates";
import type { Project } from "@/types/index";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import { Layout } from "@/components/Layout";
import { StatusBadge } from "@/components/StatusBadge";

const TYPE_CONFIG = {
  mall:       { label: "Mall",       className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  stand_alone: { label: "Stand Alone", className: "bg-teal-500/10   text-teal-600   dark:text-teal-400   border-teal-500/20"   },
} as const;

const progressBarColor = (pct: number) =>
  pct >= 100 ? "bg-emerald-500" : pct >= 50 ? "bg-primary" : "bg-amber-500";

// ─── Mobile project card ──────────────────────────────────────────────────────
const ProjectCard = ({ project }: { project: Project }) => {
  const typeCfg = TYPE_CONFIG[project.type as keyof typeof TYPE_CONFIG];
  const relativeTime = useRelativeTime(project.openingDate);
  const relativeTimeColor =
    project.status === "overdue" ? "text-destructive" :
    project.status === "at_risk" ? "text-amber-500 dark:text-amber-400" :
    "text-primary/70";

  return (
    <Link to={`/project/${project.id}`} className="block">
      <div className="rounded-xl border border-border bg-card p-4 active:bg-muted/40 transition-colors shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-bold text-foreground text-sm tracking-tight">{project.name}</p>
            <p className="flex items-start gap-1 text-[10px] text-muted-foreground mt-1">
              <MapPin className="h-2.5 w-2.5 shrink-0 mt-px" />{project.address}
            </p>
          </div>
          <StatusBadge status={project.status} showDot={false} className="shrink-0 whitespace-nowrap" />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className={cn("inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-black uppercase tracking-tight", typeCfg?.className)}>
            {typeCfg?.label}
          </span>
          <span className="text-[10px] font-black uppercase tracking-tight text-muted-foreground">{project.brand}</span>
          <div className="ml-auto text-right">
            <p className="text-[10px] font-bold text-foreground/80 leading-none">
              {new Date(project.openingDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
            </p>
            <p className={cn("text-[9px] font-black uppercase tracking-tighter mt-1", relativeTimeColor)}>{relativeTime}</p>
          </div>
        </div>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <span>Progress</span>
            <span className="tabular-nums text-foreground">{project.progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-700", progressBarColor(project.progress))}
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
};

// ─── Desktop Table Row ────────────────────────────────────────────────────────
const ProjectTableRow = ({ project }: { project: Project }) => {
  const typeCfg = TYPE_CONFIG[project.type as keyof typeof TYPE_CONFIG];
  const relativeTime = useRelativeTime(project.openingDate);
  const navigate = useNavigate();
  const relativeTimeColor =
    project.status === "overdue" ? "text-destructive" :
    project.status === "at_risk" ? "text-amber-500 dark:text-amber-400" :
    "text-primary";

  return (
    <tr
      className="group hover:bg-muted/30 transition-colors cursor-pointer"
      onClick={() => navigate(`/project/${project.id}`)}
    >
      <td className="px-5 py-4">
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-foreground truncate tracking-tight">{project.name}</span>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5 max-w-[240px]">
            <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/60" />
            <span className="truncate">{project.address}</span>
          </span>
        </div>
      </td>
      <td className="px-5 py-4">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight">{project.brand}</span>
      </td>
      <td className="px-5 py-4 text-center">
        <span className={cn("inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-black uppercase tracking-tight", typeCfg?.className)}>
          {typeCfg?.label}
        </span>
      </td>
      <td className="px-5 py-4 text-center">
        <div className="flex flex-col items-center">
          <span className="text-sm text-foreground font-bold tracking-tight">
            {new Date(project.openingDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <span className={cn("text-[10px] font-black uppercase tracking-tighter mt-0.5", relativeTimeColor)}>{relativeTime}</span>
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <StatusBadge status={project.status} showDot={false} />
            <span className="tabular-nums text-[11px] font-bold text-foreground">{project.progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-700", progressBarColor(project.progress))}
              style={{ width: `${project.progress}%` }}
            />
          </div>
          {project.isLocked && (
            <span className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tight bg-destructive/10 text-destructive border-destructive/30">
              <Lock className="h-2.5 w-2.5" />
              Locked
            </span>
          )}
        </div>
      </td>
    </tr>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
export const DashboardPage = () => {
  const { projects, loading, refresh } = useProjects();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeModal = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsModalClosing(false);
    }, 250);
  };

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
      closeModal();
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

  // ── Summary metrics ──
  const [overdueTaskCount, setOverdueTaskCount] = useState(0);

  useEffect(() => {
    if (projects.length === 0) return;
    const today = new Date().toISOString().split("T")[0];
    pb.collection("tasks")
      .getList(1, 1, {
        filter: `isCompleted = false && deadline != "" && deadline < "${today}"`,
        fields: "id",
      })
      .then((r) => setOverdueTaskCount(r.totalItems))
      .catch(() => {});
  }, [projects]);

  const activeProjects = projects.filter((p) => p.status !== "completed");
  const avgProgress = activeProjects.length > 0
    ? Math.round(activeProjects.reduce((sum, p) => sum + p.progress, 0) / activeProjects.length)
    : 0;

  const nextOpening = [...activeProjects]
    .sort((a, b) => new Date(a.openingDate).getTime() - new Date(b.openingDate).getTime())[0] ?? null;

  // ── Search & filter state ──
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredProjects = projects.filter((p) => {
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      const match = [p.name, p.address, p.brand].some((f) => f.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (typeFilter !== "all" && p.type !== typeFilter) return false;
    return true;
  });

  const hasFilters = !!debouncedSearch || statusFilter !== "all" || typeFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
  };


  return (
    <Layout 
      title="Dashboard"
      actions={isSuperadmin && (
        <Button size="sm" className="gap-2 cursor-pointer px-3 h-8 text-xs font-bold uppercase tracking-wider" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New Project</span>
        </Button>
      )}
    >
      <div className="space-y-6 md:space-y-8">
        {/* Summary Cards */}
        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            {/* Avg Progress */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-primary/10 shrink-0">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-black tracking-tight text-foreground mt-0.5">{avgProgress}%</p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700", progressBarColor(avgProgress))}
                    style={{ width: `${avgProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Next Opening */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-amber-500/10 shrink-0">
                <CalendarDays className="h-5 w-5 text-amber-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Next Opening</p>
                {nextOpening ? (
                  <>
                    <p className="text-sm font-black tracking-tight text-foreground mt-0.5 truncate">{nextOpening.name}</p>
                    <p className="text-[11px] font-bold text-muted-foreground mt-0.5">
                      {new Date(nextOpening.openingDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </>
                ) : (
                  <p className="text-sm font-black text-muted-foreground mt-0.5">—</p>
                )}
              </div>
            </div>

            {/* Overdue Tasks */}
            <div className={cn(
              "rounded-xl border bg-card p-5 shadow-sm flex items-center gap-4",
              overdueTaskCount > 0 ? "border-destructive/30" : "border-border"
            )}>
              <div className={cn("p-2.5 rounded-lg shrink-0", overdueTaskCount > 0 ? "bg-destructive/10" : "bg-muted")}>
                <AlertTriangle className={cn("h-5 w-5", overdueTaskCount > 0 ? "text-destructive" : "text-muted-foreground")} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Overdue Tasks</p>
                <p className={cn("text-2xl font-black tracking-tight mt-0.5", overdueTaskCount > 0 ? "text-destructive" : "text-foreground")}>
                  {overdueTaskCount}
                </p>
                <p className="text-[11px] font-bold text-muted-foreground mt-0.5">across all projects</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Loading projects...</p>
            </div>
          </div>

        /* Empty state */
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 md:p-24 text-center bg-card/50">
            <div className="p-4 rounded-full bg-muted/50 mb-4">
              <Building2 className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No Projects Found</h3>
            <p className="text-sm text-muted-foreground max-w-xs mt-1">Get started by creating your first outlet opening tracker.</p>
            {isSuperadmin && (
              <Button size="sm" className="mt-6 gap-2 cursor-pointer h-9 px-4 font-bold uppercase tracking-wider" onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4" /> Create Project
              </Button>
            )}
          </div>

        ) : (
          <div className="space-y-4">
            {/* ── Search & Filter bar ── */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              {/* Search */}
              <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 group-focus-within:text-primary transition-colors pointer-events-none" />
                <Input
                  placeholder="Search projects, brands, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8 text-sm placeholder:text-muted-foreground/40 bg-card"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-destructive transition-colors cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 shrink-0">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="text-xs font-bold cursor-pointer w-[130px] bg-card">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent align="end" className="rounded-xl">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="on_track">On Track</SelectItem>
                    <SelectItem value="at_risk">At Risk</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="text-xs font-bold cursor-pointer w-[120px] bg-card">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent align="end" className="rounded-xl">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="mall">Mall</SelectItem>
                    <SelectItem value="stand_alone">Stand Alone</SelectItem>
                  </SelectContent>
                </Select>

                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-all cursor-pointer shrink-0"
                    title="Reset Filters"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Content Display */}
            <div className="animate-in slide-in-from-bottom-2 duration-500">
              {/* ── Mobile: card list (< md) ── */}
              <div className="md:hidden space-y-3">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>

              {/* ── Tablet / Desktop: table (md+) ── */}
              <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-card">
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 w-[260px]">Outlet & Location</th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 w-[100px]">Brand</th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 text-center w-[100px]">Type</th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 text-center w-[140px]">Opening Date</th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 w-[200px]">Status & Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredProjects.map((project) => (
                      <ProjectTableRow key={project.id} project={project} />
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredProjects.length === 0 && (
                <div className="py-20 text-center rounded-xl border border-dashed border-border bg-muted/10">
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No matching projects found</p>
                  <Button variant="link" size="sm" onClick={clearFilters} className="mt-2 text-primary font-bold uppercase tracking-tight text-xs">Clear all filters</Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── New Project Modal ── */}
      {isModalOpen && (
        <div
          className={cn(
            "fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm p-0 sm:p-4",
            isModalClosing
              ? "animate-out fade-out duration-250"
              : "animate-in fade-in duration-200"
          )}
          onClick={closeModal}
        >
          <div
            className={cn(
              "w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border border-border bg-card p-6 shadow-2xl",
              isModalClosing
                ? "animate-out slide-out-to-bottom sm:zoom-out-95 duration-250"
                : "animate-in slide-in-from-bottom sm:zoom-in-95 duration-300"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground tracking-tight">Create New Project</h2>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Setup opening checklist</p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-muted transition-colors cursor-pointer">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Outlet Name</label>
                  <Input required value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Outlet Sudirman" 
                    className="h-10 px-4 bg-muted/20 border-border/50 focus:bg-background transition-all"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Location Address</label>
                  <Input required value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Full street address" 
                    className="h-10 px-4 bg-muted/20 border-border/50 focus:bg-background transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Site Type</label>
                  <select className="flex h-10 w-full rounded-lg border border-border/50 bg-muted/20 px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer" 
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                    <option value="mall">Mall</option>
                    <option value="stand_alone">Stand Alone</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Brand</label>
                  <Input required value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="JCO / BreadTalk" 
                    className="h-10 px-4 bg-muted/20 border-border/50 focus:bg-background transition-all"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Target Opening Date</label>
                  <Input required type="date" value={formData.openingDate}
                    onChange={(e) => setFormData({ ...formData, openingDate: e.target.value })} 
                    className="h-10 px-4 bg-muted/20 border-border/50 focus:bg-background transition-all"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={closeModal} className="cursor-pointer font-bold uppercase tracking-wider text-xs">Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="cursor-pointer px-6 font-bold uppercase tracking-wider text-xs shadow-md">
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Create Tracker"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

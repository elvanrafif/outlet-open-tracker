import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, Circle, ChevronDown, ChevronUp,
  Calendar, Printer, FileSpreadsheet, Loader2, Pencil, Lock, MapPin, Store,
  Info,
} from "lucide-react";
import { useProjectDetail } from "@/hooks/useProjectDetail";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/index";
import * as XLSX from "xlsx";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import { Layout } from "@/components/Layout";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";

const TYPE_CONFIG = {
  mall: { label: "Mall", className: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400" },
  stand_alone: { label: "Stand Alone", className: "bg-teal-500/10 text-teal-600 border-teal-500/20 dark:text-teal-400" },
};

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { project, tasks, divisions, loading, updateTask, updateProject } = useProjectDetail(id);
  const [expandedDivisions, setExpandedDivisions] = useState<string[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<{
    name: string; 
    address: string; 
    type: "mall" | "stand_alone"; 
    brand: string; 
    openingDate: string;
    isLocked: boolean;
  }>({
    name: "", address: "", type: "mall", brand: "", openingDate: "", isLocked: false,
  });

  const isSuperadmin = user?.role === "superadmin";

  useEffect(() => {
    if (project) {
      setEditForm({
        name: project.name,
        address: project.address,
        type: project.type as "mall" | "stand_alone",
        brand: project.brand,
        openingDate: project.openingDate?.slice(0, 10) ?? "",
        isLocked: project.isLocked || false,
      });
    }
  }, [project]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <Layout title="Project Not Found">
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-2xl">
          <p className="text-destructive font-bold uppercase tracking-widest">Project Not Found</p>
          <p className="text-sm text-muted-foreground mt-2">The requested project ID does not exist or has been removed.</p>
        </div>
      </Layout>
    );
  }

  const relativeOpeningTime = useRelativeTime(project.openingDate);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const result = await updateProject(editForm);
    if (!result?.success) alert("Gagal menyimpan perubahan project.");
    setIsSaving(false);
    setIsEditOpen(false);
  };

  const toggleDivision = (divId: string) => {
    setExpandedDivisions((prev) =>
      prev.includes(divId) ? prev.filter((d) => d !== divId) : [...prev, divId]
    );
  };

  const handleToggleTask = async (task: Task) => {
    if (project?.isLocked) {
      alert("Project ini sudah dikunci/selesai.");
      return;
    }
    const isChecking = !task.isCompleted;
    await updateTask(task.id, {
      isCompleted: isChecking,
      lastEditedBy: isChecking ? user?.id : null,
      lastEditedAt: isChecking ? new Date().toISOString() : null,
    });
  };

  const exportToExcel = () => {
    const data = tasks.map((t) => ({
      Divisi: divisions.find((d) => d.id === t.divisionId)?.name || "-",
      "Nama Task": t.name,
      PIC: t.pic || "-",
      Deadline: t.deadline ? new Date(t.deadline).toLocaleDateString("id-ID") : "-",
      Status: t.isCompleted ? "SELESAI" : "BELUM",
      "Terakhir Diedit": t.expand?.lastEditedBy?.name || "-",
      "Waktu Edit": t.lastEditedAt ? new Date(t.lastEditedAt).toLocaleString("id-ID") : "-",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Checklist");
    XLSX.writeFile(wb, `Checklist_${project.name.replace(/\s+/g, "_")}.xlsx`);
  };

  const headerActions = (
    <div className="flex items-center gap-2">
      {isSuperadmin && (
        <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}
          className="h-8 gap-2 cursor-pointer text-xs font-bold uppercase tracking-wider px-3 border-border/60 hover:bg-accent transition-all">
          <Pencil className="h-3.5 w-3.5 text-primary" />
          <span className="hidden sm:inline">Edit</span>
        </Button>
      )}
      <Button variant="outline" size="sm" onClick={exportToExcel}
        className="h-8 gap-2 cursor-pointer text-xs font-bold uppercase tracking-wider px-3 border-emerald-500/20 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all">
        <FileSpreadsheet className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Excel</span>
      </Button>
      <Button variant="outline" size="sm" onClick={() => window.print()}
        className="h-8 gap-2 cursor-pointer text-xs font-bold uppercase tracking-wider px-3 border-blue-500/20 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all">
        <Printer className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Print</span>
      </Button>
    </div>
  );

  return (
    <Layout title={`Project: ${project.name}`} actions={headerActions}>
      {/* ── Main content ── */}
      <div className="space-y-6 md:space-y-8">
        {/* Info card */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm no-print">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Left: Identity */}
            <div className="flex items-start gap-4 min-w-0">
              <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0 border border-primary/20">
                <Store className="h-5 w-5" />
              </div>
              <div className="min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground font-black uppercase tracking-widest">{project.brand}</span>
                  <span className={cn(
                    "text-[9px] font-black px-1.5 py-0.5 rounded border uppercase tracking-widest",
                    TYPE_CONFIG[project.type as keyof typeof TYPE_CONFIG]?.className
                  )}>
                    {TYPE_CONFIG[project.type as keyof typeof TYPE_CONFIG]?.label}
                  </span>
                </div>
                <h1 className="text-lg font-black text-foreground uppercase tracking-tight leading-none">{project.name}</h1>
                <p className="flex items-start gap-1.5 text-xs text-muted-foreground font-medium">
                  <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/60 mt-0.5" />
                  {project.address}
                </p>
              </div>
            </div>

            {/* Divider mobile */}
            <div className="block sm:hidden h-px bg-border -mx-5" />

            {/* Right: Opening + Progress */}
            <div className="flex flex-col justify-between gap-4 sm:border-l sm:border-border sm:pl-5">
              {/* Opening date row */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Target Opening</p>
                  <p className="text-sm font-bold text-foreground tracking-tight">
                    {new Date(project.openingDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <p className={cn(
                  "text-[11px] font-black uppercase tracking-widest mt-5 shrink-0",
                  project.status === "overdue" ? "text-destructive" :
                  project.status === "at_risk"  ? "text-amber-500 dark:text-amber-400" :
                  "text-primary"
                )}>{relativeOpeningTime}</p>
              </div>

              {/* Progress + status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <StatusBadge status={project.status} showDot={false} />
                  <span className="text-xs font-black tabular-nums text-foreground">{project.progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700",
                      project.progress === 100 ? "bg-emerald-500" : project.progress >= 50 ? "bg-primary" : "bg-amber-500"
                    )}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Division accordions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Checklist by Division
            </h2>
            {project.isLocked && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-destructive/10 text-[10px] font-black text-destructive uppercase tracking-widest border border-destructive/30">
                <Lock className="h-3 w-3" />
                Locked
              </span>
            )}
          </div>

          <div className="grid gap-3">
            {divisions.map((division) => {
              const divTasks = tasks.filter((t) => t.divisionId === division.id);
              if (divTasks.length === 0) return null;

              const completedCount = divTasks.filter((t) => t.isCompleted).length;
              const isExpanded = expandedDivisions.includes(division.id);
              const isUserDivision = user?.divisionId === division.id;
              const allDone = completedCount === divTasks.length;
              const progressPct = Math.round((completedCount / divTasks.length) * 100);

              return (
                <div key={division.id} className={cn(
                  "rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm",
                  isExpanded ? "border-primary/30 bg-card" : "border-border bg-card/50 hover:bg-card hover:border-border/80",
                  isUserDivision && !isExpanded && "ring-1 ring-primary/10"
                )}>
                  {/* Accordion toggle */}
                  <button onClick={() => toggleDivision(division.id)}
                    className="w-full px-5 py-4 flex items-center justify-between no-print cursor-pointer group">
                    <div className="flex items-center gap-4 text-left min-w-0">
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors",
                        allDone 
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400" 
                          : "bg-muted text-muted-foreground border-border/50 group-hover:bg-muted/80"
                      )}>
                        {allDone
                          ? <CheckCircle2 className="h-5 w-5" />
                          : <span className="text-[11px] font-black tabular-nums">{completedCount}/{divTasks.length}</span>
                        }
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm text-foreground tracking-tight uppercase">{division.name}</h3>
                          {isUserDivision && (
                            <span className="text-[8px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">
                              My Division
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">
                          {allDone ? "Full completion" : `${divTasks.length - completedCount} tasks remaining`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 ml-4">
                      <div className="hidden sm:flex flex-col items-end gap-1.5 mr-2">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-muted-foreground/60">
                          <span className="tabular-nums">{progressPct}%</span>
                        </div>
                        <div className="h-1 w-24 rounded-full bg-muted overflow-hidden">
                          <div className={cn("h-full rounded-full transition-all duration-500", allDone ? "bg-emerald-500" : "bg-primary")}
                            style={{ width: `${progressPct}%` }} />
                        </div>
                      </div>
                      <div className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        isExpanded ? "bg-primary/10 text-primary" : "text-muted-foreground group-hover:bg-muted"
                      )}>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>
                  </button>

                  {/* Task list expanded */}
                  {isExpanded && (
                    <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-300">
                      <div className="overflow-hidden rounded-xl border border-border bg-muted/5">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-border bg-muted/20">
                              <th className="px-4 py-2.5 font-black uppercase tracking-widest text-muted-foreground/70 w-12 text-center">Status</th>
                              <th className="px-4 py-2.5 font-black uppercase tracking-widest text-muted-foreground/70">Task Description</th>
                              <th className="px-4 py-2.5 font-black uppercase tracking-widest text-muted-foreground/70 w-24">PIC</th>
                              <th className="px-4 py-2.5 font-black uppercase tracking-widest text-muted-foreground/70 w-28">Deadline</th>
                              <th className="px-4 py-2.5 font-black uppercase tracking-widest text-muted-foreground/70 text-right hidden lg:table-cell">Log Activity</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/50">
                            {divTasks.map((task) => (
                              <tr key={task.id} className="hover:bg-muted/20 transition-colors group/row">
                                <td className="px-4 py-3 text-center">
                                  <button
                                    onClick={() => handleToggleTask(task)}
                                    disabled={project?.isLocked || (!isSuperadmin && user?.divisionId !== task.divisionId)}
                                    className={cn(
                                      "transition-all shrink-0",
                                      task.isCompleted ? "text-emerald-500" : "text-muted-foreground/20",
                                      (project?.isLocked || (!isSuperadmin && user?.divisionId !== task.divisionId))
                                        ? "opacity-40 cursor-not-allowed"
                                        : "cursor-pointer hover:scale-110 active:scale-95 hover:text-primary"
                                    )}
                                  >
                                    {task.isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                                  </button>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex flex-col">
                                    <span className={cn(
                                      "font-bold text-foreground text-sm tracking-tight transition-all",
                                      task.isCompleted && "line-through text-muted-foreground/40"
                                    )}>
                                      {task.name}
                                    </span>
                                    {task.detail && (
                                      <span className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1 italic">{task.detail}</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="font-bold text-muted-foreground/80 uppercase text-[10px] tracking-tight">{task.pic || "—"}</span>
                                </td>
                                <td className="px-4 py-3">
                                  {task.deadline ? (
                                    <div className="flex items-center gap-1.5">
                                      <Calendar className="h-3 w-3 text-muted-foreground/40" />
                                      <span className={cn(
                                        "font-bold tabular-nums text-[11px]",
                                        !task.isCompleted && new Date(task.deadline) < new Date() ? "text-red-500" : "text-muted-foreground"
                                      )}>
                                        {new Date(task.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground/20 text-xs">—</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-right hidden lg:table-cell">
                                  {task.expand?.lastEditedBy ? (
                                    <div className="flex flex-col items-end gap-0.5">
                                      <span className="text-[10px] font-black text-foreground/70 uppercase tracking-widest">{task.expand.lastEditedBy.name}</span>
                                      <span className="text-[9px] font-bold text-muted-foreground tabular-nums uppercase">
                                        {new Date(task.lastEditedAt!).toLocaleString("id-ID", {
                                          hour: "2-digit", minute: "2-digit", day: "numeric", month: "short",
                                        })}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground/10 text-[10px] font-black uppercase tracking-widest">No Log</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Edit Project Modal ── */}
      {isEditOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground tracking-tight">Edit Project Details</h2>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Modify outlet configuration</p>
              </div>
              <button onClick={() => setIsEditOpen(false)} className="p-2 rounded-full hover:bg-muted transition-colors cursor-pointer">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Outlet Name</label>
                  <Input required value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="h-10 px-4 bg-muted/20 border-border/50 focus:bg-background transition-all"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Location Address</label>
                  <Input required value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="h-10 px-4 bg-muted/20 border-border/50 focus:bg-background transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Site Type</label>
                  <select className="flex h-10 w-full rounded-lg border border-border/50 bg-muted/20 px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer" 
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value as any })}>
                    <option value="mall">Mall</option>
                    <option value="stand_alone">Stand Alone</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Brand</label>
                  <Input required value={editForm.brand}
                    onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                    className="h-10 px-4 bg-muted/20 border-border/50 focus:bg-background transition-all"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Target Opening Date</label>
                  <Input required type="date" value={editForm.openingDate}
                    onChange={(e) => setEditForm({ ...editForm, openingDate: e.target.value })} 
                    className="h-10 px-4 bg-muted/20 border-border/50 focus:bg-background transition-all"
                  />
                </div>
                
                {/* Status Selesai / Locked */}
                <div className="col-span-2 pt-2">
                  <label className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-all group">
                    <input 
                      type="checkbox" 
                      className="h-5 w-5 rounded-md border-border text-primary focus:ring-primary transition-all cursor-pointer"
                      checked={editForm.isLocked}
                      onChange={(e) => setEditForm({ ...editForm, isLocked: e.target.checked })}
                    />
                    <div className="flex-1">
                      <p className="text-xs font-black uppercase tracking-widest text-foreground">Seal Project Data</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mt-0.5">Locks all checklists and marks as final.</p>
                    </div>
                    {editForm.isLocked && <Lock className="h-4 w-4 text-amber-500 animate-in zoom-in-50 duration-300" />}
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} className="cursor-pointer font-bold uppercase tracking-wider text-xs">Cancel</Button>
                <Button type="submit" disabled={isSaving} className="cursor-pointer px-6 font-bold uppercase tracking-wider text-xs shadow-md">
                  {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

const X = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

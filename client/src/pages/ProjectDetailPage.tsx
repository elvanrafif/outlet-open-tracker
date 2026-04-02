import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, CheckCircle2, Circle, ChevronDown, ChevronUp,
  User, Calendar, Info, Printer, FileSpreadsheet, Loader2, Pencil,
} from "lucide-react";
import { useProjectDetail } from "@/hooks/useProjectDetail";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/index";
import { NotificationBell } from "@/components/NotificationBell";
import * as XLSX from "xlsx";

// ─── Shared input style ───────────────────────────────────────────────────────
const inputClass = cn(
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm",
  "placeholder:text-muted-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary",
  "transition-colors"
);
const selectClass = cn(inputClass, "cursor-pointer");

// ─── Main page ────────────────────────────────────────────────────────────────
export const ProjectDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { project, tasks, divisions, loading, updateTask, updateProject } = useProjectDetail(id);
  const [expandedDivisions, setExpandedDivisions] = useState<string[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<{
    name: string; address: string; type: "mall" | "stand_alone"; brand: string; openingDate: string;
  }>({
    name: "", address: "", type: "mall", brand: "", openingDate: "",
  });

  const isSuperadmin = user?.role === "superadmin";

  // Populate edit form whenever project loads / changes
  useEffect(() => {
    if (project) {
      setEditForm({
        name: project.name,
        address: project.address,
        type: project.type as "mall" | "stand_alone",
        brand: project.brand,
        openingDate: project.openingDate?.slice(0, 10) ?? "",
      });
    }
  }, [project]);

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
    if (!isSuperadmin && user?.divisionId !== task.divisionId) {
      alert("Anda hanya bisa mengubah task milik divisi Anda sendiri.");
      return;
    }
    if (project?.isLocked) {
      alert("Project ini sudah dikunci/selesai.");
      return;
    }
    await updateTask(task.id, {
      isCompleted: !task.isCompleted,
      lastEditedBy: user?.name,
      lastEditedAt: new Date().toISOString(),
    });
  };

  const exportToExcel = () => {
    if (!project) return;
    const data = tasks.map((t) => ({
      Divisi: divisions.find((d) => d.id === t.divisionId)?.name || "-",
      "Nama Task": t.name,
      PIC: t.pic || "-",
      Deadline: t.deadline ? new Date(t.deadline).toLocaleDateString("id-ID") : "-",
      Status: t.isCompleted ? "SELESAI" : "BELUM",
      "Terakhir Diedit": t.lastEditedBy || "-",
      "Waktu Edit": t.lastEditedAt ? new Date(t.lastEditedAt).toLocaleString("id-ID") : "-",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Checklist");
    XLSX.writeFile(wb, `Checklist_${project.name.replace(/\s+/g, "_")}.xlsx`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Memuat detail project...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-destructive font-semibold">Project tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background pb-16 print:bg-white print:p-0">
      {/* Print CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { font-size: 11pt; color: black; background: white; }
          header, footer, nav, button { display: none !important; }
          #root { width: 100% !important; margin: 0 !important; border: none !important; }
        }
      ` }} />

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur-md no-print">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-3">
          {/* Left: back + title */}
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <Link to="/">
              <Button variant="ghost" size="icon"
                className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-foreground truncate">{project.name}</h1>
              <p className="text-xs text-muted-foreground truncate hidden sm:block">{project.address}</p>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <NotificationBell />

            {isSuperadmin && (
              <div className="flex items-center gap-1.5 border-l border-border pl-2 md:pl-3">
                {/* Edit project — always visible for superadmin */}
                <Button variant="outline" size="icon" onClick={() => setIsEditOpen(true)}
                  className="h-8 w-8 cursor-pointer" title="Edit Project">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                {/* Export: icon-only on mobile, labelled on md+ */}
                <Button variant="outline" size="icon" onClick={exportToExcel}
                  className="h-8 w-8 md:hidden cursor-pointer" title="Export Excel">
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => window.print()}
                  className="h-8 w-8 md:hidden cursor-pointer" title="Print">
                  <Printer className="h-3.5 w-3.5 text-blue-600" />
                </Button>
                <Button variant="outline" size="sm" onClick={exportToExcel}
                  className="hidden md:flex gap-2 cursor-pointer h-8 text-xs">
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />Excel
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.print()}
                  className="hidden md:flex gap-2 cursor-pointer h-8 text-xs">
                  <Printer className="h-3.5 w-3.5 text-blue-600" />Print
                </Button>
              </div>
            )}

            {/* Progress widget */}
            <div className="flex items-center gap-2 border-l border-border pl-2 md:pl-3">
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hidden sm:block">Progress</p>
                <p className="text-base md:text-lg font-black text-primary leading-tight">{project.progress}%</p>
              </div>
              <div className="h-7 w-7 md:h-8 md:w-8 shrink-0">
                <svg viewBox="0 0 32 32" className="h-full w-full -rotate-90">
                  <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/60" />
                  <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={`${(project.progress / 100) * 75.4} 75.4`}
                    className="text-primary transition-all duration-700" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Print header */}
      <div className="hidden print:block mb-8 border-b-4 border-black pb-6 text-left">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">{project.name}</h1>
            <p className="text-xl text-gray-700 mt-1">{project.address}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Opening Checklist Report</p>
            <p className="text-3xl font-black text-black mt-1">{project.progress}% COMPLETE</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-4 gap-4 text-xs font-bold bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div><p className="text-gray-400 uppercase">Brand</p><p className="text-sm">{project.brand}</p></div>
          <div><p className="text-gray-400 uppercase">Location Type</p><p className="text-sm uppercase">{project.type.replace("_", " ")}</p></div>
          <div><p className="text-gray-400 uppercase">Target Opening</p><p className="text-sm">{new Date(project.openingDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p></div>
          <div><p className="text-gray-400 uppercase">Status</p><p className="text-sm uppercase">{project.status.replace("_", " ")}</p></div>
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="max-w-6xl mx-auto w-full px-4 md:px-6 py-4 md:py-6 space-y-3 md:space-y-4 print:p-0">
        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3 no-print">
          <InfoCard icon={<Info className="h-4 w-4" />} label="Tipe / Brand"
            value={`${project.type.replace("_", " ").toUpperCase()} — ${project.brand}`} />
          <InfoCard icon={<Calendar className="h-4 w-4" />} label="Target Opening"
            value={new Date(project.openingDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} />
          <InfoCard icon={<User className="h-4 w-4" />} label="Role Anda"
            value={`${user?.role === "superadmin" ? "Superadmin" : "Staff"}${user?.divisionId ? ` · ${divisions.find((d) => d.id === user.divisionId)?.name ?? ""}` : ""}`} />
        </div>

        {/* Division accordions */}
        <div className="space-y-2">
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
                "rounded-xl border transition-all duration-200 overflow-hidden print:border-none print:mb-8",
                isExpanded ? "border-primary/40 bg-card shadow-sm" : "border-border bg-card hover:border-primary/30",
                isUserDivision && "ring-1 ring-primary/20"
              )}>
                {/* Accordion toggle */}
                <button onClick={() => toggleDivision(division.id)}
                  className="w-full px-4 md:px-5 py-3.5 md:py-4 flex items-center justify-between no-print hover:bg-muted/40 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 text-left min-w-0">
                    <div className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                      allDone ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-muted text-muted-foreground"
                    )}>
                      {allDone
                        ? <CheckCircle2 className="h-4 w-4" />
                        : <span className="text-[10px] font-bold">{completedCount}/{divTasks.length}</span>
                      }
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm text-foreground">{division.name}</h3>
                        {isUserDivision && (
                          <span className="text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            Divisi Saya
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {allDone ? "Semua task selesai" : `${divTasks.length - completedCount} task tersisa`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 shrink-0 ml-2">
                    <div className="hidden sm:flex items-center gap-2">
                      <div className="h-1 w-16 md:w-20 rounded-full bg-muted overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all duration-500", allDone ? "bg-emerald-500" : "bg-primary")}
                          style={{ width: `${progressPct}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground tabular-nums w-7 text-right">{progressPct}%</span>
                    </div>
                    <span className="sm:hidden text-xs font-semibold text-muted-foreground tabular-nums">{progressPct}%</span>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-primary" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </button>

                {/* Print-only section header */}
                <div className="hidden print:flex items-center justify-between border-b-2 border-black bg-gray-100 p-2 px-4 mb-2">
                  <span className="font-black text-sm uppercase">{division.name}</span>
                  <span className="text-xs font-bold uppercase">{completedCount} / {divTasks.length} COMPLETED</span>
                </div>

                {/* Task list */}
                <div className={cn("border-t border-border print:block print:border-none", !isExpanded && "hidden print:block")}>

                  {/* ── Mobile task rows (< sm) ── */}
                  <div className="sm:hidden divide-y divide-border/60">
                    {divTasks.map((task) => (
                      <div key={task.id} className="flex items-start gap-3 px-4 py-3.5 hover:bg-muted/20 transition-colors">
                        {/* Checkbox */}
                        <button onClick={() => handleToggleTask(task)}
                          className={cn(
                            "mt-0.5 shrink-0 transition-all cursor-pointer hover:scale-110 active:scale-95",
                            task.isCompleted ? "text-emerald-500" : "text-muted-foreground/30 hover:text-primary"
                          )}
                          aria-label={task.isCompleted ? "Mark incomplete" : "Mark complete"}>
                          {task.isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                        </button>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Task name */}
                          <p className={cn(
                            "text-sm font-medium text-foreground leading-snug",
                            task.isCompleted && "line-through text-muted-foreground/60"
                          )}>
                            {task.name}
                          </p>

                          {/* Detail note if exists */}
                          {task.detail && (
                            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{task.detail}</p>
                          )}

                          {/* PIC + Log — always shown */}
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-0.5">PIC</p>
                              <p className={cn("text-[11px] leading-snug", task.pic ? "font-medium text-foreground/80" : "text-muted-foreground/35")}>
                                {task.pic || "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-0.5">Log</p>
                              {task.lastEditedBy ? (
                                <div className="text-[11px] leading-snug">
                                  <p className="font-medium text-foreground/80">{task.lastEditedBy}</p>
                                  <p className="text-muted-foreground">
                                    {new Date(task.lastEditedAt!).toLocaleString("id-ID", {
                                      hour: "2-digit", minute: "2-digit", day: "numeric", month: "short",
                                    })}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-[11px] text-muted-foreground/35">—</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ── Tablet / Desktop task table (sm+) ── */}
                  <table className="hidden sm:table w-full text-left text-sm">
                    <thead>
                      <tr className="bg-muted/30 print:bg-transparent">
                        <th className="px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-10 text-center no-print">Status</th>
                        <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Task</th>
                        <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">PIC / Detail</th>
                        <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right hidden lg:table-cell">Log</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 print:divide-black/10">
                      {divTasks.map((task) => (
                        <tr key={task.id} className="hover:bg-muted/20 transition-colors task-row">
                          <td className="px-5 py-3.5 text-center no-print">
                            <button onClick={() => handleToggleTask(task)}
                              className={cn(
                                "transition-all cursor-pointer hover:scale-110 active:scale-95",
                                task.isCompleted ? "text-emerald-500" : "text-muted-foreground/30 hover:text-primary"
                              )}
                              aria-label={task.isCompleted ? "Mark incomplete" : "Mark complete"}>
                              {task.isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                            </button>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex flex-col gap-0.5">
                              <span className={cn(
                                "font-medium text-foreground text-sm transition-all",
                                task.isCompleted && "line-through text-muted-foreground/60 print:no-underline print:text-black print:opacity-100"
                              )}>
                                {task.name}
                              </span>
                              {/* Show PIC inline on sm-md (before PIC/Detail column appears) */}
                              {task.pic && <span className="md:hidden text-[11px] text-muted-foreground">{task.pic}</span>}
                              <span className="hidden print:inline text-[9px] text-gray-400">
                                {task.isCompleted ? "[X] COMPLETED" : "[ ] INCOMPLETE"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 hidden md:table-cell">
                            <div className="flex flex-col gap-0.5">
                              <span className={cn("text-xs font-medium", task.pic ? "text-foreground" : "text-muted-foreground/35")}>{task.pic || "—"}</span>
                              {task.detail && <span className="text-[10px] text-muted-foreground leading-tight">{task.detail}</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right tabular-nums hidden lg:table-cell">
                            {task.lastEditedBy ? (
                              <div className="flex flex-col items-end gap-0.5">
                                <span className="text-[11px] font-semibold text-foreground">{task.lastEditedBy}</span>
                                <span className="text-[10px] text-muted-foreground">
                                  {new Date(task.lastEditedAt!).toLocaleString("id-ID", {
                                    hour: "2-digit", minute: "2-digit", day: "numeric", month: "short",
                                  })}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground/25 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Print footer */}
      <div className="hidden print:flex justify-between items-center mt-12 border-t pt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        <p>Outlet Opening Tracker System • Confidential</p>
        <p>Generated: {new Date().toLocaleString("id-ID")}</p>
      </div>

      {/* ── Edit Project Modal ── */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-foreground">Edit Project</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Perubahan akan langsung tersimpan.</p>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-sm font-medium text-foreground">Nama Outlet</label>
                  <input required className={inputClass} value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Nama Outlet" />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-sm font-medium text-foreground">Alamat</label>
                  <input required className={inputClass} value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    placeholder="Alamat lengkap lokasi" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Tipe Lokasi</label>
                  <select className={selectClass} value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value as "mall" | "stand_alone" })}>
                    <option value="mall">Mall</option>
                    <option value="stand_alone">Stand Alone</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Brand</label>
                  <input required className={inputClass} value={editForm.brand}
                    onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                    placeholder="JCO / BreadTalk" />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-sm font-medium text-foreground">Target Opening</label>
                  <input required type="date" className={inputClass} value={editForm.openingDate}
                    onChange={(e) => setEditForm({ ...editForm, openingDate: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-2.5 pt-1">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="cursor-pointer">
                  Batal
                </Button>
                <Button type="submit" disabled={isSaving} className="cursor-pointer">
                  {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</> : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Info card ────────────────────────────────────────────────────────────────
interface InfoCardProps { icon: React.ReactNode; label: string; value: string }
const InfoCard = ({ icon, label, value }: InfoCardProps) => (
  <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 md:px-4 py-3 md:py-3.5 shadow-sm">
    <div className="p-1.5 md:p-2 rounded-lg bg-primary/10 text-primary shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground truncate">{value}</p>
    </div>
  </div>
);

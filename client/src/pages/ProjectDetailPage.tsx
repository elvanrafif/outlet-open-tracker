import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, CheckCircle2, Circle, ChevronDown, ChevronUp, 
  User, Calendar, Info, Printer, FileSpreadsheet, Loader2 
} from "lucide-react";
import { useProjectDetail } from "@/hooks/useProjectDetail";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/index";
import { NotificationBell } from "@/components/NotificationBell";
import * as XLSX from "xlsx";

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { project, tasks, divisions, loading, updateTask } = useProjectDetail(id);
  const [expandedDivisions, setExpandedDivisions] = useState<string[]>([]);

  const isSuperadmin = user?.role === 'superadmin';

  const toggleDivision = (divId: string) => {
    setExpandedDivisions(prev => 
      prev.includes(divId) ? prev.filter(id => id !== divId) : [...prev, divId]
    );
  };

  const handleToggleTask = async (task: Task) => {
    const isOwner = user?.divisionId === task.divisionId;
    
    if (!isSuperadmin && !isOwner) {
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
    
    const data = tasks.map(t => ({
      'Divisi': divisions.find(d => d.id === t.divisionId)?.name || '-',
      'Nama Task': t.name,
      'PIC': t.pic || '-',
      'Deadline': t.deadline ? new Date(t.deadline).toLocaleDateString('id-ID') : '-',
      'Status': t.isCompleted ? 'SELESAI' : 'BELUM',
      'Terakhir Diedit': t.lastEditedBy || '-',
      'Waktu Edit': t.lastEditedAt ? new Date(t.lastEditedAt).toLocaleString('id-ID') : '-'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Checklist");
    XLSX.writeFile(wb, `Checklist_${project.name.replace(/\s+/g, '_')}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="flex h-screen items-center justify-center animate-pulse text-muted-foreground">Loading project detail...</div>;
  if (!project) return <div className="p-20 text-center text-red-500 font-bold">Project not found.</div>;

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20 print:bg-white print:p-0">
      {/* CSS Khusus Print */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { font-size: 11pt; color: black; background: white; }
          .project-card { border: 1px solid #eee !important; box-shadow: none !important; }
          .task-row { page-break-inside: avoid; }
          header, footer, nav, button { display: none !important; }
          #root { width: 100% !important; margin: 0 !important; border: none !important; }
          .print-break { page-break-after: always; }
        }
      `}} />

      {/* Header Section (Web View) */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b no-print">
        <div className="max-w-6xl mx-auto p-6 flex items-center justify-between">
          <div className="flex items-center gap-4 text-left">
            <Link to="/">
              <Button variant="outline" size="icon" className="rounded-full shadow-sm hover:bg-primary hover:text-white transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{project.name}</h1>
              <p className="text-sm text-muted-foreground">{project.address}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationBell />
            
            {isSuperadmin && (
              <div className="flex items-center gap-2 border-l pl-4 ml-2">
                <Button variant="outline" size="sm" onClick={exportToExcel} className="gap-2 shadow-sm border-primary/20 hover:border-primary">
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  Excel
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 shadow-sm border-primary/20 hover:border-primary">
                  <Printer className="h-4 w-4 text-blue-600" />
                  Print PDF
                </Button>
              </div>
            )}

            <div className="text-right flex flex-col items-end gap-2 ml-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Progress</span>
                <span className="text-xl font-black text-primary">{project.progress}%</span>
              </div>
              <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-in-out" 
                  style={{ width: `${project.progress}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print-only Header (Document Format) */}
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
          <div>
            <p className="text-gray-400 uppercase">Brand</p>
            <p className="text-sm">{project.brand}</p>
          </div>
          <div>
            <p className="text-gray-400 uppercase">Location Type</p>
            <p className="text-sm uppercase">{project.type.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-gray-400 uppercase">Target Opening</p>
            <p className="text-sm">{new Date(project.openingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div>
            <p className="text-gray-400 uppercase">Current Status</p>
            <p className="text-sm uppercase">{project.status.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full p-6 space-y-4 print:p-0">
        {/* Info Grid (No Print) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 no-print">
          <div className="rounded-xl border bg-card p-4 flex items-center gap-4 shadow-sm border-primary/10">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Info className="h-5 w-5" /></div>
            <div className="text-left">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Type / Brand</p>
              <p className="text-sm font-semibold uppercase">{project.type.replace('_', ' ')} — {project.brand}</p>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4 flex items-center gap-4 shadow-sm border-primary/10">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Calendar className="h-5 w-5" /></div>
            <div className="text-left">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Target Opening</p>
              <p className="text-sm font-semibold">{new Date(project.openingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4 flex items-center gap-4 shadow-sm border-primary/10">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><User className="h-5 w-5" /></div>
            <div className="text-left">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">User Role</p>
              <p className="text-sm font-semibold capitalize">{user?.role} {user?.divisionId ? `(${divisions.find(d => d.id === user.divisionId)?.name})` : ''}</p>
            </div>
          </div>
        </div>

        {/* Divisions Accordion List */}
        {divisions.map((division) => {
          const divTasks = tasks.filter(t => t.divisionId === division.id);
          const completedCount = divTasks.filter(t => t.isCompleted).length;
          const isExpanded = expandedDivisions.includes(division.id);
          const isUserDivision = user?.divisionId === division.id;

          if (divTasks.length === 0) return null;

          return (
            <div key={division.id} className={cn(
              "rounded-xl border transition-all duration-200 shadow-sm overflow-hidden print:border-none print:shadow-none print:mb-8",
              isExpanded ? "bg-card border-primary/30" : "bg-card hover:border-primary/50"
            )}>
              <button 
                onClick={() => toggleDivision(division.id)}
                className={cn(
                  "w-full p-5 flex items-center justify-between no-print transition-colors",
                  isExpanded ? "bg-primary/5" : "hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-2 rounded-full",
                    completedCount === divTasks.length ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"
                  )}>
                    {completedCount === divTasks.length ? <CheckCircle2 className="h-5 w-5" /> : <div className="h-5 w-5 text-xs flex items-center justify-center font-bold">{completedCount}/{divTasks.length}</div>}
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold flex items-center gap-2">
                      {division.name}
                      {isUserDivision && <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">My Div</span>}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {completedCount === divTasks.length ? 'All tasks completed' : `${divTasks.length - completedCount} tasks remaining`}
                    </p>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="h-5 w-5 text-primary" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
              </button>

              {/* Print-only Section Header */}
              <div className="hidden print:flex items-center justify-between border-b-2 border-black bg-gray-100 p-2 px-4 mb-2">
                <span className="font-black text-sm uppercase">{division.name}</span>
                <span className="text-xs font-bold uppercase">{completedCount} / {divTasks.length} COMPLETED</span>
              </div>

              {/* Task Table Container */}
              <div className={cn(
                "p-5 pt-0 border-t print:block print:p-0 print:border-none",
                !isExpanded && "hidden print:block"
              )}>
                <table className="w-full text-left text-sm mt-4 print:mt-0">
                  <thead>
                    <tr className="text-muted-foreground text-[11px] uppercase tracking-widest border-b print:text-black print:border-black/20">
                      <th className="pb-3 pl-2 w-10 text-center no-print">Status</th>
                      <th className="pb-3 pl-4">Task Name</th>
                      <th className="pb-3 px-4">PIC / Detail</th>
                      <th className="pb-3 px-4 text-right">Log Info</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y print:divide-black/10">
                    {divTasks.map((task) => (
                      <tr key={task.id} className="group hover:bg-muted/30 transition-colors task-row">
                        <td className="py-4 text-center no-print">
                          <button 
                            onClick={() => handleToggleTask(task)}
                            className={cn(
                              "transition-transform hover:scale-110 active:scale-95",
                              task.isCompleted ? "text-green-500" : "text-muted-foreground/30 hover:text-primary"
                            )}
                          >
                            {task.isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                          </button>
                        </td>
                        <td className="py-4 pl-4">
                          <div className="flex flex-col">
                            <span className={cn(
                              "font-semibold transition-all",
                              task.isCompleted && "line-through text-muted-foreground opacity-60 print:no-underline print:text-black print:opacity-100"
                            )}>
                              {task.name}
                            </span>
                            <span className="hidden print:inline text-[9px] text-gray-400 mt-0.5">
                              {task.isCompleted ? "[X] COMPLETED" : "[ ] INCOMPLETE"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground italic font-medium">{task.pic || '—'}</span>
                            {task.detail && <span className="text-[10px] text-muted-foreground/80 leading-tight">{task.detail}</span>}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right text-[10px] text-muted-foreground print:text-black tabular-nums">
                          {task.lastEditedBy ? (
                            <div className="flex flex-col">
                              <span className="font-bold">{task.lastEditedBy}</span>
                              <span>{new Date(task.lastEditedAt!).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</span>
                            </div>
                          ) : <span className="opacity-20">—</span>}
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
      
      {/* Print Footer */}
      <div className="hidden print:flex justify-between items-center mt-12 border-t pt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        <p>Outlet Opening Tracker System • Confidential Document</p>
        <p>Generated on {new Date().toLocaleString('id-ID')} • Page 1 of 1</p>
      </div>
    </div>
  );
};

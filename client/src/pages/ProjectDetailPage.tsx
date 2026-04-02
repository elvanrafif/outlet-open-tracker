import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Circle, ChevronDown, ChevronUp, User, Calendar, Info } from "lucide-react";
import { useProjectDetail } from "@/hooks/useProjectDetail";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { Task, Division } from "@/types/index";

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { project, tasks, divisions, loading, updateTask } = useProjectDetail(id);
  const [expandedDivisions, setExpandedDivisions] = useState<string[]>([]);

  const toggleDivision = (divId: string) => {
    setExpandedDivisions(prev => 
      prev.includes(divId) ? prev.filter(id => id !== divId) : [...prev, divId]
    );
  };

  const handleToggleTask = async (task: Task) => {
    // Permission check
    const isSuperadmin = user?.role === 'superadmin';
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

  if (loading) return <div className="p-20 text-center animate-pulse">Loading project detail...</div>;
  if (!project) return <div className="p-20 text-center text-red-500">Project not found.</div>;

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      {/* Header Section */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-6xl mx-auto p-6 flex items-center justify-between">
          <div className="flex items-center gap-4 text-left">
            <Link to="/">
              <Button variant="outline" size="icon" className="rounded-full">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
              <p className="text-sm text-muted-foreground">{project.address}</p>
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Overall Progress</span>
              <span className="text-xl font-bold">{project.progress}%</span>
            </div>
            <div className="h-2 w-48 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-1000" 
                style={{ width: `${project.progress}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full p-6 space-y-4">
        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border bg-card p-4 flex items-center gap-4 shadow-sm">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Info className="h-5 w-5" /></div>
            <div className="text-left">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Type / Brand</p>
              <p className="text-sm font-semibold uppercase">{project.type.replace('_', ' ')} — {project.brand}</p>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4 flex items-center gap-4 shadow-sm">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Calendar className="h-5 w-5" /></div>
            <div className="text-left">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Target Opening</p>
              <p className="text-sm font-semibold">{new Date(project.openingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4 flex items-center gap-4 shadow-sm">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><User className="h-5 w-5" /></div>
            <div className="text-left">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Current User Role</p>
              <p className="text-sm font-semibold capitalize">{user?.role} {user?.divisionId ? `(${divisions.find(d => d.id === user.divisionId)?.name})` : ''}</p>
            </div>
          </div>
        </div>

        {/* Divisions Accordion */}
        {divisions.map((division) => {
          const divTasks = tasks.filter(t => t.divisionId === division.id);
          const completedCount = divTasks.filter(t => t.isCompleted).length;
          const isExpanded = expandedDivisions.includes(division.id);
          const isUserDivision = user?.divisionId === division.id;

          if (divTasks.length === 0) return null;

          return (
            <div key={division.id} className={cn(
              "rounded-xl border transition-all duration-200 shadow-sm",
              isExpanded ? "bg-card" : "bg-card hover:border-primary/50"
            )}>
              <button 
                onClick={() => toggleDivision(division.id)}
                className="w-full p-5 flex items-center justify-between"
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
                      {isUserDivision && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">YOUR DIVISION</span>}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {completedCount === divTasks.length ? 'Semua task selesai' : `${divTasks.length - completedCount} task tersisa`}
                    </p>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>

              {isExpanded && (
                <div className="p-5 pt-0 border-t animate-in fade-in slide-in-from-top-2 duration-300">
                  <table className="w-full text-left text-sm mt-4">
                    <thead>
                      <tr className="text-muted-foreground text-[11px] uppercase tracking-widest border-b">
                        <th className="pb-3 pl-2 w-10 text-center">Done</th>
                        <th className="pb-3 pl-4">Task Name</th>
                        <th className="pb-3 px-4">PIC / Detail</th>
                        <th className="pb-3 px-4 text-right">Last Edit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {divTasks.map((task) => (
                        <tr key={task.id} className="group hover:bg-muted/30 transition-colors">
                          <td className="py-4 text-center">
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
                            <span className={cn(
                              "font-medium transition-all",
                              task.isCompleted && "line-through text-muted-foreground"
                            )}>
                              {task.name}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-muted-foreground italic">{task.pic || 'Belum ada PIC'}</span>
                              {task.detail && <span className="text-[10px] text-muted-foreground/80">{task.detail}</span>}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right text-[10px] text-muted-foreground">
                            {task.lastEditedBy ? (
                              <div className="flex flex-col">
                                <span>Edited by: {task.lastEditedBy}</span>
                                <span>{new Date(task.lastEditedAt!).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</span>
                              </div>
                            ) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

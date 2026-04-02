import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProjects";
import { LogOut, Plus, MapPin, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { pb } from "@/lib/pb";

interface PageContainerProps {
  title: string;
  children: React.ReactNode;
  onNewProject?: () => void;
}

const PageContainer = ({ title, children, onNewProject }: PageContainerProps) => {
  const { logout, user } = useAuth();
  
  return (
    <div className="flex flex-col gap-6 p-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {user && <p className="text-sm text-muted-foreground">Logged in as: {user.name} ({user.role})</p>}
        </div>
        <div className="flex items-center gap-3">
          {user?.role === 'superadmin' && (
            <Button className="gap-2" onClick={onNewProject}>
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={logout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
};

import { DEFAULT_TASKS } from "@/lib/taskTemplates";

// ... (kode sebelumnya)

export const DashboardPage = () => {
  const { projects, loading, refresh } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    type: "mall",
    brand: "",
    openingDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 1. Buat Project Baru
      const project = await pb.collection("projects").create({
        ...formData,
        status: "on_track",
        progress: 0,
        isLocked: false,
      });

      // 2. Ambil Semua Divisi untuk Map Nama ke ID
      const divisions = await pb.collection("divisions").getFullList();
      console.log('Available divisions in DB:', divisions.map(d => d.name));
      
      // 3. Generate 33 Task Otomatis
      const taskPromises = DEFAULT_TASKS.map(taskTemplate => {
        const division = divisions.find(d => d.name.trim().toLowerCase() === taskTemplate.division.trim().toLowerCase());
        
        if (!division) {
          console.error(`Division not found: "${taskTemplate.division}". Make sure you added this to divisions collection!`);
          return null;
        }
        
        return pb.collection("tasks").create({
          projectId: project.id,
          divisionId: division.id,
          name: taskTemplate.name,
          isCompleted: false,
        });
      }).filter(Boolean);

      if (taskPromises.length === 0) {
        console.error('No tasks created. Check console errors above!');
      }

      await Promise.all(taskPromises);
      console.log(`Successfully created project "${project.name}" with ${taskPromises.length} tasks.`);

      setIsModalOpen(false);
      setFormData({ name: "", address: "", type: "mall", brand: "", openingDate: "" });
      refresh();
    } catch (err) {
      console.error("Error creating project and tasks:", err);
      alert("Gagal membuat project atau task otomatis.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'at_risk': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'overdue': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  return (
    <PageContainer title="Dashboard Project" onNewProject={() => setIsModalOpen(true)}>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Outlet Name</label>
                  <input 
                    required 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Contoh: Outlet Sudirman"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Address</label>
                  <input 
                    required 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Alamat lengkap lokasi"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location Type</label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="mall">Mall</option>
                    <option value="stand_alone">Stand Alone</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Brand</label>
                  <input 
                    required 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    placeholder="Contoh: JCO / BreadTalk"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Target Opening Date</label>
                  <input 
                    required 
                    type="date"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={formData.openingDate}
                    onChange={(e) => setFormData({...formData, openingDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Create Project"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-lg border border-dashed p-20 text-center">
          <p className="text-muted-foreground">Belum ada project yang berjalan.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Outlet Info</th>
                <th className="px-6 py-4 font-medium text-center">Type</th>
                <th className="px-6 py-4 font-medium text-center">Target Opening</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium">Progress</th>
                <th className="px-6 py-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{project.name}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" /> {project.address}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">
                      {project.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-foreground">{new Date(project.openingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-widest">
                        {project.brand}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn(
                      "inline-flex rounded-md px-2 py-1 text-[11px] font-bold leading-none",
                      getStatusColor(project.status)
                    )}>
                      {formatStatus(project.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 min-w-[140px]">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-1000" 
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/project/${project.id}`}>
                      <Button variant="ghost" size="sm" className="hover:bg-primary hover:text-primary-foreground">
                        Detail
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  );
};

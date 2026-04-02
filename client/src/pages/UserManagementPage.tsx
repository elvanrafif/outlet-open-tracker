import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUsers } from "@/hooks/useUsers";
import { LogOut, Plus, UserPlus, Shield, Users, Trash2, Key, ArrowLeft, Loader2 } from "lucide-react";
import { Link, Navigate } from "react-router-dom";

export const UserManagementPage = () => {
  const { user: currentUser, logout } = useAuth();
  const { users, divisions, loading, createUser, deleteUser, updateUser } = useUsers();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "password123", // Default password sesuai PRD
    role: "user",
    divisionId: "",
  });

  // Proteksi: Hanya Superadmin yang boleh masuk
  if (currentUser?.role !== 'superadmin') {
    return <Navigate to="/" replace />;
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await createUser(formData);
    if (result.success) {
      setIsModalOpen(false);
      setFormData({ email: "", name: "", password: "password123", role: "user", divisionId: "" });
    } else {
      alert("Error: " + result.message);
    }
    setIsSubmitting(false);
  };

  const handleResetPassword = async (userId: string) => {
    if (!confirm("Reset password user ini ke 'password123'?")) return;
    await updateUser(userId, { password: "password123", passwordConfirm: "password123" });
    alert("Password berhasil di-reset ke: password123");
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) return alert("Anda tidak bisa menghapus diri sendiri!");
    if (!confirm("Hapus user ini selamanya?")) return;
    await deleteUser(userId);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4 text-left">
          <Link to="/">
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-sm text-muted-foreground">Kelola akses staf dan divisi</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Add New User
          </Button>
          <Button variant="outline" size="sm" onClick={logout} className="gap-2 text-destructive hover:bg-destructive/10">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Modal Add User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-4">Create New Staff Account</h2>
            <form onSubmit={handleCreateUser} className="space-y-4 text-left">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <input 
                  required 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nama Lengkap Staf"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <input 
                  required 
                  type="email"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@perusahaan.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="user">User Divisi</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Division</label>
                  <select 
                    required={formData.role === 'user'}
                    disabled={formData.role === 'superadmin'}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                    value={formData.divisionId}
                    onChange={(e) => setFormData({...formData, divisionId: e.target.value})}
                  >
                    <option value="">Pilih Divisi...</option>
                    {divisions.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg text-[11px] text-muted-foreground">
                <p><strong>Note:</strong> Password default untuk akun baru adalah <u>password123</u>. User dapat menggantinya nanti di profil.</p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">User Info</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Division</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold">{u.name}</span>
                        <span className="text-xs text-muted-foreground">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {u.role === 'superadmin' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                          <Shield className="h-3 w-3" /> SUPERADMIN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                          <Users className="h-3 w-3" /> STAFF
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-muted-foreground font-medium">
                      {u.division?.name || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Note: Row group hover is hard to implement with custom table, so we keep buttons visible */}
                    </div>
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Reset Password"
                        className="h-8 w-8 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                        onClick={() => handleResetPassword(u.id)}
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Delete User"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteUser(u.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

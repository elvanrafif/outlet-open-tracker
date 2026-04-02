import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUsers } from "@/hooks/useUsers";
import {
  LogOut, UserPlus, Shield, Users, Trash2, Key,
  ArrowLeft, Loader2, Building2,
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { cn } from "@/lib/utils";

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

const AVATAR_COLORS = [
  "bg-blue-100    text-blue-700    dark:bg-blue-900/40    dark:text-blue-300",
  "bg-violet-100  text-violet-700  dark:bg-violet-900/40  dark:text-violet-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "bg-amber-100   text-amber-700   dark:bg-amber-900/40   dark:text-amber-300",
  "bg-pink-100    text-pink-700    dark:bg-pink-900/40    dark:text-pink-300",
];

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

export const UserManagementPage = () => {
  const { user: currentUser, logout } = useAuth();
  const { users, divisions, loading, createUser, deleteUser, updateUser } = useUsers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "", name: "", password: "password123", role: "user", divisionId: "",
  });

  if (currentUser?.role !== "superadmin") return <Navigate to="/" replace />;

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
    if (userId === currentUser?.id) { alert("Anda tidak bisa menghapus diri sendiri!"); return; }
    if (!confirm("Hapus user ini selamanya?")) return;
    await deleteUser(userId);
  };

  const RoleBadge = ({ role }: { role: string }) =>
    role === "superadmin" ? (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
        <Shield className="h-3 w-3" />Superadmin
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
        <Users className="h-3 w-3" />Staff
      </span>
    );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon"
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Building2 className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-foreground tracking-tight">Outlet Tracker</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <Button size="sm" className="gap-2 cursor-pointer px-2 md:px-3" onClick={() => setIsModalOpen(true)}>
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Tambah User</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}
              className="gap-2 text-muted-foreground hover:text-destructive cursor-pointer px-2 md:px-3">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 md:py-8 space-y-5 md:space-y-6 animate-in fade-in duration-300">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kelola akses staf dan divisi · <span className="font-medium">{users.length}</span> pengguna terdaftar
          </p>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* ── Mobile: card list (< md) ── */}
            <div className="md:hidden space-y-2.5">
              {users.map((u, i) => (
                <div key={u.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between gap-3">
                    {/* Left: avatar + info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                        AVATAR_COLORS[i % AVATAR_COLORS.length]
                      )}>
                        {getInitials(u.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                    </div>
                    {/* Right: action buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" title="Reset Password"
                        className="h-8 w-8 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-900/20 cursor-pointer"
                        onClick={() => handleResetPassword(u.id)}>
                        <Key className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Hapus User"
                        className="h-8 w-8 text-destructive/50 hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                        onClick={() => handleDeleteUser(u.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {/* Bottom row: role + division */}
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <RoleBadge role={u.role} />
                    {u.division?.name && (
                      <span className="text-xs text-muted-foreground bg-muted rounded-md px-2 py-0.5">
                        {u.division.name}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Tablet / Desktop: table (md+) ── */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Pengguna</th>
                    <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Role</th>
                    <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Divisi</th>
                    <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((u, i) => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                            AVATAR_COLORS[i % AVATAR_COLORS.length]
                          )}>
                            {getInitials(u.name)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-foreground truncate">{u.name}</span>
                            <span className="text-xs text-muted-foreground truncate">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-muted-foreground">
                          {u.division?.name || <span className="text-muted-foreground/40">—</span>}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" title="Reset Password"
                            className="h-8 w-8 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-900/20 cursor-pointer"
                            onClick={() => handleResetPassword(u.id)}>
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Hapus User"
                            className="h-8 w-8 text-destructive/50 hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                            onClick={() => handleDeleteUser(u.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      {/* ── Add User Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            <div className="mb-4 md:mb-5">
              <h2 className="text-lg font-bold text-foreground">Buat Akun Staff Baru</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Password default: <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">password123</code>
              </p>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Nama Lengkap</label>
                <input required className={inputClass} value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nama Lengkap Staf" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email</label>
                <input required type="email" className={inputClass} value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@perusahaan.com" />
              </div>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Role</label>
                  <select className={selectClass} value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                    <option value="user">User Divisi</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Divisi</label>
                  <select
                    required={formData.role === "user"} disabled={formData.role === "superadmin"}
                    className={cn(selectClass, formData.role === "superadmin" && "opacity-50 cursor-not-allowed")}
                    value={formData.divisionId}
                    onChange={(e) => setFormData({ ...formData, divisionId: e.target.value })}>
                    <option value="">Pilih Divisi...</option>
                    {divisions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2.5 pt-1">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="cursor-pointer">Batal</Button>
                <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buat Akun"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

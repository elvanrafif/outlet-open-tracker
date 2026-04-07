import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUsers } from "@/hooks/useUsers";
import { useDebounce } from "@/hooks/useDebounce";
import { UserPlus, Shield, Users, Key, Loader2, Mail, X, Search } from "lucide-react";
import { Navigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getInitials } from "@/lib/constants";

const AVATAR_COLORS = [
  "bg-blue-500/10    text-blue-600    dark:text-blue-400    border-blue-500/20",
  "bg-violet-500/10  text-violet-600  dark:text-violet-400  border-violet-500/20",
  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  "bg-amber-500/10   text-amber-600   dark:text-amber-400   border-amber-500/20",
  "bg-rose-500/10    text-rose-600    dark:text-rose-400    border-rose-500/20",
];

export const UserManagementPage = () => {
  const { user: currentUser } = useAuth();
  const { users, divisions, loading, createUser, updateUser } = useUsers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "", name: "", password: "password123", role: "user", divisionId: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("all");
  const debouncedSearch = useDebounce(searchQuery, 300);

  if (currentUser?.role !== "superadmin") return <Navigate to="/" replace />;

  const filteredUsers = users.filter((u) => {
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      const match = [u.name, u.email, u.division?.name ?? ""].some((f) => f.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (divisionFilter !== "all") {
      if (divisionFilter === "none" && u.division?.name) return false;
      if (divisionFilter !== "none" && u.division?.name !== divisionFilter) return false;
    }
    return true;
  });

  const hasFilters = !!debouncedSearch || divisionFilter !== "all";

  const closeModal = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsModalClosing(false);
    }, 250);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await createUser(formData);
    if (result.success) {
      closeModal();
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

  const RoleBadge = ({ role }: { role: string }) =>
    role === "superadmin" ? (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-2.5 py-1 text-[10px] font-black text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-widest">
        <Shield className="h-3 w-3" />Superadmin
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/10 px-2.5 py-1 text-[10px] font-black text-slate-600 dark:text-slate-400 border border-slate-500/20 uppercase tracking-widest">
        <Users className="h-3 w-3" />Staff
      </span>
    );

  const headerActions = (
    <Button size="sm" className="gap-2 cursor-pointer px-3 h-8 text-xs font-bold uppercase tracking-wider" onClick={() => setIsModalOpen(true)}>
      <UserPlus className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Add User</span>
    </Button>
  );

  return (
    <Layout title="User Management" actions={headerActions}>
      <div className="space-y-4">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Loading users...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
            {/* ── Search & Filter bar ── */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 group-focus-within:text-primary transition-colors pointer-events-none" />
                <Input
                  placeholder="Search name, email, or division..."
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
              <div className="flex items-center gap-2 shrink-0">
                <Select value={divisionFilter} onValueChange={setDivisionFilter}>
                  <SelectTrigger className="text-xs font-bold cursor-pointer w-[160px] bg-card">
                    <SelectValue placeholder="All Divisions" />
                  </SelectTrigger>
                  <SelectContent align="end" className="rounded-xl">
                    <SelectItem value="all">All Divisions</SelectItem>
                    <SelectItem value="none">No Division</SelectItem>
                    {divisions.map((d) => (
                      <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {hasFilters && (
                  <button
                    onClick={() => { setSearchQuery(""); setDivisionFilter("all"); }}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-all cursor-pointer shrink-0"
                    aria-label="Clear all filters"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* ── Mobile: card list (< md) ── */}
            <div className="md:hidden space-y-3">
              {filteredUsers.map((u, i) => (
                <div key={u.id} className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 border",
                      AVATAR_COLORS[i % AVATAR_COLORS.length]
                    )}>
                      {getInitials(u.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-foreground text-sm truncate uppercase tracking-tight">{u.name}</p>
                      <p className="text-xs text-muted-foreground truncate font-medium flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3" /> {u.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2 flex-wrap">
                      <RoleBadge role={u.role} />
                      {u.division?.name && (
                        <span className="text-[9px] font-black text-muted-foreground bg-muted border border-border px-2 py-1 rounded uppercase tracking-widest">
                          {u.division.name}
                        </span>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" aria-label="Reset password"
                      className="h-8 w-8 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700 cursor-pointer rounded-lg"
                      onClick={() => handleResetPassword(u.id)}>
                      <Key className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Tablet / Desktop: table (md+) ── */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-card">
                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">User</th>
                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 w-[120px]">Role</th>
                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 w-[240px]">Division</th>
                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 text-right w-[70px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((u, i) => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-9 w-9 rounded-lg flex items-center justify-center text-xs font-black shrink-0 border",
                            AVATAR_COLORS[i % AVATAR_COLORS.length]
                          )}>
                            {getInitials(u.name)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-foreground truncate tracking-tight uppercase text-sm">{u.name}</span>
                            <span className="text-xs text-muted-foreground truncate font-medium flex items-center gap-1 mt-0.5">
                              <Mail className="h-3 w-3 opacity-40" /> {u.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
                      <td className="px-5 py-4">
                        {u.division?.name ? (
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted/50 px-2 py-1 rounded border border-border/50">
                            {u.division.name}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/30 text-[10px] font-black uppercase tracking-widest">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <Button variant="ghost" size="icon" aria-label="Reset password"
                            className="h-8 w-8 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700 cursor-pointer rounded-lg"
                            onClick={() => handleResetPassword(u.id)}>
                            <Key className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredUsers.length === 0 && (
              <div className="py-16 text-center rounded-xl border border-dashed border-border bg-muted/10">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No users found</p>
                <button onClick={() => { setSearchQuery(""); setDivisionFilter("all"); }} className="mt-2 text-xs text-primary font-bold uppercase tracking-tight hover:underline cursor-pointer">
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Add User Modal ── */}
      {isModalOpen && (
        <div
          className={cn(
            "fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm p-0 sm:p-4",
            isModalClosing ? "animate-out fade-out duration-250" : "animate-in fade-in duration-200"
          )}
          onClick={closeModal}
        >
          <div
            className={cn(
              "w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-border bg-card p-6 shadow-2xl",
              isModalClosing ? "animate-out slide-out-to-bottom sm:zoom-out-95 duration-250" : "animate-in slide-in-from-bottom sm:zoom-in-95 duration-300"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground tracking-tight">Add New Personnel</h2>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Register staff access</p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-muted transition-colors cursor-pointer text-muted-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="add-user-name" className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Full Name</label>
                <Input id="add-user-name" required value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="h-10 px-4 bg-muted/20 border-border/50 focus:bg-background transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="add-user-email" className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Email Address</label>
                <Input id="add-user-email" required type="email" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="h-10 px-4 bg-muted/20 border-border/50 focus:bg-background transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="add-user-role" className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Access Role</label>
                  <select id="add-user-role" className="flex h-10 w-full rounded-lg border border-border/50 bg-muted/20 px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                    <option value="user">Staff User</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="add-user-division" className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Division</label>
                  <select
                    id="add-user-division"
                    required={formData.role === "user"} disabled={formData.role === "superadmin"}
                    className={cn(
                      "flex h-10 w-full rounded-lg border border-border/50 bg-muted/20 px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer",
                      formData.role === "superadmin" && "opacity-30 cursor-not-allowed"
                    )}
                    value={formData.divisionId}
                    onChange={(e) => setFormData({ ...formData, divisionId: e.target.value })}>
                    <option value="">No Division</option>
                    {divisions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="bg-muted/30 p-3 rounded-xl border border-border/50 flex items-start gap-3">
                <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground leading-none">Security Note</p>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight mt-1">Default password is set to: <span className="text-foreground font-mono">password123</span></p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={closeModal} className="cursor-pointer font-bold uppercase tracking-wider text-xs">Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="cursor-pointer px-6 font-bold uppercase tracking-wider text-xs shadow-md">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

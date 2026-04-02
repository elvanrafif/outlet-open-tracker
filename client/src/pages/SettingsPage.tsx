import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { pb } from "@/lib/pb";
import { User, Key, Shield, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const SettingsPage = () => {
  const { user, refreshAuth } = useAuth();
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [profileForm, setProfileForm] = useState({ name: user?.name || "" });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "", newPassword: "", confirmPassword: "",
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setMessage(null);
    try {
      await pb.collection("users").update(user?.id!, { name: profileForm.name });
      await refreshAuth();
      setMessage({ type: 'success', text: "Profil berhasil diperbarui." });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Gagal memperbarui profil." });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: "Konfirmasi password baru tidak cocok." });
      return;
    }
    setIsSavingPassword(true);
    setMessage(null);
    try {
      await pb.collection("users").update(user?.id!, {
        oldPassword: passwordForm.oldPassword,
        password: passwordForm.newPassword,
        passwordConfirm: passwordForm.confirmPassword,
      });
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setMessage({ type: 'success', text: "Password berhasil diubah." });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Gagal mengubah password. Pastikan password lama benar." });
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <Layout title="Account Settings">
      <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">

        {message && (
          <div className={cn(
            "p-3 rounded-xl border flex items-center gap-2.5 animate-in zoom-in-95 duration-200",
            message.type === 'success'
              ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600"
              : "bg-destructive/5 border-destructive/20 text-destructive"
          )}>
            {message.type === 'success'
              ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              : <AlertCircle className="h-3.5 w-3.5 shrink-0" />}
            <p className="text-xs font-bold uppercase tracking-tight">{message.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Profile */}
          <section className="bg-card border border-border rounded-xl shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                <User className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest">Public Profile</h3>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Display Name</label>
                <Input
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="bg-muted/20 border-border/50 focus:bg-background transition-all"
                />
              </div>
              <div className="space-y-1.5 opacity-50">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Email (Read Only)</label>
                <Input value={user?.email} disabled className="bg-muted/10 border-dashed cursor-not-allowed" />
              </div>
              <div className="flex justify-end pt-1">
                <Button size="sm" disabled={isSavingProfile} className="font-bold uppercase tracking-wider text-xs px-5 cursor-pointer">
                  {isSavingProfile ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : null}
                  Save
                </Button>
              </div>
            </form>
          </section>

          {/* Password */}
          <section className="bg-card border border-border rounded-xl shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 shrink-0">
                <Key className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest">Change Password</h3>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Current Password</label>
                <Input
                  type="password" required
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  className="bg-muted/20 border-border/50 focus:bg-background transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">New Password</label>
                <Input
                  type="password" required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="bg-muted/20 border-border/50 focus:bg-background transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Confirm New Password</label>
                <Input
                  type="password" required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="bg-muted/20 border-border/50 focus:bg-background transition-all"
                />
              </div>
              <div className="flex justify-end pt-1">
                <Button size="sm" disabled={isSavingPassword} variant="secondary" className="font-bold uppercase tracking-wider text-xs px-5 border border-border cursor-pointer">
                  {isSavingPassword ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : null}
                  Update
                </Button>
              </div>
            </form>
          </section>
        </div>

        {/* Info */}
        <div className="bg-muted/30 px-4 py-3 rounded-xl border border-border/50 flex items-center gap-3">
          <Shield className="h-4 w-4 text-primary shrink-0" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight leading-relaxed">
            Division assignment and access role are managed by administrators. Contact your supervisor for changes.
          </p>
        </div>
      </div>
    </Layout>
  );
};

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Building2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(email, password);

    if (!result.success) {
      setError(result.message || "Login gagal. Periksa kembali email dan password Anda.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-primary p-12 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/15 backdrop-blur-sm">
            <Building2 className="h-6 w-6" />
          </div>
          <span className="text-lg font-bold tracking-tight">Outlet Tracker</span>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold leading-tight tracking-tight">
              Pantau pembukaan<br />outlet baru secara<br />real-time.
            </h1>
            <p className="text-primary-foreground/75 text-base leading-relaxed max-w-sm">
              Koordinasikan seluruh divisi, track progress task, dan pastikan target opening tercapai tepat waktu.
            </p>
          </div>

          <div className="flex gap-6 text-sm">
            <div className="space-y-1">
              <p className="text-2xl font-bold">33</p>
              <p className="text-primary-foreground/60 text-xs uppercase tracking-widest">Task Default</p>
            </div>
            <div className="w-px bg-white/20" />
            <div className="space-y-1">
              <p className="text-2xl font-bold">11</p>
              <p className="text-primary-foreground/60 text-xs uppercase tracking-widest">Divisi</p>
            </div>
            <div className="w-px bg-white/20" />
            <div className="space-y-1">
              <p className="text-2xl font-bold">Real-time</p>
              <p className="text-primary-foreground/60 text-xs uppercase tracking-widest">Progress</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-primary-foreground/40">
          © {new Date().getFullYear()} Outlet Opening Tracker
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-base font-bold text-foreground">Outlet Tracker</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Masuk ke akun Anda</h2>
            <p className="text-sm text-muted-foreground">
              Gunakan email dan password yang diberikan admin.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            {error && (
              <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/8 p-3">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <p className="text-sm text-destructive leading-tight">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="nama@perusahaan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  "flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm",
                  "placeholder:text-muted-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:border-primary",
                  "transition-colors"
                )}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    "flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 pr-10 text-sm",
                    "placeholder:text-muted-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:border-primary",
                    "transition-colors"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button className="w-full h-10 font-semibold" type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Memproses...
                </span>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Lupa password? Hubungi Superadmin untuk reset akun Anda.
          </p>
        </div>
      </div>
    </div>
  );
};

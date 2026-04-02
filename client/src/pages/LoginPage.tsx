import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTransition } from "@/components/PageTransition";
import { useNavigate } from "react-router-dom";
import { Building2, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const { triggerTransition } = useTransition();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await login(email, password);
    if (result.success) {
      triggerTransition(() => navigate("/"), "ltr");
    } else {
      setError(result.message || "Email atau password salah.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background font-sans p-4">
      <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Building2 className="h-5 w-5" />
          </div>
          <span className="text-base font-black uppercase tracking-tight text-foreground">Outlet Tracker</span>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">Sign In</h1>
          <p className="text-xs text-muted-foreground font-medium mt-1">Enter your credentials to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 animate-in slide-in-from-top-2 duration-200">
              <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
              <p className="text-xs font-bold text-destructive">{error}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              required
              placeholder="email@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-card"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10 bg-card"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            className="w-full font-black uppercase tracking-widest text-xs shadow-md shadow-primary/20 mt-2 cursor-pointer"
            type="submit"
            disabled={loading}
          >
            {loading
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />Signing in...</>
              : "Sign In"
            }
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-[10px] text-muted-foreground/50 font-medium mt-8">
          Forgot your password? Contact your administrator.
        </p>
      </div>
    </div>
  );
};

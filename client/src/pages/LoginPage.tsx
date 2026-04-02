import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8 rounded-xl border bg-card p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Login</h1>
          <p className="text-sm text-muted-foreground">
            Masukkan kredensial Anda untuk masuk ke sistem.
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleLogin}>
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2 text-left">
            <label className="text-sm font-medium leading-none" htmlFor="email">Email</label>
            <input 
              id="email" 
              type="email" 
              required
              placeholder="nama@perusahaan.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
            />
          </div>
          <div className="space-y-2 text-left">
            <label className="text-sm font-medium leading-none" htmlFor="password">Password</label>
            <input 
              id="password" 
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
            />
          </div>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </form>
      </div>
    </div>
  );
};

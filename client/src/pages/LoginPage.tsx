import { Button } from "@/components/ui/button";

export const LoginPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8 rounded-xl border bg-card p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Login</h1>
          <p className="text-sm text-muted-foreground">
            Masukkan kredensial Anda untuk masuk ke sistem.
          </p>
        </div>
        <form className="space-y-4">
          <div className="space-y-2 text-left">
            <label className="text-sm font-medium leading-none" htmlFor="email">Email</label>
            <input 
              id="email" 
              type="email" 
              placeholder="nama@perusahaan.com"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
            />
          </div>
          <div className="space-y-2 text-left">
            <label className="text-sm font-medium leading-none" htmlFor="password">Password</label>
            <input 
              id="password" 
              type="password"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
            />
          </div>
          <Button className="w-full" type="button">Masuk</Button>
        </form>
      </div>
    </div>
  );
};

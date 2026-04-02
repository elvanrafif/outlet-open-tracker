import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";

interface PageContainerProps {
  title: string;
  children: React.ReactNode;
}

const PageContainer = ({ title, children }: PageContainerProps) => {
  const { logout, user } = useAuth();
  
  return (
    <div className="flex flex-col gap-6 p-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {user && <p className="text-sm text-muted-foreground">Logged in as: {user.name} ({user.role})</p>}
        </div>
        <Button variant="outline" size="sm" onClick={logout} className="gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
      {children}
    </div>
  );
};

export const DashboardPage = () => {
  return (
    <PageContainer title="Dashboard Project">
      <p className="text-muted-foreground text-left">
        Daftar semua project outlet yang sedang berjalan.
      </p>
      {/* Table akan diimplementasikan di Phase 3 */}
      <div className="rounded-lg border border-dashed p-20 text-center">
        Tabel Project akan muncul di sini.
      </div>
    </PageContainer>
  );
};

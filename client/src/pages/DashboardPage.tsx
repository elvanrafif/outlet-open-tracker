import { cn } from "@/lib/utils";

interface PageContainerProps {
  title: string;
  children: React.ReactNode;
}

const PageContainer = ({ title, children }: PageContainerProps) => (
  <div className="flex flex-col gap-6 p-8 animate-in fade-in duration-500">
    <h1 className="text-3xl font-bold tracking-tight text-left">{title}</h1>
    {children}
  </div>
);

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

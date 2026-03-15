import { Container } from "@/components/ui/container";
import { DashboardSidebar, DashboardMobileNav } from "@/components/dashboard/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container className="py-8">
      <DashboardMobileNav />
      <div className="flex gap-8">
        <DashboardSidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </Container>
  );
}

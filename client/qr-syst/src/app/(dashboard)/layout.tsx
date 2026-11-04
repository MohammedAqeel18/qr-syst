
import ProtectedAdminLayout from "@/components/ProtectedAdminLayout";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <ProtectedAdminLayout>
      {children}
    </ProtectedAdminLayout>
  );
}

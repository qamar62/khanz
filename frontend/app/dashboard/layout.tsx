import type { Metadata } from "next";
import { StaffProvider } from "@/components/dashboard/staff-context";
import { DashboardShell } from "@/components/dashboard/shell";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <StaffProvider>
      <DashboardShell>{children}</DashboardShell>
    </StaffProvider>
  );
}

import { AppShell } from "@/components/layout/app-shell";
import { StoreGate } from "@/components/layout/store-gate";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreGate>
      <AppShell>{children}</AppShell>
    </StoreGate>
  );
}

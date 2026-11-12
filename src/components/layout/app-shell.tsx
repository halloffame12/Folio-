"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { DesktopSidebar, MobileSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { CommandPalette } from "@/components/layout/command-palette";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const collapsed = useWorkspaceStore((s) => s.sidebarCollapsed);
  const compactTables = useWorkspaceStore((s) => s.settings.compactTables);
  const reducedMotion = useWorkspaceStore((s) => s.settings.reducedMotion);
  const systemReducedMotion = useReducedMotion();
  const pathname = usePathname();
  const motionOff = reducedMotion || Boolean(systemReducedMotion);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.compact = String(compactTables);
    root.dataset.reducedMotion = String(reducedMotion);
  }, [compactTables, reducedMotion]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="min-h-dvh bg-background">
      <a
        href="#main-content"
        className="sr-only z-[60] rounded bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <DesktopSidebar onOpenCommand={() => setCommandOpen(true)} />
      <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} />

      <div
        className={cn(
          "flex min-h-dvh flex-col transition-[padding] duration-200",
          collapsed ? "lg:pl-[72px]" : "lg:pl-[248px]"
        )}
      >
        <AppHeader
          onOpenCommand={() => setCommandOpen(true)}
          onOpenMobileNav={() => setMobileOpen(true)}
        />
        <main id="main-content" className="flex-1">
          <motion.div
            key={pathname}
            initial={motionOff ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              motionOff
                ? { duration: 0 }
                : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
            }
            className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
          >
            {children}
          </motion.div>
        </main>
        <footer className="border-t border-border/70 px-6 py-4">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-1 text-[10px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span className="font-mono uppercase tracking-[0.12em]">
              Folio · Academic research workspace
            </span>
            <span>Frontend demonstration · All scholarship shown is mock data</span>
          </div>
        </footer>
      </div>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}

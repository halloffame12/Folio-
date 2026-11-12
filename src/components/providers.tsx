"use client";

import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="folio-theme">
      <TooltipProvider delayDuration={200}>
        {children}
        <Toaster
          position="bottom-right"
          closeButton
          toastOptions={{
            classNames: {
              toast:
                "!rounded-md !border !border-border !bg-card !text-foreground !font-sans !text-[13px] !shadow-float",
              title: "!font-medium",
              description: "!text-muted-foreground !text-[12px]",
              actionButton: "!bg-primary !text-primary-foreground",
              closeButton: "!bg-card !border-border !text-muted-foreground",
            },
          }}
        />
      </TooltipProvider>
    </ThemeProvider>
  );
}

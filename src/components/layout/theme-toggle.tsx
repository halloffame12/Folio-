"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ThemeToggle({
  align = "default",
}: {
  align?: "default" | "sidebar";
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className={
            align === "sidebar"
              ? "text-sidebar-foreground/70 hover:text-sidebar-foreground"
              : "text-muted-foreground"
          }
        >
          <Sun className={`size-4 ${isDark ? "hidden" : "block"}`} aria-hidden />
          <Moon className={`size-4 ${isDark ? "block" : "hidden"}`} aria-hidden />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        {isDark ? "Light theme" : "Dark theme"}
      </TooltipContent>
    </Tooltip>
  );
}

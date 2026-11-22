"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const links = [
  { label: "Features", href: "/features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Documentation", href: "/docs" },
  { label: "About", href: "/about" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-background/95 backdrop-blur transition-colors",
        scrolled ? "border-border" : "border-transparent"
      )}
    >
      <div className="marketing-container flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          aria-label="Folio home"
          className="flex shrink-0 items-center rounded-sm"
        >
          <Logo subtitle={null} />
        </Link>

        <nav aria-label="Primary" className="hidden md:flex">
          <ul className="flex items-center gap-8">
            {links.map((link) => {
              const active =
                link.href === pathname ||
                (link.href.startsWith("/#") && pathname === "/");
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "text-[13.5px] transition-colors",
                      active
                        ? "font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/signin"
            className="hidden h-9 items-center px-3 text-[13.5px] text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            Sign in
          </Link>
          <Button
            asChild
            size="sm"
            className="hidden h-9 px-4 text-[13.5px] sm:inline-flex"
          >
            <Link href="/signup">Get started</Link>
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 md:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="size-5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-[86vw] max-w-[340px] flex-col gap-0 border-l border-border bg-background p-0"
            >
              <SheetHeader className="border-b border-border px-5 py-4 text-left">
                <SheetTitle className="sr-only">Folio navigation</SheetTitle>
                <Logo subtitle={null} />
              </SheetHeader>

              <nav aria-label="Mobile navigation" className="flex-1 px-5 py-4">
                <ul className="divide-y divide-border">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex py-3.5 text-[15px] text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="space-y-2 border-t border-border px-5 py-4">
                <Button asChild variant="outline" className="h-10 w-full">
                  <Link href="/signin" onClick={() => setMobileOpen(false)}>
                    Sign in
                  </Link>
                </Button>
                <Button asChild className="h-10 w-full">
                  <Link href="/signup" onClick={() => setMobileOpen(false)}>
                    Get started
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

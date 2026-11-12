"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu } from "lucide-react";
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
  { label: "Features", href: "/#features", section: "features" },
  { label: "How it works", href: "/#how-it-works", section: "how-it-works" },
  { label: "Research tools", href: "/#showcase", section: "showcase" },
  { label: "About", href: "/about", section: null },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection(null);
      return;
    }
    const sections = ["features", "how-it-works", "showcase"]
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-38% 0px -52% 0px", threshold: [0, 0.25, 0.5] }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  const isActive = (link: (typeof links)[number]) =>
    link.section ? pathname === "/" && activeSection === link.section : pathname === link.href;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled
          ? "border-b border-border/80 bg-background/90 backdrop-blur-md"
          : "border-b border-transparent bg-background/0"
      )}
    >
      <div className="marketing-container flex h-16 items-center gap-4">
        <Link href="/" aria-label="Folio home" className="shrink-0 rounded-sm">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden flex-1 justify-center lg:flex">
          <ul className="flex items-center gap-7">
            {links.map((link) => {
              const active = isActive(link);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? (link.section ? "location" : "page") : undefined}
                    className={cn(
                      "group relative inline-flex h-16 items-center text-[12.5px] font-medium transition-colors",
                      active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {link.label}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-x-0 bottom-[18px] h-[1.5px] origin-left bg-accent transition-transform duration-300",
                        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
          <Link
            href="/signin"
            className="hidden rounded px-2 py-1.5 text-[12.5px] font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            Sign in
          </Link>
          <Button asChild size="sm" className="h-8 px-3.5">
            <Link href="/signup">
              Get started <ArrowUpRight className="hidden sm:block" />
            </Link>
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-[320px] flex-col gap-0 border-border bg-background p-0 sm:max-w-[340px]"
            >
              <SheetHeader className="border-b border-border px-5 py-4 text-left">
                <SheetTitle className="sr-only">Site navigation</SheetTitle>
                <Logo />
              </SheetHeader>

              <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 py-6">
                <p className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-muted-foreground">
                  Explore
                </p>
                <ul className="mt-3 divide-y divide-border/70 border-y border-border/70">
                  {links.map((link, index) => {
                    const active = isActive(link);
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          aria-current={active ? (link.section ? "location" : "page") : undefined}
                          className="group flex items-center gap-3 py-3.5"
                        >
                          <span className="font-mono text-[9px] tabular-nums text-muted-foreground/60">
                            0{index + 1}
                          </span>
                          <span
                            className={cn(
                              "flex-1 font-display text-[17px] font-medium tracking-[-0.02em]",
                              active ? "text-foreground" : "text-foreground/80"
                            )}
                          >
                            {link.label}
                          </span>
                          <ArrowUpRight className="size-3.5 text-muted-foreground/50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-6 rounded border border-dashed border-border bg-surface/40 p-3.5">
                  <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted-foreground">
                    Demonstration workspace
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    Explore the product without creating an account. All scholarship shown is mock
                    data.
                  </p>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                  >
                    Open the workspace <ArrowUpRight className="size-3" />
                  </Link>
                </div>
              </nav>

              <div className="space-y-2 border-t border-border p-5">
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

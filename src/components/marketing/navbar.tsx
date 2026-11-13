"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ArrowUpRight, Menu } from "lucide-react";
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
  { label: "Product", href: "/#product", section: "product" },
  { label: "Features", href: "/#features", section: "features" },
  { label: "Workflow", href: "/#workflow", section: "workflow" },
  { label: "About", href: "/about", section: null },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection(null);
      return;
    }
    const sections = ["product", "features", "workflow"]
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
        "sticky top-0 z-50 border-b border-border transition-colors duration-300",
        scrolled ? "bg-background/95 backdrop-blur-md" : "bg-background"
      )}
    >
      <div className="marketing-container flex h-16 items-center gap-6 lg:h-[72px]">
        <Link href="/" aria-label="Folio home" className="shrink-0 rounded-none">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden flex-1 lg:block">
          <ul className="flex items-center gap-8 pl-4">
            {links.map((link) => {
              const active = isActive(link);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? (link.section ? "location" : "page") : undefined}
                    className={cn(
                      "group relative inline-flex h-[72px] items-center text-[13px] font-medium tracking-[-0.01em] transition-colors",
                      active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {link.label}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-x-0 bottom-[21px] h-[2px] origin-left bg-accent transition-transform duration-300",
                        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
          <ThemeToggle />
          <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
          <Link
            href="/signin"
            className="hidden px-1 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            Sign in
          </Link>
          <Button
            asChild
            size="sm"
            className="hidden h-9 rounded-none px-4 text-[12.5px] tracking-[-0.01em] sm:inline-flex"
          >
            <Link href="/signup">
              Get started <ArrowUpRight className="hidden md:block" />
            </Link>
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-none lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-[88vw] flex-col gap-0 rounded-none border-l border-border bg-background p-0 sm:max-w-[380px]"
            >
              <SheetHeader className="border-b border-border px-6 py-5 text-left">
                <SheetTitle className="sr-only">Site navigation</SheetTitle>
                <Logo />
              </SheetHeader>

              <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-6 py-7">
                <p className="marketing-eyebrow">Contents</p>
                <ul className="mt-4 border-t border-border">
                  {links.map((link, index) => {
                    const active = isActive(link);
                    return (
                      <li key={link.href} className="border-b border-border">
                        <Link
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          aria-current={active ? (link.section ? "location" : "page") : undefined}
                          className="group flex items-baseline gap-4 py-4"
                        >
                          <span className="font-mono text-[10px] tabular-nums text-accent">
                            0{index + 1}
                          </span>
                          <span
                            className={cn(
                              "flex-1 font-display text-[22px] font-semibold tracking-[-0.035em]",
                              active ? "text-foreground" : "text-foreground/80"
                            )}
                          >
                            {link.label}
                          </span>
                          <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-8 border border-border bg-surface/50 p-4">
                  <p className="marketing-eyebrow">A research workspace</p>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
                    Papers, notes, reviews, and projects in one account-backed workspace.
                  </p>
                  <Link
                    href="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-primary hover:underline"
                  >
                    Create an account <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </nav>

              <div className="space-y-2 border-t border-border p-6">
                <Button asChild variant="outline" className="h-11 w-full rounded-none">
                  <Link href="/signin" onClick={() => setMobileOpen(false)}>
                    Sign in
                  </Link>
                </Button>
                <Button asChild className="h-11 w-full rounded-none">
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

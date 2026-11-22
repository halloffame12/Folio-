"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function AuthShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSignup = pathname === "/signup";

  return (
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-[minmax(0,44%)_minmax(0,1fr)]">
      <aside className="hidden border-r border-border bg-secondary/40 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:justify-between lg:px-12 lg:py-10">
        <Link href="/" aria-label="Folio home" className="inline-flex w-fit">
          <Logo subtitle={null} />
        </Link>

        <div className="max-w-[360px]">
          <h2 className="font-serif text-[clamp(1.9rem,2.6vw,2.5rem)] leading-[1.15] tracking-[-0.02em] text-foreground">
            {isSignup
              ? "A place for the papers you keep."
              : "Pick up where you stopped."}
          </h2>
          <p className="mt-4 text-[14px] leading-[1.7] text-muted-foreground">
            {isSignup
              ? "Create one workspace for your library, notes, literature reviews, and projects."
              : "Your library, notes, and projects are waiting in your workspace."}
          </p>
        </div>

        <ul className="space-y-2 text-[13px] text-muted-foreground">
          <li>Search Crossref and OpenAlex</li>
          <li>Save papers with their metadata</li>
          <li>Write notes and literature reviews</li>
          <li>Work on projects with co-authors</li>
        </ul>
      </aside>

      <div className="flex min-h-dvh flex-col">
        <header className="flex items-center justify-between gap-3 px-5 py-5 sm:px-8 lg:px-10">
          <Link href="/" aria-label="Folio home" className="inline-flex lg:hidden">
            <Logo subtitle={null} />
          </Link>
          <span className="hidden text-[13px] text-muted-foreground lg:block">
            Folio research workspace
          </span>
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className="hidden h-8 items-center px-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              Back to site
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex flex-1 items-start px-5 pb-10 pt-2 sm:px-8 sm:pt-4 lg:items-center lg:px-10">
          <div className="mx-auto w-full max-w-[400px]">{children}</div>
        </main>

        <footer className="border-t border-border px-5 py-4 sm:px-8 lg:px-10">
          <div className="mx-auto flex max-w-[400px] items-center justify-between gap-4 text-[12px] text-muted-foreground">
            <span>© {new Date().getFullYear()} Folio</span>
            <span className="flex items-center gap-3">
              <Link href="/privacy" className="transition-colors hover:text-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="transition-colors hover:text-foreground">
                Terms
              </Link>
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

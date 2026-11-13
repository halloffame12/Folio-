import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const capabilities = [
  { index: "01", label: "Discover", detail: "Search scholarly literature" },
  { index: "02", label: "Organise", detail: "Libraries, collections, notes" },
  { index: "03", label: "Collaborate", detail: "Projects, tasks, milestones" },
  { index: "04", label: "Understand", detail: "Reviews and research signals" },
];

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(400px,46%)]">
      <div className="flex min-h-dvh flex-col">
        <header className="flex items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <Link href="/" aria-label="Folio home" className="rounded-sm">
            <Logo />
          </Link>
          <div className="flex items-center gap-1.5">
            <Link
              href="/"
              className="hidden items-center gap-1 rounded px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              Back to site <ArrowUpRight className="size-3" />
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex flex-1 items-start px-5 pb-12 pt-4 sm:px-8 sm:pt-8 lg:px-12 lg:pt-10">
          <div className="mx-auto w-full max-w-[452px]">{children}</div>
        </main>

        <footer className="border-t border-border/70 px-5 py-4 sm:px-8 lg:px-12">
          <div className="mx-auto flex max-w-[452px] flex-wrap items-center justify-between gap-2 font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted-foreground/70">
            <span>Folio · Research workspace</span>
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

      <aside className="relative hidden min-h-dvh overflow-hidden border-l border-primary/20 bg-primary text-primary-foreground lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:justify-between lg:px-11 lg:py-10 xl:px-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.13]"
          style={{
            backgroundImage:
              "linear-gradient(to right, hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--primary-foreground)) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        <svg
          aria-hidden
          viewBox="0 0 220 220"
          className="pointer-events-none absolute -right-16 -top-16 size-[300px] text-primary-foreground/20"
        >
          <circle cx="110" cy="110" r="108" fill="none" stroke="currentColor" strokeWidth="0.8" />
          <circle cx="110" cy="110" r="74" fill="none" stroke="currentColor" strokeWidth="0.8" />
          <circle cx="110" cy="110" r="38" fill="none" stroke="currentColor" strokeWidth="0.8" />
          <path d="M0 110h220M110 0v220" stroke="currentColor" strokeWidth="0.8" />
        </svg>
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-20 size-[320px] rounded-full bg-accent/20 blur-3xl"
        />

        <div className="relative flex items-center justify-between">
          <span className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-primary-foreground/55 dark:text-primary-foreground/80">
            Vol. 01 · Research workspace
          </span>
          <LogoMark inverse className="size-8" />
        </div>

        <div className="relative max-w-[430px] py-12">
          <p className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-accent dark:text-[hsl(18_58%_22%)]">
            <span className="inline-block size-1.5 bg-accent" aria-hidden />
            The shape of research work
          </p>
          <p className="mt-6 font-serif text-[36px] leading-[1.05] tracking-[-0.02em] xl:text-[42px]">
            A quieter place for{" "}
            <em className="italic text-accent dark:text-[hsl(18_58%_22%)]">serious</em> research.
          </p>
          <p className="mt-6 max-w-[360px] text-[13px] leading-[1.75] text-primary-foreground/70 dark:text-primary-foreground/85">
            Papers, notes, projects, and literature reviews — held together in one
            considered workspace, so the work itself gets more room.
          </p>
        </div>

        <div className="relative">
          <ol className="border-y border-primary-foreground/15">
            {capabilities.map((item) => (
              <li
                key={item.index}
                className="grid grid-cols-[32px_minmax(0,1fr)_auto] items-baseline gap-3 border-b border-primary-foreground/10 py-3 last:border-0"
              >
                <span className="font-mono text-[9px] tabular-nums text-primary-foreground/40 dark:text-primary-foreground/70">
                  {item.index}
                </span>
                <span className="font-display text-[13px] font-medium tracking-[-0.01em]">
                  {item.label}
                </span>
                <span className="hidden text-right text-[10.5px] text-primary-foreground/50 dark:text-primary-foreground/75 xl:block">
                  {item.detail}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-5 font-mono text-[8px] uppercase leading-relaxed tracking-[0.16em] text-primary-foreground/40 dark:text-primary-foreground/75">
            Frontend demonstration · Mock scholarship
            <br />
            No live services or emails
          </p>
        </div>
      </aside>
    </div>
  );
}

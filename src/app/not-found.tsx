import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />

      <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" aria-label="Folio home">
          <Logo />
        </Link>
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
          Error 404
        </span>
      </header>

      <main className="relative z-10 flex flex-1 items-center px-5 py-10 sm:px-8">
        <div className="mx-auto w-full max-w-3xl">
          <div className="grid gap-8 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-start">
            <p
              className="font-serif text-[92px] leading-[0.8] tracking-[-0.06em] text-primary/25 sm:text-[120px]"
              aria-hidden
            >
              404
            </p>
            <div>
              <p className="eyebrow flex items-center gap-2">
                <span className="inline-block size-1 bg-accent" aria-hidden />
                Off the shelf
              </p>
              <h1 className="page-title mt-3 text-balance">
                This page is not in the catalogue.
              </h1>
              <p className="mt-3 max-w-md text-[13px] leading-relaxed text-muted-foreground">
                The address may be mistyped, or the record may have been moved. Everything in
                Folio is reachable from the workspace sections.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <Button asChild>
                  <Link href="/">
                    <ArrowLeft /> Back to home
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard">
                    <Compass /> Open workspace
                  </Link>
                </Button>
              </div>

              <div className="mt-8 border-t border-border pt-4">
                <p className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted-foreground">
                  Try instead
                </p>
                <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[11.5px]">
                  {[
                    { href: "/library", label: "My Library" },
                    { href: "/projects", label: "Projects" },
                    { href: "/tasks", label: "Tasks" },
                    { href: "/literature", label: "Literature reviews" },
                    { href: "/citations", label: "Citation generator" },
                    { href: "/settings", label: "Settings" },
                  ].map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground/40"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-border/70 px-5 py-4 sm:px-8">
        <p className="mx-auto max-w-3xl font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground/60">
          Folio · Frontend demonstration · All scholarship shown is mock data
        </p>
      </footer>
    </div>
  );
}

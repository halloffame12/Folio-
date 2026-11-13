import Link from "next/link";
import { Logo } from "@/components/brand/logo";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Discover Papers", href: "/discover" },
      { label: "Research Library", href: "/library" },
      { label: "Projects", href: "/projects" },
      { label: "Literature Reviews", href: "/literature" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "About", href: "/about" },
      { label: "Documentation", href: "/docs" },
      { label: "Help Center", href: "/help" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign In", href: "/signin" },
      { label: "Create Account", href: "/signup" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/35">
      <div className="marketing-container py-12 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_2fr]">
          <div>
            <Link href="/" aria-label="Folio home" className="inline-flex rounded-sm">
              <Logo />
            </Link>
            <p className="mt-4 max-w-[300px] text-[12px] leading-[1.7] text-muted-foreground">
              A considered workspace for discovering papers, organising literature, and moving
              research forward with your team.
            </p>
            <p className="mt-6 font-mono text-[8px] uppercase leading-relaxed tracking-[0.14em] text-muted-foreground/60">
              Academic research workspace
              <br />
              Real data and real accounts
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-4">
            {columns.map((column) => (
              <div key={column.title}>
                <h2 className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-muted-foreground">
                  {column.title}
                </h2>
                <ul className="mt-3 space-y-2">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[11.5px] text-foreground/75 underline-offset-4 transition-colors hover:text-foreground hover:underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted-foreground/60">
            © 2026 Folio · Academic research workspace
          </p>
          <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted-foreground/50">
            Set in Manrope, Newsreader, Inter &amp; IBM Plex Mono
          </p>
        </div>
      </div>
    </footer>
  );
}

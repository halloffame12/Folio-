import Link from "next/link";
import { Logo } from "@/components/brand/logo";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Discover", href: "/discover" },
      { label: "Library", href: "/library" },
      { label: "Projects", href: "/projects" },
      { label: "Literature reviews", href: "/literature" },
      { label: "Gap explorer", href: "/research-gaps" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Features", href: "/features" },
      { label: "Documentation", href: "/docs" },
      { label: "Help centre", href: "/help" },
      { label: "About", href: "/about" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: "/signin" },
      { label: "Create account", href: "/signup" },
      { label: "Reset password", href: "/forgot-password" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of service", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="border-b border-border">
        <div className="marketing-container flex items-center justify-between gap-4 py-2.5">
          <p className="marketing-eyebrow">Folio · Research workspace</p>
          <p className="marketing-eyebrow hidden text-muted-foreground sm:block">End matter</p>
        </div>
      </div>

      <div className="marketing-container py-12 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Link href="/" aria-label="Folio home" className="inline-flex">
              <Logo />
            </Link>
            <p className="mt-5 max-w-[300px] text-[12.5px] leading-[1.75] text-muted-foreground">
              A considered workspace for discovering papers, organising literature, building
              reviews, and moving research forward with your team.
            </p>
            <p className="mt-6 max-w-[300px] border-t border-border pt-4 font-mono text-[8.5px] uppercase leading-[1.8] tracking-[0.14em] text-muted-foreground">
              Account-backed workspace
              <br />
              Real scholarly metadata
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-4 lg:col-span-8">
            {columns.map((column, index) => (
              <div
                key={column.title}
                className={index > 0 ? "sm:border-l sm:border-border sm:pl-6" : undefined}
              >
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
          <p className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted-foreground">
            © 2026 Folio · Academic research workspace
          </p>
          <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted-foreground">
            Set in Manrope, Newsreader, Inter &amp; IBM Plex Mono
          </p>
        </div>
      </div>
    </footer>
  );
}

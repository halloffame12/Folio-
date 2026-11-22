import Link from "next/link";
import { Github } from "lucide-react";
import { Logo } from "@/components/brand/logo";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Documentation", href: "/docs" },
      { label: "Get started", href: "/signup" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Help", href: "/help" },
      { label: "Sign in", href: "/signin" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-background">
      <div className="marketing-container py-12 sm:py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto] lg:gap-16">
          <div>
            <Link href="/" aria-label="Folio home" className="inline-flex">
              <Logo subtitle={null} />
            </Link>
            <p className="mt-3 max-w-[280px] text-[13.5px] leading-relaxed text-muted-foreground">
              A research workspace for finding papers, keeping a library, and
              writing from your sources.
            </p>
            <a
              href="https://github.com/halloffame12/Folio-"
              target="_blank"
              rel="noreferrer noopener"
              className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github className="size-4" aria-hidden />
              GitHub
            </a>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-[13px] font-medium text-foreground">{column.title}</p>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-5">
          <p className="text-[12.5px] text-muted-foreground">
            © {year} Folio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

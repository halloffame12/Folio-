import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

const suggestions = [
  { href: "/library", label: "Library" },
  { href: "/projects", label: "Projects" },
  { href: "/literature", label: "Literature reviews" },
  { href: "/settings", label: "Settings" },
];

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" aria-label="Folio home">
          <Logo subtitle={null} />
        </Link>
        <Link
          href="/"
          className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          Back to site
        </Link>
      </header>

      <main className="flex flex-1 items-center px-5 py-12 sm:px-8">
        <div className="mx-auto w-full max-w-[640px]">
          <p className="text-[13px] text-muted-foreground">404</p>
          <h1 className="page-title mt-2 text-balance">
            We could not find that page.
          </h1>
          <p className="mt-3 text-[14.5px] leading-[1.7] text-muted-foreground">
            The link may be out of date. Try one of these instead.
          </p>

          <div className="mt-6">
            <Button asChild>
              <Link href="/">
                <ArrowLeft /> Back to home
              </Link>
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-5 text-[13.5px]">
            {suggestions.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <footer className="border-t border-border px-5 py-4 sm:px-8">
        <p className="mx-auto max-w-[640px] text-[12px] text-muted-foreground">
          © {new Date().getFullYear()} Folio
        </p>
      </footer>
    </div>
  );
}

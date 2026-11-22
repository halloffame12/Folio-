import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/marketing/reveal";

export function FinalCta() {
  return (
    <section className="border-b border-border bg-inverse text-inverse-foreground">
      <Reveal>
        <div className="marketing-container flex flex-col items-start justify-between gap-8 py-16 sm:flex-row sm:items-center sm:py-20">
          <div className="max-w-[480px]">
            <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.08] tracking-[-0.02em]">
              Start your workspace.
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-inverse-foreground/70">
              Create an account and begin with your first search.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Button
              asChild
              size="lg"
              className="h-11 bg-background px-5 text-foreground hover:bg-background/90"
            >
              <Link href="/signup">Create an account</Link>
            </Button>
            <Link
              href="/signin"
              className="inline-flex h-11 items-center justify-center px-4 text-[14px] text-inverse-foreground/75 underline decoration-inverse-foreground/30 underline-offset-4 transition-colors hover:text-inverse-foreground"
            >
              Sign in
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

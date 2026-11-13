import Link from "next/link";
import { ArrowUpRight, BookOpen, FlaskConical, Library } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";

const groups = [
  {
    index: "01",
    icon: BookOpen,
    kicker: "Individual researchers",
    title: "A place for the reading and the thinking.",
    body: "For a dissertation chapter or an independent paper, the work depends on holding a large body of reading in a usable form. Folio keeps the library, the notes, and the review together.",
    links: [
      { href: "/library", label: "Library" },
      { href: "/notes", label: "Notes" },
    ],
  },
  {
    index: "02",
    icon: FlaskConical,
    kicker: "Research teams",
    title: "Shared context, without shared chaos.",
    body: "A team needs to know which evidence is in play, who owns the next step, and how close the project is to its next milestone. Projects, tasks, and reviews keep that visible.",
    links: [
      { href: "/projects", label: "Projects" },
      { href: "/literature", label: "Reviews" },
    ],
  },
  {
    index: "03",
    icon: Library,
    kicker: "Departments & research support",
    title: "Make research practice legible.",
    body: "Supervisors and subject librarians are often asked to help without a view of the work itself. A structured workspace gives support a concrete place to begin.",
    links: [
      { href: "/features", label: "Features" },
      { href: "/about", label: "About Folio" },
    ],
  },
];

export function AudienceSection() {
  return (
    <section id="audiences" aria-labelledby="audiences-heading" className="border-b border-border">
      <div className="marketing-container py-16 sm:py-20 lg:py-24">
        <Reveal>
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
            <div className="flex items-start gap-2.5 lg:col-span-3 lg:flex-col lg:gap-2">
              <span className="font-mono text-[10px] tabular-nums tracking-[0.18em] text-accent">
                08
              </span>
              <span className="marketing-eyebrow">Who it is for</span>
            </div>
            <div className="lg:col-span-9">
              <h2 id="audiences-heading" className="section-display max-w-[820px]">
                One product, three{" "}
                <span className="font-serif font-normal italic text-primary">working</span> contexts.
              </h2>
              <p className="mt-5 max-w-[560px] text-[14px] leading-[1.75] text-muted-foreground">
                The same workspace serves a solo dissertation, a funded lab, and a department
                reading group. What changes is the scale of coordination, not the structure of the
                work.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 border-t-2 border-foreground/80">
          {groups.map((group, index) => {
            const Icon = group.icon;
            return (
              <Reveal key={group.index} delay={index * 0.04}>
                <article className="grid gap-5 border-b border-border py-7 lg:grid-cols-12 lg:items-start lg:gap-8 lg:py-8">
                  <div className="flex items-baseline gap-3 lg:col-span-3">
                    <span className="font-mono text-[9px] tabular-nums tracking-[0.16em] text-accent">
                      {group.index}
                    </span>
                    <span className="flex size-8 items-center justify-center border border-border bg-surface/50 text-primary">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="font-mono text-[8.5px] uppercase leading-relaxed tracking-[0.13em] text-muted-foreground">
                      {group.kicker}
                    </span>
                  </div>

                  <div className="lg:col-span-6">
                    <h3 className="font-display text-[20px] font-semibold leading-tight tracking-[-0.03em] sm:text-[22px]">
                      {group.title}
                    </h3>
                    <p className="mt-2 max-w-[560px] text-[12.5px] leading-[1.75] text-muted-foreground">
                      {group.body}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-start gap-2 lg:col-span-3 lg:justify-end">
                    {group.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="inline-flex items-center gap-1.5 border-b border-foreground/20 py-1 text-[11px] font-medium text-foreground/75 transition-colors hover:border-foreground hover:text-foreground"
                      >
                        {link.label} <ArrowUpRight className="size-3" aria-hidden />
                      </Link>
                    ))}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

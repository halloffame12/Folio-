import Link from "next/link";
import { ArrowUpRight, BookOpen, FlaskConical, Library } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";
import { SectionIntro } from "@/components/marketing/section-intro";

const groups = [
  {
    index: "01",
    icon: BookOpen,
    kicker: "For the individual researcher",
    title: "A place for the reading and the thinking.",
    body: "Whether you are writing a dissertation chapter or an independent paper, the work depends on holding a large body of reading in a usable form. Folio keeps the library, the notes, and the review together.",
    list: [
      "A library organised by project, not just by author",
      "Reading memos attached to the source",
      "Citation output in four common styles",
    ],
    links: [
      { href: "/library", label: "Library" },
      { href: "/notes", label: "Notes" },
    ],
  },
  {
    index: "02",
    icon: FlaskConical,
    kicker: "For the research team",
    title: "Shared context, without shared chaos.",
    body: "A team needs more than a shared drive. It needs to know which evidence is in play, who is responsible for the next step, and how close the project is to its next milestone.",
    list: [
      "Projects with members, tasks, and milestones",
      "Collections that the whole team can read",
      "Review progress visible to co-authors",
    ],
    links: [
      { href: "/projects", label: "Projects" },
      { href: "/literature", label: "Literature reviews" },
    ],
  },
  {
    index: "03",
    icon: Library,
    kicker: "For departments & research support",
    title: "Make research practice legible.",
    body: "Supervisors, subject librarians, and research support staff are often asked to help without a view of the work itself. A structured workspace gives support a concrete place to begin.",
    list: [
      "Reusable reading lists for cohorts",
      "Transparent research signals with caveats",
      "A consistent structure across projects",
    ],
    links: [
      { href: "/features", label: "Features" },
      { href: "/about", label: "About Folio" },
    ],
  },
];

export function AudienceSection() {
  return (
    <section
      id="audiences"
      aria-labelledby="audiences-heading"
      className="border-b border-border bg-surface/30"
    >
      <div className="marketing-container py-16 sm:py-20 lg:py-24">
        <Reveal>
          <SectionIntro
            index="07"
            label="Audience"
            title={
              <span id="audiences-heading">
                One product, three{" "}
                <span className="font-serif font-normal italic text-accent">working</span> contexts.
              </span>
            }
            lede="The same workspace serves a solo dissertation, a funded lab, and a department reading group. What changes is the scale of coordination, not the underlying structure of the work."
          />
        </Reveal>

        <div className="mt-12 divide-y divide-border border-y border-border">
          {groups.map((group, index) => {
            const Icon = group.icon;
            return (
              <Reveal key={group.index} delay={index * 0.05}>
                <article className="grid gap-5 py-8 lg:grid-cols-[180px_minmax(0,1fr)_240px] lg:gap-10 lg:py-10">
                  <div className="flex items-start gap-3 lg:flex-col lg:gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-[3px] border border-border bg-card text-primary">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div>
                      <p className="font-mono text-[8.5px] tabular-nums tracking-[0.16em] text-accent">
                        {group.index}
                      </p>
                      <p className="mt-1 font-mono text-[8px] uppercase leading-relaxed tracking-[0.13em] text-muted-foreground">
                        {group.kicker}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display text-[21px] font-semibold leading-tight tracking-[-0.025em] sm:text-[23px]">
                      {group.title}
                    </h3>
                    <p className="mt-2 max-w-[540px] text-[12.5px] leading-[1.75] text-muted-foreground">
                      {group.body}
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5">
                      {group.list.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-[11px] text-foreground/70">
                          <span className="block size-1 bg-accent" aria-hidden />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap items-start gap-2 lg:justify-end">
                    {group.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="inline-flex items-center gap-1 rounded border border-border bg-card px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.13em] text-foreground/75 transition-colors hover:border-primary/30 hover:text-primary"
                      >
                        {link.label} <ArrowUpRight className="size-2.5" aria-hidden />
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

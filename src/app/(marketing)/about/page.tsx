import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MarketingPage, ProseSection } from "@/components/marketing/marketing-page";
import { openGraphImage } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why Folio exists, the design principles behind it, and what this frontend demonstration is and is not.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Folio",
    description:
      "A considered academic research workspace, built around the relationships between sources, notes, and arguments.",
    url: "/about",
    type: "website",
    images: [openGraphImage],
  },
};

const principles = [
  {
    index: "01",
    title: "Structure follows the work",
    body: "The interface mirrors the research process — reading, noting, synthesising, coordinating — rather than a generic folder hierarchy borrowed from office software.",
  },
  {
    index: "02",
    title: "Provenance stays visible",
    body: "A claim should be traceable to the paper, note, or review section it came from. Links are treated as part of the content, not metadata to be reconstructed later.",
  },
  {
    index: "03",
    title: "Calm over clever",
    body: "Editorial typography, restrained colour, and predictable interaction. The workspace should recede so the scholarship can occupy attention.",
  },
  {
    index: "04",
    title: "Honest about limits",
    body: "The product states what it does not do. Potential opportunities are labelled as such, planned work is marked planned, and mock data is never presented as evidence.",
  },
];

export default function AboutPage() {
  return (
    <MarketingPage
      index="02"
      label="About"
      title={
        <>
          A quieter place for{" "}
          <span className="font-serif font-normal italic text-primary">serious</span> research.
        </>
      }
      lede="Folio began from a simple observation: the tools around research are numerous, but the relationships between them are not represented anywhere. This project asks what a workspace would look like if those relationships were the organising principle."
      meta="A capstone project · Frontend demonstration"
      aside={
        <div className="flex flex-wrap gap-2 lg:flex-col lg:items-start">
          <Link
            href="/features"
            className="inline-flex items-center gap-1 rounded border border-border bg-card px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.13em] text-foreground/75 transition-colors hover:border-primary/30 hover:text-primary"
          >
            Explore features <ArrowUpRight className="size-2.5" aria-hidden />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 rounded border border-border bg-card px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.13em] text-foreground/75 transition-colors hover:border-primary/30 hover:text-primary"
          >
            Open the demo <ArrowUpRight className="size-2.5" aria-hidden />
          </Link>
        </div>
      }
    >
      <ProseSection title="The premise">
        <p>
          A research project is not a pile of PDFs. It is a network of commitments: this question
          to that literature, this method to that critique, this claim to that source. Most software
          stores the files and leaves the network in the researcher&apos;s head.
        </p>
        <p>
          Folio is an attempt to give that network a surface. Papers, notes, collections, reviews,
          tasks, and citations are modelled as related objects rather than separate silos. The
          interface is deliberately editorial — closer to a well-set journal than a dashboard of
          widgets — because sustained reading and writing deserve a calmer environment.
        </p>
      </ProseSection>

      <ProseSection title="Design principles">
        <div className="not-prose mt-2 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2">
          {principles.map((principle) => (
            <div key={principle.index} className="bg-card p-4">
              <span className="font-mono text-[8.5px] tabular-nums tracking-[0.16em] text-accent">
                {principle.index}
              </span>
              <h3 className="!mt-2 font-display text-[14px] font-semibold tracking-[-0.015em]">
                {principle.title}
              </h3>
              <p className="!mb-0 mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
                {principle.body}
              </p>
            </div>
          ))}
        </div>
      </ProseSection>

      <ProseSection title="What this build is">
        <p>
          The project is a working frontend: a complete marketing site, a set of authentication
          screens, and a preloaded research workspace. It is built with Next.js, React, TypeScript,
          Tailwind CSS, Radix primitives, Framer Motion, and a local mock data layer. The design
          system uses Manrope, Newsreader, Inter, and IBM Plex Mono, with a forest-and-paper palette
          and a working dark theme.
        </p>
        <p>
          Authentication is demonstrated rather than implemented. Accounts created in this browser
          are stored locally with a salted digest, not a plain-text password, but the system is
          explicitly not production security. You can explore the workspace without an account at{" "}
          <Link href="/dashboard">/dashboard</Link>.
        </p>
      </ProseSection>

      <ProseSection title="What this build is not">
        <p>
          It is not a commercial service, a live literature index, a collaboration backend, or a
          claim of institutional endorsement. It has no real users, partners, customers, or
          testimonials — and it does not invent any. All papers, authors, institutions, projects,
          and notes in the demonstration are fictional.
        </p>
        <p>
          The gap explorer is a good example of the project&apos;s stance. It can show where output
          on a topic is thin, but it labels those readings as potential opportunities, not verified
          gaps, because absence of evidence is not evidence of absence.
        </p>
      </ProseSection>

      <ProseSection title="Why the details matter">
        <p>
          Research software is often evaluated on features. This project argues that tone matters
          too: the typography, the density, the way a citation is set, the way a loading state
          behaves. Those details are not decoration. They signal whether a tool expects to be lived
          in for years.
        </p>
        <p>
          Folio is a small attempt at that standard — a workspace that treats the researcher as a
          reader and writer first, and a user second.
        </p>
      </ProseSection>
    </MarketingPage>
  );
}

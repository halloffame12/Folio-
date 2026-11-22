import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage, ProseSection } from "@/components/marketing/marketing-page";
import { openGraphImage } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why Folio exists, how it is built, and what the project is and is not.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Folio",
    description:
      "A research workspace built around the links between papers, notes, and writing.",
    url: "/about",
    type: "website",
    images: [openGraphImage],
  },
};

const principles = [
  {
    title: "Follow the work",
    body: "The interface follows reading, noting, writing, and coordinating instead of copying a folder tree from office software.",
  },
  {
    title: "Keep sources visible",
    body: "A claim should be traceable to the paper, note, or review section behind it. Links are part of the content, not something to rebuild later.",
  },
  {
    title: "Keep it plain",
    body: "Simple type, restrained colour, and predictable controls. The workspace should stay out of the way while you read and write.",
  },
  {
    title: "Say what it cannot do",
    body: "The product states its limits. Research signals are labelled as prompts, and the previews on this site are illustrative, not evidence.",
  },
];

export default function AboutPage() {
  return (
    <MarketingPage
      label="About"
      title="Why Folio exists"
      lede="Research tools are everywhere, but the links between them usually are not. Folio is built around those links."
    >
      <ProseSection title="The idea">
        <p>
          A research project is more than a pile of PDFs. It connects a question to a body of
          literature, a method to a critique, and a claim to a source. Most software stores the
          files and leaves those connections in the researcher&apos;s head.
        </p>
        <p>
          Folio gives those connections a place to live. Papers, notes, collections, reviews, tasks,
          and citations are stored as related records rather than separate silos.
        </p>
      </ProseSection>

      <ProseSection title="How it is built">
        <div className="not-prose mt-2 grid gap-3 sm:grid-cols-2">
          {principles.map((principle) => (
            <div key={principle.title} className="rounded-md border border-border p-4">
              <h3 className="!mt-0 text-[13.5px] font-medium text-foreground">{principle.title}</h3>
              <p className="!mb-0 mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
                {principle.body}
              </p>
            </div>
          ))}
        </div>
      </ProseSection>

      <ProseSection title="The application">
        <p>
          Folio is a working full-stack project: a public site, email and password accounts, and a
          personal workspace backed by PostgreSQL. It is built with Next.js, React, TypeScript,
          Tailwind CSS, Radix, and Prisma. Discovery queries Crossref and OpenAlex.
        </p>
        <p>
          Authentication uses database-backed accounts, bcrypt password hashing, HTTP-only session
          cookies, and email verification. You can create an account at{" "}
          <Link href="/signup">/signup</Link> and work in your own workspace.
        </p>
      </ProseSection>

      <ProseSection title="What it is not">
        <p>
          Folio is a capstone project. There are no testimonials, customer logos, university
          partnerships, or made-up statistics on this site.
        </p>
        <p>
          The research signals page shows where the papers you have saved look thin on a topic. It
          labels those readings as possible openings, not verified gaps, because a lack of saved
          papers does not prove that nothing exists.
        </p>
      </ProseSection>
    </MarketingPage>
  );
}

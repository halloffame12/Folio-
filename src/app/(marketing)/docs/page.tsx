import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MarketingPage, ProseSection } from "@/components/marketing/marketing-page";
import { openGraphImage } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "How to use the Folio demonstration: sign in, explore discovery, organise your library, write notes, run a literature review, format citations, and understand local data storage.",
  alternates: { canonical: "/docs" },
  openGraph: {
    title: "Folio documentation",
    description: "A working guide to the Folio research workspace demonstration.",
    url: "/docs",
    type: "article",
    images: [openGraphImage],
  },
};

const sections = [
  { id: "getting-started", label: "Getting started" },
  { id: "workspace", label: "The workspace" },
  { id: "discovery", label: "Discovery" },
  { id: "library", label: "Library & collections" },
  { id: "notes", label: "Research notes" },
  { id: "projects", label: "Projects & tasks" },
  { id: "literature", label: "Literature reviews" },
  { id: "citations", label: "Citations" },
  { id: "signals", label: "Research signals" },
  { id: "data", label: "Data & storage" },
  { id: "accessibility", label: "Accessibility" },
];

export default function DocsPage() {
  return (
    <MarketingPage
      index="03"
      label="Documentation"
      title={
        <>
          A working guide to the{" "}
          <span className="font-serif font-normal italic text-primary">demonstration</span>.
        </>
      }
      lede="Everything below describes behaviour that exists in this build. Where a feature is mocked, planned, or unavailable, the guide says so directly."
      meta="Last reviewed · November 2026"
      aside={
        <nav aria-label="On this page">
          <p className="eyebrow">On this page</p>
          <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5 lg:flex-col lg:gap-y-1.5">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-[10.5px] leading-snug text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      }
    >
      <ProseSection id="getting-started" title="Getting started">
        <p>
          The fastest way to see the product is the preloaded workspace at{" "}
          <Link href="/dashboard">/dashboard</Link>. It contains twenty scholarly records, a library
          of sixteen saved papers, five collections, nine notes, six projects, and two literature
          reviews. All of it is fictional demonstration data.
        </p>
        <p>
          To see the authentication screens, open <Link href="/signin">/signin</Link>. The
          demonstration account is prefilled by the “Use demo” button. Creating an account at{" "}
          <Link href="/signup">/signup</Link> stores the new record in this browser only and leads to
          a simulated email-verification screen.
        </p>
      </ProseSection>

      <ProseSection id="workspace" title="The workspace">
        <p>
          The sidebar groups the workspace into research areas: overview, discovery, library,
          collections, notes, projects, literature reviews, gap explorer, tasks, milestones,
          citations, and activity. The header carries breadcrumbs, a command palette, notifications,
          the theme toggle, and the account menu.
        </p>
        <p>
          Press <kbd className="rounded border border-border bg-surface px-1 py-0.5 font-mono text-[10px]">⌘K</kbd>{" "}
          or <kbd className="rounded border border-border bg-surface px-1 py-0.5 font-mono text-[10px]">Ctrl K</kbd>{" "}
          to open the command palette. It searches pages, papers, and actions in the local
          workspace.
        </p>
      </ProseSection>

      <ProseSection id="discovery" title="Discovery">
        <p>
          Discovery searches the demonstration catalogue by title, author, abstract, venue, and
          keyword. Filters cover publication type, publication year, and open access. Each result
          shows its authors, venue, year, citation count, and keywords, with actions to open the
          record or save it to the library.
        </p>
        <p>
          Saving a paper adds a library entry with an unread status and a reading progress of zero.
          The record and the library entry remain connected: status, tags, and notes taken later
          appear on both surfaces.
        </p>
      </ProseSection>

      <ProseSection id="library" title="Library & collections">
        <p>
          The library lists saved papers with reading status, progress, tags, and collection
          membership. Use the status tabs to filter unread, reading, or completed work. Collections
          group papers around a theme or project and appear in the sidebar when opened.
        </p>
        <p>
          Reading progress is a manual field in this demonstration. It is not inferred from
          scrolling or time spent.
        </p>
      </ProseSection>

      <ProseSection id="notes" title="Research notes">
        <p>
          Notes are written in a lightweight editor with paragraph, heading, list, and quote
          formatting. Each note can be linked to one or more papers and tagged for retrieval. The
          note list supports search, and the editor saves changes to the local workspace state.
        </p>
        <p>
          Notes are plain demo content, not a synchronised document. There is no collaborative
          editing, version history, or server-side backup.
        </p>
      </ProseSection>

      <ProseSection id="projects" title="Projects, tasks & milestones">
        <p>
          A project holds members, a description, a deadline, and a progress value. Tasks belong to
          a project and carry an owner, priority, due date, status, and optional linked papers.
          Milestones track a larger checkpoint with its own progress and assignees.
        </p>
        <p>
          Status changes and task updates are stored locally. Because the members are fictional,
          notifications about their activity are also part of the demonstration.
        </p>
      </ProseSection>

      <ProseSection id="literature" title="Literature reviews">
        <p>
          A review has a title, research question, method, findings, and an ordered set of sections.
          Each section can reference the papers that support it. Progress reflects the drafting
          state of the review in the demonstration.
        </p>
        <p>
          The review does not generate prose. It provides a structure in which you write, with
          evidence kept beside the argument.
        </p>
      </ProseSection>

      <ProseSection id="citations" title="Citations">
        <p>
          Select a paper to format it in APA 7, MLA 9, IEEE, or Chicago 17th edition. Formatting uses
          the stored metadata: authors, year, title, venue, volume, issue, pages, publisher, and DOI.
          Copy the result into your manuscript.
        </p>
        <p>
          Styles are implemented across the four formats the demonstration claims. Unusual source
          types may need manual adjustment; the generator does not claim complete style-manual
          coverage.
        </p>
      </ProseSection>

      <ProseSection id="signals" title="Research signals & the gap explorer">
        <p>
          The gap explorer visualises topic output, recent activity, and momentum from the
          demonstration index. Selecting a topic shows the papers behind the count and a short
          interpretation.
        </p>
        <p>
          These readings are labelled{" "}
          <strong className="font-semibold text-foreground">potential opportunities</strong>, not
          verified gaps. Thin output can reflect funding, ethics, method, language, or deliberate
          exclusion. The interface states this limit in the product, not only in the documentation.
        </p>
      </ProseSection>

      <ProseSection id="data" title="Data & storage">
        <p>
          Workspace state is stored in this browser. Theme preference, demo accounts, and the mock
          session use local or session storage depending on the “keep me signed in” choice. There is
          no server, database, or analytics pipeline in this build.
        </p>
        <p>
          Clearing site data for this origin resets the workspace to its shipped demonstration
          state. Created accounts are removed with it. Do not enter sensitive or unpublished
          material.
        </p>
      </ProseSection>

      <ProseSection id="accessibility" title="Accessibility">
        <p>
          The site uses semantic landmarks, a skip link, visible focus styles, labelled form
          controls, inline validation messages, and an accordion with proper expanded-state
          attributes. Motion is restrained and respects the operating system&apos;s reduced-motion
          setting; the workspace also provides a reduced-motion preference.
        </p>
        <p>
          The interface is designed to work without horizontal scrolling from small phone widths
          upward. If you encounter a barrier, the help page lists the known limits of the
          demonstration.
        </p>
      </ProseSection>

      <p className="border-t border-border pt-5 text-[11px] text-muted-foreground">
        Still looking for something?{" "}
        <Link href="/help" className="font-medium text-primary underline-offset-4 hover:underline">
          Visit the help center <ArrowUpRight className="inline size-3" aria-hidden />
        </Link>
      </p>
    </MarketingPage>
  );
}

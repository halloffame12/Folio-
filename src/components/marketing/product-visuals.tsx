import type { ReactNode } from "react";
import { FileText, Library } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import {
  library,
  literatureReviews,
  notes,
  papersById,
} from "@/mocks/data";
import { cn } from "@/lib/utils";

function Window({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-border bg-card", className)}>
      {children}
    </div>
  );
}

function WindowBar({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border bg-secondary/40 px-4 py-2.5">
      <span className="flex min-w-0 items-center gap-2">
        <LogoMark className="size-4" />
        <span className="truncate text-[12.5px] font-medium text-foreground">{title}</span>
      </span>
      {meta ? <span className="shrink-0 text-[12px] text-muted-foreground">{meta}</span> : null}
    </div>
  );
}

function Status({ status }: { status: string }) {
  const tone =
    status === "completed"
      ? "text-success"
      : status === "reading"
        ? "text-warning"
        : "text-muted-foreground";
  return (
    <span className={cn("shrink-0 text-[12px] capitalize", tone)}>{status}</span>
  );
}

function authorsFor(paperId: string) {
  const paper = papersById[paperId];
  if (!paper) return "";
  const names = paper.authors.slice(0, 2).map((author) => author.name);
  return paper.authors.length > 2 ? `${names.join(", ")} et al.` : names.join(", ");
}

export function LibraryVisual({ className }: { className?: string }) {
  const entries = ["p1", "p2", "p4", "p7"]
    .map((id) => library.find((entry) => entry.paperId === id))
    .filter(Boolean);

  return (
    <Window className={className}>
      <WindowBar title="My library" meta="16 papers" />

      <div className="flex gap-5 border-b border-border px-4">
        {["All papers", "Reading", "Completed", "Unread"].map((tab, index) => (
          <span
            key={tab}
            className={cn(
              "border-b-2 py-2.5 text-[12.5px]",
              index === 0
                ? "border-foreground font-medium text-foreground"
                : "border-transparent text-muted-foreground"
            )}
          >
            {tab}
          </span>
        ))}
      </div>

      <ul className="divide-y divide-border">
        {entries.map((entry) => {
          if (!entry) return null;
          const paper = papersById[entry.paperId];
          if (!paper) return null;
          return (
            <li key={entry.id} className="flex items-start gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 font-serif text-[14px] leading-snug text-foreground">
                  {paper.title}
                </p>
                <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                  {authorsFor(paper.id)} · {paper.venueShort} · {paper.year}
                </p>
              </div>
              <Status status={entry.status} />
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-[12px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Library className="size-3.5" aria-hidden />
          5 collections
        </span>
        <span>Updated today</span>
      </div>
    </Window>
  );
}

export function NotesVisual({ className }: { className?: string }) {
  const note = notes[0];
  const linked = note?.paperIds.map((id) => papersById[id]).filter(Boolean) ?? [];

  return (
    <Window className={className}>
      <WindowBar title="Reading note" meta="Saved" />

      <div className="px-4 py-4 sm:px-5">
        <h3 className="font-serif text-[19px] leading-snug text-foreground">
          {note?.title ?? "Reading memo"}
        </h3>
        <p className="mt-1 text-[12px] text-muted-foreground">
          {note?.tags.slice(0, 2).join(" · ")}
        </p>

        <div className="mt-4 space-y-2.5 border-t border-border pt-4 text-[13px] leading-[1.7] text-foreground/85">
          <p>
            Fischer et al. describe four modes of negotiation: delegation,
            verification, translation, and refusal. Refusal is treated as a design
            resource rather than a failure of adoption.
          </p>
          <blockquote className="border-l-2 border-border pl-3 font-serif text-[14px] italic text-muted-foreground">
            Trust is produced through small, often invisible acts of checking.
          </blockquote>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
          {linked.slice(0, 2).map((paper) => (
            <span
              key={paper.id}
              className="inline-flex max-w-full items-center gap-1 rounded border border-border bg-background px-2 py-1 text-[11.5px] text-muted-foreground"
            >
              <FileText className="size-3 shrink-0" aria-hidden />
              <span className="truncate">{paper.authors[0]?.name}</span>
            </span>
          ))}
        </div>
      </div>
    </Window>
  );
}

export function ReviewVisual({ className }: { className?: string }) {
  const review = literatureReviews[0];
  const sections = review?.sections.slice(0, 5) ?? [];
  const evidence = ["p1", "p11", "p18"].map((id) => papersById[id]).filter(Boolean);

  return (
    <Window className={className}>
      <WindowBar title="Literature review" meta={`${review?.progress ?? 64}% drafted`} />

      <div className="grid grid-cols-1 sm:grid-cols-[160px_minmax(0,1fr)]">
        <div className="border-b border-border bg-secondary/30 p-3 sm:border-b-0 sm:border-r">
          <p className="truncate font-serif text-[13px] text-foreground">
            {review?.title}
          </p>
          <ul className="mt-2 space-y-0.5">
            {sections.map((section, index) => (
              <li
                key={section.id}
                className={cn(
                  "truncate rounded px-1.5 py-1 text-[12px]",
                  index === 3
                    ? "bg-card font-medium text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {section.title}
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0 p-3 sm:p-4">
          <h3 className="font-serif text-[15px] text-foreground">4. Findings</h3>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            3 linked papers · updated today
          </p>
          <div className="mt-2 space-y-1.5 text-[12px] leading-[1.7] text-foreground/80">
            <p>
              Across the included studies, four assistance patterns recur:
              orientation, condensation, comparison, and composition.
            </p>
            <p>
              The most frequently documented risk is fabricated or distorted
              citation.
            </p>
          </div>

          <div className="mt-3 border-t border-border pt-2">
            <p className="text-[11.5px] font-medium text-foreground">Linked papers</p>
            <ul className="mt-1.5 space-y-1.5">
              {evidence.map((paper) => (
                <li key={paper.id} className="flex items-start gap-1.5">
                  <FileText className="mt-0.5 size-3 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="min-w-0">
                    <span className="block truncate text-[11.5px] text-foreground">
                      {paper.title}
                    </span>
                    <span className="text-[10.5px] text-muted-foreground">
                      {paper.authors[0]?.name} · {paper.year}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Window>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  CircleHelp,
  Database,
  KeyRound,
  Mail,
  MonitorSmartphone,
  Palette,
  RotateCcw,
} from "lucide-react";
import { MarketingPage, ProseSection } from "@/components/marketing/marketing-page";
import { openGraphImage } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Help center",
  description:
    "Answers to common questions about the Folio demonstration: demo access, accounts, verification, resetting local data, themes, and browser support.",
  alternates: { canonical: "/help" },
  openGraph: {
    title: "Folio help center",
    description: "Practical answers for the Folio research workspace demonstration.",
    url: "/help",
    type: "article",
    images: [openGraphImage],
  },
};

const topics = [
  {
    icon: KeyRound,
    title: "Getting into the demo",
    body: "Open /dashboard directly — no account is needed. To see the sign-in state, use the demonstration credentials shown on the sign-in page.",
    href: "/signin",
    link: "Open sign in",
  },
  {
    icon: Mail,
    title: "Verification states",
    body: "The verification screen can display pending, verified, and expired-link states. Use the demo state buttons to move between them. No email is sent.",
    href: "/verify-email",
    link: "Open verification",
  },
  {
    icon: RotateCcw,
    title: "Reset a forgotten password",
    body: "The reset flow validates the email and shows the confirmation a connected build would display. It does not send a message or change a password.",
    href: "/forgot-password",
    link: "Open reset flow",
  },
  {
    icon: Database,
    title: "Clear local demonstration data",
    body: "Workspace state and demo accounts live in this browser. Clear site data for this origin to restore the shipped demonstration state.",
    href: "/docs#data",
    link: "Read about storage",
  },
  {
    icon: Palette,
    title: "Switch theme",
    body: "The sun and moon control in the navigation switches between the light and dark themes. The choice is remembered for this browser.",
    href: "/docs#accessibility",
    link: "Accessibility notes",
  },
  {
    icon: MonitorSmartphone,
    title: "Browser support",
    body: "The demonstration targets current versions of Chrome, Edge, Firefox, and Safari. It is responsive from small phone widths upward.",
    href: "/docs",
    link: "Read documentation",
  },
];

export default function HelpPage() {
  return (
    <MarketingPage
      index="04"
      label="Help center"
      title={
        <>
          Practical answers for the{" "}
          <span className="font-serif font-normal italic text-primary">demonstration</span>.
        </>
      }
      lede="This build has no staffed support desk, so the help center is deliberately self-service. If an answer is not here, the documentation covers each workspace surface in more detail."
      meta="Frontend demonstration · No support desk"
      aside={
        <div className="flex flex-wrap gap-2 lg:flex-col lg:items-start">
          <Link
            href="/docs"
            className="inline-flex items-center gap-1 rounded border border-border bg-card px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.13em] text-foreground/75 transition-colors hover:border-primary/30 hover:text-primary"
          >
            Documentation <ArrowUpRight className="size-2.5" aria-hidden />
          </Link>
          <Link
            href="/#faq"
            className="inline-flex items-center gap-1 rounded border border-border bg-card px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.13em] text-foreground/75 transition-colors hover:border-primary/30 hover:text-primary"
          >
            Read the FAQ <ArrowUpRight className="size-2.5" aria-hidden />
          </Link>
        </div>
      }
    >
      <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2">
        {topics.map((topic) => {
          const Icon = topic.icon;
          return (
            <article key={topic.title} className="flex h-full flex-col bg-card p-5">
              <span className="flex size-8 items-center justify-center rounded-[3px] border border-border bg-background text-primary">
                <Icon className="size-4" aria-hidden />
              </span>
              <h2 className="mt-3.5 font-display text-[14.5px] font-semibold tracking-[-0.015em]">
                {topic.title}
              </h2>
              <p className="mt-1.5 flex-1 text-[11.5px] leading-relaxed text-muted-foreground">
                {topic.body}
              </p>
              <Link
                href={topic.href}
                className="mt-4 inline-flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.13em] text-primary transition-colors hover:text-primary/75"
              >
                {topic.link} <ArrowUpRight className="size-2.5" aria-hidden />
              </Link>
            </article>
          );
        })}
      </div>

      <ProseSection title="Why can't I sign in with a new account?">
        <p>
          Accounts created through the sign-up form only exist in the browser where they were
          created. If you clear site data, use a different browser, or open a private window, the
          account will not be found. The demonstration account always works.
        </p>
        <p>
          The email <strong className="font-semibold text-foreground">mira.srinivasan@northbridge.edu</strong>{" "}
          is reserved for the demo and cannot be used to register a second account.
        </p>
      </ProseSection>

      <ProseSection title="Why does the app say it is a demonstration?">
        <p>
          Because it is one. Labels are shown wherever a real product would imply a server, a live
          integration, or a security guarantee. Those labels are not legal boilerplate; they mark the
          boundary between interface demonstration and production service.
        </p>
      </ProseSection>

      <ProseSection title="Something looks broken. What now?">
        <p>
          First, reload the page. If the workspace appears empty, clear the site data and reload to
          restore the seeded demonstration state. If a page still fails, the error boundary offers a
          reset; the demonstration does not report errors to a remote service.
        </p>
        <p className="flex items-start gap-2 rounded border border-dashed border-border bg-surface/40 p-3.5 text-[11.5px]">
          <CircleHelp className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span>
            There is no monitored inbox or support queue for this project. The help page is the
            complete support surface.
          </span>
        </p>
      </ProseSection>
    </MarketingPage>
  );
}

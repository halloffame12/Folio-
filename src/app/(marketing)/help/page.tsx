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
    "Answers to common questions about Folio: creating an account, email verification, password reset, data storage, themes, and browser support.",
  alternates: { canonical: "/help" },
  openGraph: {
    title: "Folio help center",
    description: "Practical answers for the Folio research workspace.",
    url: "/help",
    type: "article",
    images: [openGraphImage],
  },
};

const topics = [
  {
    icon: KeyRound,
    title: "Create an account",
    body: "Sign up with your name, email, and a password. Folio sends a verification email; once the address is confirmed, you can sign in to your own workspace.",
    href: "/signup",
    link: "Create an account",
  },
  {
    icon: Mail,
    title: "Email verification",
    body: "Registration sends a verification link. If it has expired, request a new one from the verification page. Check your spam folder if it does not arrive.",
    href: "/verify-email",
    link: "Open verification",
  },
  {
    icon: RotateCcw,
    title: "Reset a forgotten password",
    body: "Enter your email on the reset page. If an account exists, Folio sends a reset link. The confirmation does not reveal whether an address is registered.",
    href: "/forgot-password",
    link: "Open reset flow",
  },
  {
    icon: Database,
    title: "Where your data lives",
    body: "Records are stored in PostgreSQL and isolated by account. Clearing site data resets local preferences such as the theme, not the research held in your account.",
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
    body: "Folio targets current versions of Chrome, Edge, Firefox, and Safari. It is responsive from small phone widths upward.",
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
          <span className="font-serif font-normal italic text-primary">research workspace</span>.
        </>
      }
      lede="The help center is self-service. If an answer is not here, the documentation covers each workspace surface in more detail."
      meta="Self-service support · Last reviewed November 2026"
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

      <ProseSection title="Why can't I sign in after registering?">
        <p>
          Registration does not sign you in until the email address is verified. Open the
          verification link sent to your inbox, then return to sign in. If the link has expired,
          request a new one.
        </p>
        <p>
          Make sure you are using the same email address and password that you registered with.
          Password reset is available from the sign-in screen.
        </p>
      </ProseSection>

      <ProseSection title="Who can see my workspace?">
        <p>
          A workspace belongs to one account. Library records, notes, reviews, and projects are
          returned only for the authenticated user; other accounts cannot browse them. Projects you
          create can include invited members, who then see the material attached to that project.
        </p>
      </ProseSection>

      <ProseSection title="Something looks broken. What now?">
        <p>
          First, reload the page. If a page still fails, the error boundary offers a reset. Check
          that you are signed in and that your connection can reach the application.
        </p>
        <p className="flex items-start gap-2 rounded border border-dashed border-border bg-surface/40 p-3.5 text-[11.5px]">
          <CircleHelp className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span>
            There is no monitored inbox or support queue for this project. The help page and
            documentation are the support surface.
          </span>
        </p>
      </ProseSection>
    </MarketingPage>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
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
    "Answers to common questions about accounts, email verification, password reset, data storage, themes, and browser support.",
  alternates: { canonical: "/help" },
  openGraph: {
    title: "Folio help center",
    description: "Practical answers about the Folio workspace.",
    url: "/help",
    type: "article",
    images: [openGraphImage],
  },
};

const topics = [
  {
    icon: KeyRound,
    title: "Create an account",
    body: "Sign up with your name, email, and a password. Folio sends a verification email. Once the address is confirmed, you can sign in.",
    href: "/signup",
    link: "Create an account",
  },
  {
    icon: Mail,
    title: "Email verification",
    body: "Registration sends a verification link. If it has expired, request another from the verification page. Check your spam folder if it does not arrive.",
    href: "/verify-email",
    link: "Open verification",
  },
  {
    icon: RotateCcw,
    title: "Reset a forgotten password",
    body: "Enter your email on the reset page. If an account exists, Folio sends a reset link. The confirmation does not reveal whether an address is registered.",
    href: "/forgot-password",
    link: "Reset password",
  },
  {
    icon: Database,
    title: "Where your data lives",
    body: "Records are stored in PostgreSQL and kept separate by account. Clearing site data resets local preferences such as the theme, not the research in your account.",
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
    body: "Folio targets current versions of Chrome, Edge, Firefox, and Safari, and works from small phone widths upward.",
    href: "/docs",
    link: "Read the documentation",
  },
];

export default function HelpPage() {
  return (
    <MarketingPage
      label="Help center"
      title="Common questions"
      lede="Short answers to the things people ask most. The documentation covers each part of the workspace in more detail."
      meta="Last reviewed November 2026"
      aside={
        <div className="space-y-3">
          <p className="text-[13px] font-medium text-foreground">More help</p>
          <div className="flex flex-col gap-2">
            <Link
              href="/docs"
              className="inline-flex items-center gap-1.5 text-[13.5px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Documentation <ArrowRight className="size-3.5" aria-hidden />
            </Link>
            <Link
              href="/#faq"
              className="inline-flex items-center gap-1.5 text-[13.5px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Read the FAQ <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {topics.map((topic) => {
          const Icon = topic.icon;
          return (
            <article key={topic.title} className="flex h-full flex-col rounded-lg border border-border bg-card p-5">
              <Icon className="size-5 text-muted-foreground" aria-hidden />
              <h2 className="mt-3 text-[15px] font-medium text-foreground">{topic.title}</h2>
              <p className="mt-1.5 flex-1 text-[13.5px] leading-relaxed text-muted-foreground">
                {topic.body}
              </p>
              <Link
                href={topic.href}
                className="mt-4 inline-flex items-center gap-1 text-[13px] text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
              >
                {topic.link} <ArrowRight className="size-3" aria-hidden />
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
          returned only for the signed-in user, and other accounts cannot browse them. Projects you
          create can include invited members, who then see the material attached to that project.
        </p>
      </ProseSection>

      <ProseSection title="Something looks broken. What now?">
        <p>
          First, reload the page. If a page still fails, the error boundary offers a reset. Check
          that you are signed in and that your connection can reach the application.
        </p>
        <p className="flex items-start gap-2 rounded-md border border-border p-4 text-[13px]">
          <CircleHelp className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span>
            There is no monitored inbox or support queue for this project. This help page and the
            documentation are the only support.
          </span>
        </p>
      </ProseSection>
    </MarketingPage>
  );
}

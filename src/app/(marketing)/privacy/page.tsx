import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage, ProseSection } from "@/components/marketing/marketing-page";

export const metadata: Metadata = {
  title: "Privacy notice",
  description:
    "How Folio handles account data, workspace records, session cookies, and transactional email. No analytics, advertising, or third-party trackers.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

const storedItems = [
  {
    key: "folio_session",
    kind: "Cookie · HTTP-only",
    purpose:
      "Keeps you signed in. Expires after one day, or thirty days if you choose “keep me signed in”. Cleared when you sign out.",
  },
  {
    key: "theme",
    kind: "localStorage",
    purpose: "Remembers whether you prefer the light or dark interface.",
  },
];

export default function PrivacyPage() {
  return (
    <MarketingPage
      index="05"
      label="Privacy notice"
      title={
        <>
          What Folio{" "}
          <span className="font-serif font-normal italic text-primary">does</span> with data.
        </>
      }
      lede="Folio is a working research workspace with real accounts and a PostgreSQL database. This notice describes what the application stores, where it is stored, and what it does not do."
      meta="Last updated · November 13, 2026"
    >
      <ProseSection title="Scope">
        <p>
          This notice covers the public website, account creation and sign-in, and the research
          workspace. Folio is a capstone project, not a commercial service, and this notice is not
          legal advice.
        </p>
      </ProseSection>

      <ProseSection title="What we collect">
        <p>
          Creating an account stores your name, email address, and password hash. You may also
          provide an institution, an academic role, and research interests. Workspace content that
          you create — saved papers, collections, notes, projects, tasks, milestones, literature
          reviews, and notifications — belongs to your account.
        </p>
        <p>
          Transactional emails are sent to the address on your account for verification and password
          reset. Folio does not send marketing email.
        </p>
      </ProseSection>

      <ProseSection title="Where data is stored">
        <p>
          Account and workspace records are stored in PostgreSQL, hosted on Neon. Passwords are
          hashed with bcrypt; the plain password is never stored. Application sessions are held in
          the database and referenced by an HTTP-only cookie.
        </p>
        <div className="mt-3 overflow-hidden rounded border border-border">
          <table className="w-full border-collapse text-left text-[11px]">
            <caption className="sr-only">Browser-side storage used by Folio</caption>
            <thead>
              <tr className="border-b border-border bg-surface/60">
                <th scope="col" className="px-3 py-2 font-mono text-[8px] uppercase tracking-[0.12em] text-muted-foreground">
                  Name
                </th>
                <th scope="col" className="px-3 py-2 font-mono text-[8px] uppercase tracking-[0.12em] text-muted-foreground">
                  Type
                </th>
                <th scope="col" className="px-3 py-2 font-mono text-[8px] uppercase tracking-[0.12em] text-muted-foreground">
                  Purpose
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {storedItems.map((item) => (
                <tr key={item.key}>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-[9.5px] text-foreground/80">
                    {item.key}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{item.kind}</td>
                  <td className="px-3 py-2 text-muted-foreground">{item.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ProseSection>

      <ProseSection title="Scholarly metadata">
        <p>
          Discovery sends your search terms to Crossref and OpenAlex and displays the metadata those
          services return. Their handling of requests is governed by their own policies. Folio stores
          the records you choose to save; it does not mirror the full external index.
        </p>
      </ProseSection>

      <ProseSection title="Email delivery">
        <p>
          Verification and reset messages are delivered through a transactional email provider
          (Resend) when it is configured for the deployment. The provider receives the recipient
          address and the message content needed to deliver that email.
        </p>
      </ProseSection>

      <ProseSection title="What is not collected">
        <p>
          There are no analytics scripts, advertising pixels, session recordings, third-party
          trackers, or data sales. Fonts are bundled at build time rather than fetched from a
          third-party font service in the browser. The application does not build advertising
          profiles or share workspace content between accounts.
        </p>
      </ProseSection>

      <ProseSection title="Your choices">
        <p>
          You can sign out at any time, which revokes the session on that browser. Clearing site
          data removes your theme preference; it does not delete records held in your account.
          Password reset is available from the sign-in screen.
        </p>
        <p>
          Self-service account deletion is not available in this build. Do not create an account with
          material you would need removed on short notice.
        </p>
      </ProseSection>

      <ProseSection title="Sensitive material">
        <p>
          The workspace is a capstone project, not a certified secure repository. Please do not store
          confidential, personal, or unpublished research material, or information that creates a
          legal or ethical obligation the project cannot meet.
        </p>
      </ProseSection>

      <ProseSection title="Changes">
        <p>
          If the project adds new integrations, storage locations, or account controls, this notice
          will be updated before those features are used.
        </p>
        <p>
          For related terms, see the <Link href="/terms">terms of use</Link>. For practical questions
          about your data, see the <Link href="/docs#data">documentation</Link>.
        </p>
      </ProseSection>
    </MarketingPage>
  );
}

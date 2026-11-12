import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage, ProseSection } from "@/components/marketing/marketing-page";

export const metadata: Metadata = {
  title: "Privacy notice",
  description:
    "How the Folio frontend demonstration handles data: browser-local storage, simulated authentication, and no server collection.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

const storageKeys = [
  { key: "folio-theme", purpose: "Remembers your light or dark theme choice." },
  { key: "folio-workspace-v1", purpose: "Stores the demonstration workspace state, including reading progress, notes, tasks, and settings." },
  { key: "folio-demo-accounts-v1", purpose: "Stores accounts created in this browser, including a salted password digest rather than the password itself." },
  { key: "folio-demo-session-v1", purpose: "Stores the simulated session in local or session storage, depending on the “keep me signed in” choice." },
];

export default function PrivacyPage() {
  return (
    <MarketingPage
      index="05"
      label="Privacy notice"
      title={
        <>
          What this demonstration{" "}
          <span className="font-serif font-normal italic text-primary">does</span> with data.
        </>
      }
      lede="Folio is a frontend demonstration. It has no server, no analytics, and no account system that leaves this browser. This notice describes exactly what is stored and why."
      meta="Last updated · November 12, 2026"
    >
      <ProseSection title="Scope">
        <p>
          This notice covers the marketing site, authentication screens, and research workspace in
          this build. It is written for a demonstration, not for a commercial service, and it is not
          legal advice.
        </p>
      </ProseSection>

      <ProseSection title="What is stored in your browser">
        <p>
          The demonstration keeps a small amount of information in local or session storage so the
          interface behaves consistently between visits. The keys currently used are:
        </p>
        <div className="mt-3 overflow-hidden rounded border border-border">
          <table className="w-full border-collapse text-left text-[11px]">
            <caption className="sr-only">Browser storage keys used by the demonstration</caption>
            <thead>
              <tr className="border-b border-border bg-surface/60">
                <th scope="col" className="px-3 py-2 font-mono text-[8px] uppercase tracking-[0.12em] text-muted-foreground">
                  Key
                </th>
                <th scope="col" className="px-3 py-2 font-mono text-[8px] uppercase tracking-[0.12em] text-muted-foreground">
                  Purpose
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {storageKeys.map((item) => (
                <tr key={item.key}>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-[9.5px] text-foreground/80">
                    {item.key}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{item.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ProseSection>

      <ProseSection title="Account information">
        <p>
          If you create an account in the demonstration, the form collects your name, email,
          optional institution, optional academic role, and optional research interests. That record
          is stored only in this browser. A salted SHA-256 digest of the password is kept so the mock
          sign-in can compare it; the password itself is not stored in plain text. This is a
          demonstration measure, not a production security model.
        </p>
        <p>
          The reserved demonstration account is built into the application and uses published
          demonstration credentials. Do not reuse a real password anywhere in this build.
        </p>
      </ProseSection>

      <ProseSection title="What is not collected">
        <p>
          There are no analytics scripts, advertising pixels, session recordings, error-reporting
          services, or third-party trackers. The project does not operate a backend that receives
          form submissions. Fonts are bundled at build time rather than fetched from a third-party
          font service at runtime.
        </p>
      </ProseSection>

      <ProseSection title="Simulated email">
        <p>
          Registration, verification, and password reset show the interface states that a connected
          build would produce. No email is sent, and no address is transmitted. Messages that appear
          to describe an email are part of the demonstration copy.
        </p>
      </ProseSection>

      <ProseSection title="Your choices">
        <p>
          You can remove everything the demonstration has stored by clearing site data for this
          origin in your browser settings. This resets the workspace to its seeded state and removes
          any accounts created locally. You can also sign out from the workspace account menu, which
          clears the simulated session.
        </p>
        <p>
          Because no data reaches a server, there is no remote copy to request, export, or delete.
        </p>
      </ProseSection>

      <ProseSection title="Sensitive material">
        <p>
          The demonstration workspace is not a secure repository. Please do not enter confidential,
          personal, or unpublished research material. All seeded papers, authors, institutions, and
          projects are fictional.
        </p>
      </ProseSection>

      <ProseSection title="Changes">
        <p>
          If this project later adds a backend or real integrations, this notice would need to
          change before those features are used. This version describes only the current
          browser-local build.
        </p>
        <p>
          For related terms, see the <Link href="/terms">terms of use</Link>. For practical questions
          about local data, see the <Link href="/docs#data">documentation</Link>.
        </p>
      </ProseSection>
    </MarketingPage>
  );
}

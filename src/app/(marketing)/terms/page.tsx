import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage, ProseSection } from "@/components/marketing/marketing-page";

export const metadata: Metadata = {
  title: "Terms of use",
  description:
    "Terms for using the Folio frontend demonstration, including its scope, limitations, mock data, and acceptable use.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <MarketingPage
      index="06"
      label="Terms of use"
      title={
        <>
          The terms of a{" "}
          <span className="font-serif font-normal italic text-primary">demonstration</span>.
        </>
      }
      lede="Folio is a capstone project and frontend demonstration, provided for evaluation and portfolio purposes. These terms describe the limits of that use."
      meta="Last updated · November 12, 2026"
    >
      <ProseSection title="1. What this service is">
        <p>
          This build demonstrates a user interface for academic research work. It includes a public
          website, simulated authentication screens, and a workspace populated with fictional data.
          It is not a commercial product, a hosted service, or an institutionally endorsed system.
        </p>
        <p>
          References to features, workflows, or future integrations describe the design of the
          demonstration. They are not a commitment to deliver a production service.
        </p>
      </ProseSection>

      <ProseSection title="2. Demonstration data">
        <p>
          Papers, authors, institutions, projects, notes, tasks, and reviews displayed in the
          workspace are fictional. They were created to exercise the interface. They should not be
          cited as scholarship, treated as real records, or used as evidence about real people or
          organisations.
        </p>
        <p>
          Any DOI-like identifiers, venues, or names are part of the mock dataset. Verify nothing
          from this build against a real bibliographic source without independent checking.
        </p>
      </ProseSection>

      <ProseSection title="3. Accounts and local storage">
        <p>
          Accounts created here are stored in your browser only. They are not portable between
          devices or browsers, and they can be removed by clearing site data. The simulated session
          is not a production authentication mechanism and must not be relied on to protect
          information.
        </p>
        <p>
          Do not enter sensitive, confidential, personal, or unpublished material. The demonstration
          is not designed to hold it.
        </p>
      </ProseSection>

      <ProseSection title="4. Acceptable use">
        <p>You agree not to:</p>
        <ul>
          <li>present the demonstration as a live commercial or institutional service;</li>
          <li>represent fictional data, accounts, or capabilities as real;</li>
          <li>use the project to mislead others about research evidence or scholarly records;</li>
          <li>attempt to disrupt the site or another person&apos;s use of it.</li>
        </ul>
      </ProseSection>

      <ProseSection title="5. No warranty">
        <p>
          The demonstration is provided “as is”, without warranties of any kind, express or implied,
          including fitness for a particular purpose or non-infringement. Interface behaviour,
          storage, and content may change or fail without notice.
        </p>
        <p>
          To the extent permitted by applicable law, the project author is not liable for loss or
          damage arising from use of the demonstration, including reliance on mock records or on
          simulated authentication.
        </p>
      </ProseSection>

      <ProseSection title="6. Intellectual property">
        <p>
          The Folio name, interface design, brand mark, and original written and visual content in
          this project were created for a capstone project. Third-party libraries remain under their
          respective licences. You may view and evaluate the demonstration; you may not present it
          as your own commercial product.
        </p>
      </ProseSection>

      <ProseSection title="7. Availability and changes">
        <p>
          There is no service-level commitment. The site may be unavailable during development, and
          features described in the marketing pages may be shown only as interface states. These
          terms may be revised as the project changes; the date above indicates the current version.
        </p>
      </ProseSection>

      <ProseSection title="8. Related pages">
        <p>
          See the <Link href="/privacy">privacy notice</Link> for what is stored in your browser, and
          the <Link href="/docs">documentation</Link> for how the demonstration behaves. For the
          project&apos;s rationale, read <Link href="/about">about Folio</Link>.
        </p>
      </ProseSection>
    </MarketingPage>
  );
}

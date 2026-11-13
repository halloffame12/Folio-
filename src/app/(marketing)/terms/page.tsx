import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage, ProseSection } from "@/components/marketing/marketing-page";

export const metadata: Metadata = {
  title: "Terms of use",
  description:
    "Terms for using Folio, a capstone academic research workspace, including accounts, data, acceptable use, availability, and liability.",
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
          <span className="font-serif font-normal italic text-primary">research workspace</span>.
        </>
      }
      lede="Folio is a working academic research workspace built as a capstone project. These terms describe the basis on which it is provided."
      meta="Last updated · November 13, 2026"
    >
      <ProseSection title="1. What this service is">
        <p>
          Folio provides a public website, account authentication, and a personal research
          workspace for discovering papers, organising a library, writing notes, building
          literature reviews, and coordinating projects. It is a capstone project, not a commercial
          service or an institutionally endorsed system.
        </p>
        <p>
          Features and workflows described on the marketing pages reflect the current build. They
          are not a commitment to deliver additional functionality.
        </p>
      </ProseSection>

      <ProseSection title="2. Records and metadata">
        <p>
          Marketing previews use illustrative records and are labelled as such. They are not real
          scholarship. In the workspace, discovery results come from Crossref and OpenAlex; their
          metadata should be checked against the original source before it is cited.
        </p>
        <p>
          Library entries, notes, reviews, and project records that you create belong to your
          account. You are responsible for the accuracy of what you enter and for holding the rights
          needed to store it.
        </p>
      </ProseSection>

      <ProseSection title="3. Accounts and data">
        <p>
          Accounts are stored in a PostgreSQL database and protected by session authentication.
          Access to workspace records is limited to the authenticated account, and to invited
          members where a project is shared. You are responsible for keeping your password secure.
        </p>
        <p>
          Do not enter material you are not permitted to store, or information that would create a
          legal or ethical obligation the project cannot meet.
        </p>
      </ProseSection>

      <ProseSection title="4. Acceptable use">
        <p>You agree not to:</p>
        <ul>
          <li>attempt to access another account or workspace without permission;</li>
          <li>disrupt the site, its database, or another person&apos;s use of it;</li>
          <li>use the project to mislead others about research evidence or scholarly records;</li>
          <li>present the project as an endorsed institutional or commercial service.</li>
        </ul>
      </ProseSection>

      <ProseSection title="5. No warranty">
        <p>
          The service is provided “as is”, without warranties of any kind, express or implied,
          including fitness for a particular purpose or non-infringement. Behaviour, storage, and
          content may change or fail without notice.
        </p>
        <p>
          To the extent permitted by applicable law, the project author is not liable for loss or
          damage arising from use of the service, including reliance on third-party metadata or on
          service interruption.
        </p>
      </ProseSection>

      <ProseSection title="6. Intellectual property">
        <p>
          The Folio name, interface design, brand mark, and original written and visual content in
          this project were created for a capstone project. Third-party libraries remain under their
          respective licences. You may view and evaluate the project; you may not present it
          as your own commercial product.
        </p>
      </ProseSection>

      <ProseSection title="7. Availability and changes">
        <p>
          There is no service-level commitment. The site may be unavailable during development, and
          features described in the marketing pages may change as the project develops. These
          terms may be revised as the project changes; the date above indicates the current version.
        </p>
      </ProseSection>

      <ProseSection title="8. Related pages">
        <p>
          See the <Link href="/privacy">privacy notice</Link> for how account and workspace data are
          handled, and the <Link href="/docs">documentation</Link> for how the product behaves. For
          the project&apos;s rationale, read <Link href="/about">about Folio</Link>.
        </p>
      </ProseSection>
    </MarketingPage>
  );
}

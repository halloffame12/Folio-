import type { Metadata } from "next";
import { SigninForm } from "@/components/auth/signin-form";
import { openGraphImage } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to Folio to continue your papers, notes, literature reviews, and research projects.",
  alternates: { canonical: "/signin" },
  openGraph: {
    title: "Sign in to Folio",
    description: "Continue where your research left off.",
    url: "/signin",
    type: "website",
    images: [openGraphImage],
  },
};

export default function SigninPage() {
  return <SigninForm />;
}

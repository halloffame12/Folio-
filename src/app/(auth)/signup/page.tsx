import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";
import { openGraphImage } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Create your account",
  description:
    "Create a Folio research workspace to organise papers, notes, literature reviews, and collaborative projects.",
  alternates: { canonical: "/signup" },
  openGraph: {
    title: "Create your Folio research workspace",
    description:
      "Bring papers, notes, literature, and research projects together in one considered workspace.",
    url: "/signup",
    type: "website",
    images: [openGraphImage],
  },
};

export default function SignupPage() {
  return <SignupForm />;
}

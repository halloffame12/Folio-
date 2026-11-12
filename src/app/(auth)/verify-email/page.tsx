import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { VerifyEmailPanel } from "@/components/auth/verify-email-panel";

export const metadata: Metadata = {
  title: "Verify your email",
  description: "Confirm the email address attached to your Folio research workspace.",
  alternates: { canonical: "/verify-email" },
  robots: { index: false, follow: false },
};

function VerificationFallback() {
  return (
    <div>
      <Skeleton className="size-11 rounded-full" />
      <Skeleton className="mt-5 h-2.5 w-24" />
      <Skeleton className="mt-4 h-8 w-64" />
      <Skeleton className="mt-4 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-4/5" />
      <Skeleton className="mt-6 h-10 w-full" />
      <Skeleton className="mt-2 h-10 w-full" />
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerificationFallback />}>
      <VerifyEmailPanel />
    </Suspense>
  );
}

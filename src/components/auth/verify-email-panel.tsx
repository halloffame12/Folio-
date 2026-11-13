/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Mail,
  MailCheck,
  RotateCw,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthNotice } from "@/components/auth/auth-notice";
import { apiMutate } from "@/lib/api-client";

type VerificationView = "pending" | "verified" | "expired";

const RESEND_SECONDS = 45;

export function VerifyEmailPanel() {
  const params = useSearchParams();
  const email = params.get("email")?.trim() || "";
  const token = params.get("token")?.trim() || "";
  const requestedStatus = params.get("status");

  const [view, setView] = useState<VerificationView>(
    requestedStatus === "verified" ? "verified" : requestedStatus === "expired" ? "expired" : "pending"
  );
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const checkVerification = async () => {
    setChecking(true);
    setError(null);
    setNotice(null);
    try {
      if (!token) {
        setError("Open the verification link from your email to continue.");
        return;
      }
      await apiMutate("/api/auth/verify-email", "POST", { email, token });
      setView("verified");
    } catch (e: any) {
      if (e?.code === "expired_link") setView("expired");
      else setError(e?.message || "Verification failed.");
    } finally {
      setChecking(false);
    }
  };

  const resend = async () => {
    if (resending || cooldown > 0) return;
    setResending(true);
    setError(null);
    setNotice(null);
    try {
      await apiMutate("/api/auth/resend-verification", "POST", { email });
      setNotice("If an account exists, a new verification link has been sent.");
      setView("pending");
      setCooldown(RESEND_SECONDS);
    } catch (e: any) {
      setError(e?.message || "Resend failed.");
    } finally {
      setResending(false);
    }
  };

  if (view === "verified") {
    return (
      <div>
        <span className="flex size-11 items-center justify-center rounded-full border border-success/25 bg-success/10 text-success">
          <Check className="size-5" strokeWidth={2.5} aria-hidden />
        </span>
        <p className="eyebrow mt-5">Address confirmed</p>
        <h1 className="mt-3 display-md text-foreground">Your email is verified.</h1>
        <p className="mt-3 text-[13px] leading-[1.7] text-muted-foreground">
          <span className="font-medium text-foreground">{email}</span> is ready to use with your
          research workspace. You can now sign in and continue your work.
        </p>

        <div className="mt-6 space-y-2">
          <Button asChild size="lg" className="h-10 w-full">
            <Link href="/signin">
              Continue to sign in <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (view === "expired") {
    return (
      <div>
        <span className="flex size-11 items-center justify-center rounded-full border border-warning/30 bg-warning/10 text-warning">
          <TriangleAlert className="size-5" aria-hidden />
        </span>
        <p className="eyebrow mt-5">Link expired</p>
        <h1 className="mt-3 display-md text-foreground">This verification link has expired.</h1>
        <p className="mt-3 text-[13px] leading-[1.7] text-muted-foreground">
          Verification links are time-limited. Request a new link for{" "}
          <span className="font-medium text-foreground">{email}</span> and confirm the address to
          finish setting up your workspace.
        </p>

        {notice ? (
          <AuthNotice tone="success" className="mt-5">
            {notice}
          </AuthNotice>
        ) : null}
        {error ? (
          <AuthNotice tone="error" className="mt-5">
            {error}
          </AuthNotice>
        ) : null}

        <div className="mt-6 space-y-2">
          <Button
            type="button"
            size="lg"
            className="h-10 w-full"
            onClick={() => void resend()}
            disabled={resending || cooldown > 0}
          >
            {resending ? (
              <>
                <Loader2 className="animate-spin" /> Requesting a new link…
              </>
            ) : cooldown > 0 ? (
              <>
                <RotateCw /> Try again in {cooldown}s
              </>
            ) : (
              <>
                <RotateCw /> Send a new link
              </>
            )}
          </Button>
          <Button asChild variant="outline" size="lg" className="h-10 w-full">
            <Link href="/signin">
              <ArrowLeft /> Return to sign in
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <span className="flex size-11 items-center justify-center rounded-full border border-primary/20 bg-primary/[0.07] text-primary">
        <Mail className="size-5" aria-hidden />
      </span>
      <p className="eyebrow mt-5">One more step</p>
      <h1 className="mt-3 display-md text-foreground">Verify your email.</h1>
      <p className="mt-3 text-[13px] leading-[1.7] text-muted-foreground">
        We’ve sent a verification link to{" "}
        <span className="font-medium text-foreground">{email}</span>. Open it to confirm the
        address and activate your workspace.
      </p>

      {notice ? (
        <AuthNotice tone="success" className="mt-5">
          {notice}
        </AuthNotice>
      ) : null}
      {error ? (
        <AuthNotice tone="error" className="mt-5">
          {error}
        </AuthNotice>
      ) : null}

      <div className="mt-6 space-y-2">
        <Button
          type="button"
          size="lg"
          className="h-10 w-full"
          onClick={() => void checkVerification()}
          disabled={checking}
        >
          {checking ? (
            <>
              <Loader2 className="animate-spin" /> Checking the link…
            </>
          ) : (
            <>
              <MailCheck /> I’ve verified my email
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-10 w-full"
          onClick={() => void resend()}
          disabled={resending || cooldown > 0}
        >
          {resending ? (
            <>
              <Loader2 className="animate-spin" /> Sending a new link…
            </>
          ) : cooldown > 0 ? (
            <>
              <RotateCw /> Resend in {cooldown}s
            </>
          ) : (
            <>
              <RotateCw /> Resend verification email
            </>
          )}
        </Button>
      </div>

      <div className="mt-6 border-t border-border pt-4">
        <Link
          href="/signin"
          className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3" /> Return to sign in
        </Link>
      </div>
    </div>
  );
}

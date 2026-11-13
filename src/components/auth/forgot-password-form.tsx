/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2, MailCheck, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/auth/form-field";
import { AuthNotice } from "@/components/auth/auth-notice";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validations/auth";
import { apiMutate } from "@/lib/api-client";

export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [resending, setResending] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    try {
      const data = await apiMutate<{ message: string }>("/api/auth/forgot-password", "POST", { email: values.email });
      setSentTo(values.email);
      setMessage(data.message);
    } catch (e: any) {
      setMessage(e?.message || "Request failed.");
      setSentTo(values.email);
    }
  };

  const resend = async () => {
    if (!sentTo || resending) return;
    setResending(true);
    try {
      const data = await apiMutate<{ message: string }>("/api/auth/forgot-password", "POST", { email: sentTo });
      setMessage(data.message);
    } catch (e: any) {
      setMessage(e?.message || "Request failed.");
    } finally {
      setResending(false);
    }
  };

  if (sentTo) {
    return (
      <div>
        <span className="flex size-11 items-center justify-center rounded-full border border-success/25 bg-success/10 text-success">
          <MailCheck className="size-5" aria-hidden />
        </span>
        <p className="eyebrow mt-5">Reset requested</p>
        <h1 className="mt-3 display-md text-foreground">Check your inbox.</h1>
        <p className="mt-3 text-[13px] leading-[1.7] text-muted-foreground">
          If an account exists for{" "}
          <span className="font-medium text-foreground">{sentTo}</span>, a password reset link is
          on its way.
        </p>

        {message ? (
          <AuthNotice tone="info" className="mt-5">
            {message}
          </AuthNotice>
        ) : null}

        <div className="mt-6 space-y-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-10 w-full"
            onClick={() => void resend()}
            disabled={resending}
          >
            {resending ? (
              <>
                <Loader2 className="animate-spin" /> Sending a new link…
              </>
            ) : (
              <>
                <RotateCw /> Send again
              </>
            )}
          </Button>
          <Button asChild size="lg" className="h-10 w-full">
            <Link href="/signin">
              <ArrowLeft /> Back to sign in
            </Link>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => {
            setSentTo(null);
            setMessage("");
            form.reset();
          }}
          className="mt-4 block w-full text-center text-[11px] text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
        >
          Use a different email address
        </button>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/signin"
        className="mb-6 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3" /> Back to sign in
      </Link>

      <p className="eyebrow">Account recovery</p>
      <h1 className="mt-3 display-md text-foreground">Reset your password.</h1>
      <p className="mt-3 text-[13px] leading-[1.7] text-muted-foreground">
        Enter your email address and we’ll help you get back into your research workspace.
      </p>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="mt-6"
        aria-busy={form.formState.isSubmitting}
      >
        <Field
          label="Email address"
          htmlFor="reset-email"
          error={form.formState.errors.email?.message}
          description="Use the address associated with your workspace."
        >
          <Input
            id="reset-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="name@university.edu"
            aria-invalid={Boolean(form.formState.errors.email) || undefined}
            className="h-10 text-[13px]"
            {...form.register("email")}
          />
        </Field>

        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="mt-5 h-10 w-full"
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="animate-spin" /> Sending instructions…
            </>
          ) : (
            <>
              Send reset instructions <ArrowRight />
            </>
          )}
        </Button>
      </form>

      <AuthNotice tone="info" className="mt-6">
        For security, we don’t reveal whether an email address is registered. If it is, a reset
        link will arrive shortly.
      </AuthNotice>

      <p className="mt-6 border-t border-border pt-4 text-center text-[11.5px] text-muted-foreground">
        Remembered your password? <Link href="/signin" className="font-medium text-primary underline decoration-primary/25 underline-offset-4 hover:decoration-primary">Sign in</Link>
      </p>
    </div>
  );
}

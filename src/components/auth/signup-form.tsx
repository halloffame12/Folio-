/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field } from "@/components/auth/form-field";
import { PasswordField } from "@/components/auth/password-field";
import { PasswordStrength } from "@/components/auth/password-strength";
import { AuthNotice } from "@/components/auth/auth-notice";
import {
  academicRoleOptions,
  signupSchema,
  type SignupValues,
} from "@/lib/validations/auth";
import { apiMutate } from "@/lib/api-client";
import type { AcademicRole, AuthUser } from "@/types/auth";

export function SignupForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [created, setCreated] = useState<AuthUser | null>(null);
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      institution: "",
      role: "",
      interests: "",
      acceptedTerms: false,
    },
  });

  const password = form.watch("password");

  const onSubmit = async (values: SignupValues) => {
    setServerError(null);
    try {
      const data = await apiMutate<{ user: AuthUser; verificationSent: boolean; devVerificationUrl?: string }>("/api/auth/signup", "POST", {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        institution: values.institution || undefined,
        role: values.role || undefined,
        interests: values.interests,
        acceptedTerms: values.acceptedTerms,
      });
      setCreated(data.user);
      setVerifyUrl(data.devVerificationUrl ?? null);
      if (data.devVerificationUrl) {
        toast.success("Account created", { description: "Development verification link available." });
      } else {
        toast.success("Account created", { description: "Check your email to verify." });
      }
    } catch (e: any) {
      const fields = e?.fields;
      if (fields?.email) setServerError(fields.email);
      else setServerError(e?.message || "We couldn't create the account.");
    }
  };

  if (created) {
    return (
      <div>
        <span className="flex size-11 items-center justify-center rounded-full border border-success/25 bg-success/10 text-success">
          <MailCheck className="size-5" aria-hidden />
        </span>
        <p className="eyebrow mt-5">Account created</p>
        <h1 className="mt-3 display-md text-foreground">Check your academic inbox.</h1>
        <p className="mt-3 text-[13px] leading-[1.7] text-muted-foreground">
          We’ve sent a verification link to{" "}
          <span className="font-medium text-foreground">{created.email}</span>. Verify the
          address to finish setting up your workspace.
        </p>

        <div className="mt-6 space-y-2">
          <Button asChild size="lg" className="h-10 w-full">
            <Link href={verifyUrl ?? `/verify-email?email=${encodeURIComponent(created.email)}`}>
              Open verification page <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-10 w-full">
            <Link href="/signin">Back to sign in</Link>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => {
            setCreated(null);
            setServerError(null);
            form.reset();
          }}
          className="mt-4 block w-full text-center text-[11px] text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
        >
          Create another account
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="eyebrow">Create an account</p>
      <h1 className="mt-3 display-md text-foreground">Create your research workspace.</h1>
      <p className="mt-3 text-[13px] leading-[1.7] text-muted-foreground">
        Bring your academic work together in one place. Already have an account?{" "}
        <InlineLink href="/signin">Sign in</InlineLink>
        .
      </p>

      {serverError ? (
        <AuthNotice tone="error" title="We couldn’t create the account" className="mb-5">
          {serverError}
        </AuthNotice>
      ) : null}

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        aria-busy={form.formState.isSubmitting}
        className="mt-6"
      >
        <div className="space-y-4">
          <Field
            label="Full name"
            htmlFor="fullName"
            error={form.formState.errors.fullName?.message}
          >
            <Input
              id="fullName"
              autoComplete="name"
              placeholder="Mira Srinivasan"
              aria-invalid={Boolean(form.formState.errors.fullName) || undefined}
              className="h-10 text-[13px]"
              {...form.register("fullName")}
            />
          </Field>

          <Field
            label="Academic email"
            htmlFor="email"
            error={form.formState.errors.email?.message}
            description="Use the address you use for academic work. It does not need to be institutional."
          >
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="name@university.edu"
              aria-invalid={Boolean(form.formState.errors.email) || undefined}
              className="h-10 text-[13px]"
              {...form.register("email")}
            />
          </Field>

          <div className="border-t border-border pt-4">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-muted-foreground">
                Academic details
              </h2>
              <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted-foreground/60">
                Optional
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Institution"
                htmlFor="institution"
                optional
                error={form.formState.errors.institution?.message}
              >
                <Input
                  id="institution"
                  autoComplete="organization"
                  placeholder="Northbridge University"
                  className="h-10 text-[13px]"
                  {...form.register("institution")}
                />
              </Field>

              <Field
                label="Academic role"
                htmlFor="role"
                optional
                error={form.formState.errors.role?.message}
              >
                <Controller
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={(value) => field.onChange(value as AcademicRole)}
                    >
                      <SelectTrigger id="role" className="h-10 text-[12.5px]">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicRoleOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field
                label="Research interests"
                htmlFor="interests"
                optional
                className="sm:col-span-2"
                error={form.formState.errors.interests?.message}
                description="Separate interests with commas — for example, bibliometrics, open access, research policy."
              >
                <Input
                  id="interests"
                  placeholder="Scholarly communication, digital libraries"
                  className="h-10 text-[13px]"
                  {...form.register("interests")}
                />
              </Field>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="space-y-4">
              <Field
                label="Password"
                htmlFor="password"
                error={form.formState.errors.password?.message}
              >
                <PasswordField
                  id="password"
                  autoComplete="new-password"
                  placeholder="Create a password"
                  className="h-10 text-[13px]"
                  invalid={Boolean(form.formState.errors.password)}
                  {...form.register("password")}
                />
              </Field>

              <PasswordStrength password={password} />
            </div>
          </div>

          <Field
            label="Confirm password"
            htmlFor="confirmPassword"
            error={form.formState.errors.confirmPassword?.message}
          >
            <PasswordField
              id="confirmPassword"
              autoComplete="new-password"
              placeholder="Repeat your password"
              className="h-10 text-[13px]"
              invalid={Boolean(form.formState.errors.confirmPassword)}
              {...form.register("confirmPassword")}
            />
          </Field>

          <div className="space-y-1.5">
            <div className="flex items-start gap-2.5">
              <Controller
                control={form.control}
                name="acceptedTerms"
                render={({ field }) => (
                  <Checkbox
                    id="acceptedTerms"
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                    aria-describedby="terms-description"
                    aria-invalid={Boolean(form.formState.errors.acceptedTerms) || undefined}
                    className="mt-0.5"
                  />
                )}
              />
              <label
                htmlFor="acceptedTerms"
                id="terms-description"
                className="text-[11px] leading-relaxed text-muted-foreground"
              >
                I acknowledge the{" "}
                <InlineLink href="/terms">Terms of Service</InlineLink> and{" "}
                <InlineLink href="/privacy">Privacy Notice</InlineLink>.
              </label>
            </div>
            {form.formState.errors.acceptedTerms ? (
              <p role="alert" className="pl-[26px] text-[11px] text-destructive">
                {form.formState.errors.acceptedTerms.message}
              </p>
            ) : null}
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="mt-6 h-10 w-full"
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="animate-spin" /> Creating workspace…
            </>
          ) : (
            <>
              Create account <ArrowRight />
            </>
          )}
        </Button>

        <p className="mt-3 text-center font-mono text-[8px] uppercase leading-relaxed tracking-[0.12em] text-muted-foreground/60">
          Account records are stored in the workspace database
          <br />
          Passwords are hashed before storage
        </p>
      </form>

      <p className="mt-6 border-t border-border pt-4 text-center text-[11.5px] text-muted-foreground">
        Already have a workspace?{" "}
        <InlineLink href="/signin">Sign in to Folio</InlineLink>
      </p>
    </div>
  );
}

function InlineLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="font-medium text-primary underline decoration-primary/25 underline-offset-4 transition-colors hover:decoration-primary"
    >
      {children}
    </Link>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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

const inputClass = "h-11 px-3 text-[14px]";

function FormSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border pt-5">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-[13px] font-medium text-foreground">{title}</h2>
        {hint ? <span className="text-[12px] text-muted-foreground">{hint}</span> : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

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
      const data = await apiMutate<{
        user: AuthUser;
        verificationSent: boolean;
        devVerificationUrl?: string;
      }>("/api/auth/signup", "POST", {
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
        toast.success("Account created", {
          description: "Development verification link available.",
        });
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
        <h1 className="display-md text-foreground">Check your email</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
          We sent a verification link to{" "}
          <span className="font-medium text-foreground">{created.email}</span>.
          Confirm the address to finish setting up your workspace.
        </p>

        <div className="mt-6 space-y-2">
          <Button asChild size="lg" className="h-11 w-full text-[14px]">
            <Link href={verifyUrl ?? `/verify-email?email=${encodeURIComponent(created.email)}`}>
              Open verification page
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-11 w-full text-[14px]">
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
          className="mt-5 block w-full text-center text-[13px] text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
        >
          Create another account
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="display-md text-foreground">Create your account</h1>
      <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
        Set up your workspace. You can add academic details later.
      </p>

      {serverError ? (
        <AuthNotice tone="error" className="mt-5">
          {serverError}
        </AuthNotice>
      ) : null}

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        aria-busy={form.formState.isSubmitting}
        className="mt-6"
      >
        <div className="space-y-5">
          <FormSection title="Your details">
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
                className={inputClass}
                {...form.register("fullName")}
              />
            </Field>

            <Field
              label="Email"
              htmlFor="email"
              error={form.formState.errors.email?.message}
            >
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="name@university.edu"
                aria-invalid={Boolean(form.formState.errors.email) || undefined}
                className={inputClass}
                {...form.register("email")}
              />
            </Field>
          </FormSection>

          <FormSection title="Academic details" hint="Optional">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Institution"
                htmlFor="institution"
                error={form.formState.errors.institution?.message}
              >
                <Input
                  id="institution"
                  autoComplete="organization"
                  placeholder="Northbridge University"
                  className={inputClass}
                  {...form.register("institution")}
                />
              </Field>

              <Field
                label="Role"
                htmlFor="role"
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
                      <SelectTrigger id="role" className="h-11 text-[13.5px]">
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
            </div>

            <Field
              label="Research interests"
              htmlFor="interests"
              error={form.formState.errors.interests?.message}
              description="Separate interests with commas."
            >
              <Input
                id="interests"
                placeholder="Scholarly communication, digital libraries"
                className={inputClass}
                {...form.register("interests")}
              />
            </Field>
          </FormSection>

          <FormSection title="Set a password">
            <Field
              label="Password"
              htmlFor="password"
              error={form.formState.errors.password?.message}
            >
              <PasswordField
                id="password"
                autoComplete="new-password"
                placeholder="Create a password"
                className={inputClass}
                invalid={Boolean(form.formState.errors.password)}
                {...form.register("password")}
              />
            </Field>

            <PasswordStrength password={password} />

            <Field
              label="Confirm password"
              htmlFor="confirmPassword"
              error={form.formState.errors.confirmPassword?.message}
            >
              <PasswordField
                id="confirmPassword"
                autoComplete="new-password"
                placeholder="Repeat your password"
                className={inputClass}
                invalid={Boolean(form.formState.errors.confirmPassword)}
                {...form.register("confirmPassword")}
              />
            </Field>
          </FormSection>

          <div className="space-y-1.5 border-t border-border pt-5">
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
                className="text-[12.5px] leading-relaxed text-muted-foreground"
              >
                I agree to the <InlineLink href="/terms">Terms of Service</InlineLink>{" "}
                and <InlineLink href="/privacy">Privacy Notice</InlineLink>.
              </label>
            </div>
            {form.formState.errors.acceptedTerms ? (
              <p role="alert" className="pl-[26px] text-[12px] text-destructive">
                {form.formState.errors.acceptedTerms.message}
              </p>
            ) : null}
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="mt-6 h-11 w-full text-[14px]"
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="animate-spin" aria-hidden /> Creating account
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <p className="mt-6 border-t border-border pt-5 text-[13.5px] text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/signin"
          className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

function InlineLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="font-medium text-foreground underline decoration-border underline-offset-2 hover:decoration-foreground"
    >
      {children}
    </Link>
  );
}

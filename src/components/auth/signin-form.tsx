/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, LabelLink } from "@/components/auth/form-field";
import { PasswordField } from "@/components/auth/password-field";
import { AuthNotice } from "@/components/auth/auth-notice";
import { signinSchema, type SigninValues } from "@/lib/validations/auth";
import { apiMutate } from "@/lib/api-client";

export function SigninForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const form = useForm<SigninValues>({
    resolver: zodResolver(signinSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
      remember: true,
    },
  });

  const onSubmit = async (values: SigninValues) => {
    setServerError(null);
    setUnverifiedEmail(null);
    try {
      const data = await apiMutate<{ user: { name: string } }>("/api/auth/signin", "POST", {
        email: values.email,
        password: values.password,
        remember: values.remember,
      });
      toast.success(`Welcome back, ${data.user.name.split(" ")[0]}`, {
        description: "Opening your workspace.",
      });
      router.push("/dashboard");
    } catch (e: any) {
      if (e?.code === "email_unverified") {
        setUnverifiedEmail(values.email);
      }
      setServerError(e?.message || "Sign-in unsuccessful.");
    }
  };

  return (
    <div>
      <h1 className="display-md text-foreground">Sign in</h1>
      <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
        Continue to your workspace.
      </p>

      {serverError ? (
        <AuthNotice tone="error" className="mt-5">
          <div>{serverError}</div>
          {unverifiedEmail ? (
            <div className="mt-2">
              <Link
                href={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}
                className="font-medium underline hover:text-foreground"
              >
                Go to verification page &rarr;
              </Link>
            </div>
          ) : null}
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
            label="Email"
            htmlFor="signin-email"
            error={form.formState.errors.email?.message}
          >
            <Input
              id="signin-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="name@university.edu"
              aria-invalid={Boolean(form.formState.errors.email) || undefined}
              className="h-11 px-3 text-[14px]"
              {...form.register("email")}
            />
          </Field>

          <Field
            label="Password"
            htmlFor="signin-password"
            error={form.formState.errors.password?.message}
            labelAction={<LabelLink href="/forgot-password">Forgot password?</LabelLink>}
          >
            <PasswordField
              id="signin-password"
              autoComplete="current-password"
              placeholder="Your password"
              className="h-11 px-3 text-[14px]"
              invalid={Boolean(form.formState.errors.password)}
              {...form.register("password")}
            />
          </Field>

          <div className="flex items-center gap-2.5">
            <Controller
              control={form.control}
              name="remember"
              render={({ field }) => (
                <Checkbox
                  id="remember"
                  checked={Boolean(field.value)}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
              )}
            />
            <label htmlFor="remember" className="text-[13px] text-muted-foreground">
              Keep me signed in
            </label>
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
              <Loader2 className="animate-spin" aria-hidden /> Signing in
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <p className="mt-6 border-t border-border pt-5 text-[13.5px] text-muted-foreground">
        New to Folio?{" "}
        <Link
          href="/signup"
          className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}

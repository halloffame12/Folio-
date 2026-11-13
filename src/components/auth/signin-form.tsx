/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
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
      setServerError(e?.message || "Sign-in unsuccessful.");
    }
  };

  return (
    <div>
      <p className="eyebrow">Sign in</p>
      <h1 className="mt-3 display-md text-foreground">Welcome back.</h1>
      <p className="mt-3 text-[13px] leading-[1.7] text-muted-foreground">
        Continue where your research left off. Sign in to pick up papers, notes, and projects
        exactly where you stopped.
      </p>

      {serverError ? (
        <AuthNotice tone="error" title="Sign-in unsuccessful" className="mb-5">
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
          <Field label="Email address" htmlFor="signin-email" error={form.formState.errors.email?.message}>
            <Input
              id="signin-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="name@university.edu"
              aria-invalid={Boolean(form.formState.errors.email) || undefined}
              className="h-10 text-[13px]"
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
              placeholder="Enter your password"
              className="h-10 text-[13px]"
              invalid={Boolean(form.formState.errors.password)}
              {...form.register("password")}
            />
          </Field>

          <div className="flex items-center gap-2">
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
            <label htmlFor="remember" className="text-[11.5px] text-muted-foreground">
              Keep me signed in on this device
            </label>
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
              <Loader2 className="animate-spin" /> Signing in…
            </>
          ) : (
            <>
              Sign in <ArrowRight />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 border-t border-border pt-4 text-center text-[11.5px] text-muted-foreground">
        New to Folio?{" "}
        <Link
          href="/signup"
          className="font-medium text-primary underline decoration-primary/25 underline-offset-4 transition-colors hover:decoration-primary"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}

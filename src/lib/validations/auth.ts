import { z } from "zod";
import type { AcademicRole } from "@/types/auth";

export const academicRoleOptions: { value: AcademicRole; label: string }[] = [
  { value: "undergraduate", label: "Undergraduate student" },
  { value: "graduate", label: "Graduate student" },
  { value: "scholar", label: "Research scholar" },
  { value: "professor", label: "Professor" },
  { value: "independent", label: "Independent researcher" },
  { value: "other", label: "Other" },
];

export const academicRoleLabels: Record<AcademicRole, string> =
  Object.fromEntries(academicRoleOptions.map((option) => [option.value, option.label])) as Record<
    AcademicRole,
    string
  >;

const emailField = z
  .string()
  .trim()
  .min(1, "Enter your email address.")
  .email("Enter a valid email address, such as name@university.edu.")
  .max(254, "This email address is too long.");

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Enter your full name.")
      .max(80, "Keep your name under 80 characters."),
    email: emailField,
    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .max(72, "Keep your password under 72 characters.")
      .regex(/[a-z]/, "Include a lowercase letter.")
      .regex(/[A-Z]/, "Include an uppercase letter.")
      .regex(/[0-9]/, "Include a number."),
    confirmPassword: z.string().min(1, "Confirm your password."),
    institution: z.string().trim().max(120, "Keep this under 120 characters.").optional(),
    role: z.enum(["undergraduate", "graduate", "scholar", "professor", "independent", "other"]).or(z.literal("")).optional(),
    interests: z.string().trim().max(240, "Keep interests under 240 characters.").optional(),
    acceptedTerms: z
      .boolean()
      .refine((value) => value, "Acknowledge the terms and privacy notice to continue."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignupValues = z.infer<typeof signupSchema>;

export const signinSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Enter your password."),
  remember: z.boolean().optional(),
});

export type SigninValues = z.infer<typeof signinSchema>;

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export interface PasswordCheck {
  id: string;
  label: string;
  met: boolean;
}

export function getPasswordChecks(password: string): PasswordCheck[] {
  return [
    { id: "length", label: "At least 8 characters", met: password.length >= 8 },
    { id: "lower", label: "One lowercase letter", met: /[a-z]/.test(password) },
    { id: "upper", label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { id: "number", label: "One number", met: /[0-9]/.test(password) },
    { id: "symbol", label: "One symbol (recommended)", met: /[^A-Za-z0-9]/.test(password) },
  ];
}

export type PasswordStrengthLabel = "Empty" | "Weak" | "Fair" | "Good" | "Strong";

export function getPasswordStrength(password: string): {
  score: 0 | 1 | 2 | 3 | 4;
  label: PasswordStrengthLabel;
} {
  if (!password) return { score: 0, label: "Empty" };
  const checks = getPasswordChecks(password);
  const met = checks.filter((check) => check.met).length;
  const long = password.length >= 12;

  if (met <= 2) return { score: 1, label: "Weak" };
  if (met === 3) return { score: 2, label: "Fair" };
  if (met === 4) return { score: long ? 4 : 3, label: long ? "Strong" : "Good" };
  return { score: long ? 4 : 3, label: long ? "Strong" : "Good" };
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function splitInterests(value?: string) {
  return (value ?? "")
    .split(",")
    .map((interest) => interest.trim())
    .filter(Boolean)
    .slice(0, 8);
}

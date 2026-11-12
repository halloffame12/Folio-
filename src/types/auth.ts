export type AcademicRole =
  | "undergraduate"
  | "graduate"
  | "scholar"
  | "professor"
  | "independent"
  | "other";

/** The identity a mock session carries. Never contains a password. */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  institution?: string;
  role?: AcademicRole;
  interests?: string[];
  createdAt: string;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  institution?: string;
  role?: AcademicRole;
  interests?: string[];
}

export interface LoginInput {
  email: string;
  password: string;
  remember?: boolean;
}

export type AuthErrorCode =
  | "invalid_credentials"
  | "email_taken"
  | "expired_link"
  | "invalid_email"
  | "unknown";

export interface AuthError {
  code: AuthErrorCode;
  message: string;
}

export type AuthResult<T> = { ok: true; data: T } | { ok: false; error: AuthError };

export interface MockSession {
  user: AuthUser;
  createdAt: string;
  remember: boolean;
  /** True when the session belongs to the built-in demonstration account. */
  demo: boolean;
}

export interface ResetRequestResult {
  ok: boolean;
  message: string;
}

export type EmailVerificationStatus = "pending" | "verified" | "expired" | "sent";

export interface VerifyEmailInput {
  email: string;
  /** Demo tokens: "expired" forces the expired-link state. */
  token?: string;
}

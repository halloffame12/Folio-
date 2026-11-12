import type {
  AuthError,
  AuthResult,
  AuthUser,
  LoginInput,
  MockSession,
  RegisterInput,
  ResetRequestResult,
  VerifyEmailInput,
} from "@/types/auth";
import { academicRoleLabels, normalizeEmail } from "@/lib/validations/auth";

/**
 * Mock authentication service.
 *
 * Everything here runs in the browser and exists only to demonstrate the
 * product's frontend states. No request leaves the page, no email is sent, and
 * there is no claim of production security. Passwords are never written to
 * storage in plain text; a digest is kept only so the demonstration can check
 * a newly created account within the same browser.
 */

const ACCOUNTS_KEY = "folio-demo-accounts-v1";
const SESSION_KEY = "folio-demo-session-v1";
const PASSWORD_SALT = "folio-frontend-demonstration";

export const demoCredentials = {
  email: "mira.srinivasan@northbridge.edu",
  password: "ResearchFolio26!",
} as const;

export const demoAccount = {
  id: "u1",
  name: "Mira Srinivasan",
  email: demoCredentials.email,
  institution: "Northbridge University",
  role: "graduate" as const,
  interests: ["Scholarly communication", "Research infrastructure"],
  createdAt: "2024-08-15T09:00:00.000Z",
  demo: true,
};

const demoUser: AuthUser = {
  id: demoAccount.id,
  name: demoAccount.name,
  email: demoAccount.email,
  institution: demoAccount.institution,
  role: demoAccount.role,
  interests: demoAccount.interests,
  createdAt: demoAccount.createdAt,
};

interface StoredAccount {
  user: AuthUser;
  digest: string;
  algorithm: "sha-256" | "demo-fallback";
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }
    window.setTimeout(resolve, ms);
  });
}

function canUseStorage() {
  return typeof window !== "undefined";
}

function readAccounts(): StoredAccount[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is StoredAccount => {
      if (!item || typeof item !== "object") return false;
      const candidate = item as Partial<StoredAccount>;
      return Boolean(candidate.user?.email && candidate.digest && candidate.algorithm);
    });
  } catch {
    return [];
  }
}

function writeAccounts(accounts: StoredAccount[]) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    // Storage can be unavailable in private modes; the mock service still
    // returns a successful response for the current page session.
  }
}

function fallbackDigest(value: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `demo-fallback-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

async function digestPassword(password: string): Promise<{ digest: string; algorithm: StoredAccount["algorithm"] }> {
  const value = `${PASSWORD_SALT}:${password}`;
  if (typeof crypto !== "undefined" && crypto.subtle) {
    try {
      const bytes = new TextEncoder().encode(value);
      const buffer = await crypto.subtle.digest("SHA-256", bytes);
      const digest = Array.from(new Uint8Array(buffer))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
      return { digest, algorithm: "sha-256" };
    } catch {
      // fall through to the demonstration digest
    }
  }
  return { digest: fallbackDigest(value), algorithm: "demo-fallback" };
}

function persistSession(session: MockSession) {
  if (!canUseStorage()) return;
  const primary = session.remember ? window.localStorage : window.sessionStorage;
  const secondary = session.remember ? window.sessionStorage : window.localStorage;
  try {
    secondary.removeItem(SESSION_KEY);
    primary.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore storage failures in the demonstration
  }
}

function buildSession(user: AuthUser, remember: boolean, demo: boolean): MockSession {
  return {
    user,
    remember,
    demo,
    createdAt: new Date().toISOString(),
  };
}

function error(code: AuthError["code"], message: string): AuthResult<never> {
  return { ok: false, error: { code, message } };
}

export function getMockSession(): MockSession | null {
  if (!canUseStorage()) return null;
  for (const store of [window.sessionStorage, window.localStorage]) {
    try {
      const raw = store.getItem(SESSION_KEY);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as Partial<MockSession>;
      if (parsed?.user?.email) return parsed as MockSession;
    } catch {
      continue;
    }
  }
  return null;
}

export async function registerUser(
  input: RegisterInput
): Promise<AuthResult<{ user: AuthUser; verificationSent: true }>> {
  await wait(900);
  const email = normalizeEmail(input.email);

  if (!email) {
    return error("invalid_email", "Enter a valid email address to continue.");
  }

  if (email === demoCredentials.email) {
    return error(
      "email_taken",
      "An account already exists for this email. Sign in with the demonstration credentials instead."
    );
  }

  const accounts = readAccounts();
  if (accounts.some((account) => normalizeEmail(account.user.email) === email)) {
    return error(
      "email_taken",
      "An account already exists for this email in this browser. Try signing in instead."
    );
  }

  const { digest, algorithm } = await digestPassword(input.password);
  const user: AuthUser = {
    id: `u-${Date.now().toString(36)}`,
    name: input.fullName.trim(),
    email,
    institution: input.institution?.trim() || undefined,
    role: input.role || undefined,
    interests: input.interests
      ?.map((interest) => interest.trim())
      .filter(Boolean)
      .slice(0, 8),
    createdAt: new Date().toISOString(),
  };

  writeAccounts([...accounts, { user, digest, algorithm }]);

  return { ok: true, data: { user, verificationSent: true } };
}

export async function loginUser(input: LoginInput): Promise<AuthResult<{ session: MockSession }>> {
  await wait(950);
  const email = normalizeEmail(input.email);
  const remember = Boolean(input.remember);

  if (email === demoCredentials.email && input.password === demoCredentials.password) {
    const session = buildSession(demoUser, remember, true);
    persistSession(session);
    return { ok: true, data: { session } };
  }

  const account = readAccounts().find(
    (candidate) => normalizeEmail(candidate.user.email) === email
  );

  if (account) {
    const { digest } = await digestPassword(input.password);
    if (digest === account.digest) {
      const session = buildSession(account.user, remember, false);
      persistSession(session);
      return { ok: true, data: { session } };
    }
  }

  return error(
    "invalid_credentials",
    "We couldn’t match that email and password. Check both fields, or use the demonstration account below."
  );
}

export async function logoutUser(): Promise<{ ok: true }> {
  await wait(240);
  if (canUseStorage()) {
    try {
      window.localStorage.removeItem(SESSION_KEY);
      window.sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  }
  return { ok: true };
}

export async function requestPasswordReset(email: string): Promise<ResetRequestResult> {
  await wait(850);
  const address = normalizeEmail(email);
  return {
    ok: true,
    message: address
      ? `If an account exists for ${address}, reset instructions would be sent there. This demonstration does not send real email.`
      : "If an account exists for that address, reset instructions would be sent. This demonstration does not send real email.",
  };
}

export async function resendVerificationEmail(email: string): Promise<ResetRequestResult> {
  await wait(800);
  const address = normalizeEmail(email);
  if (!address) {
    return {
      ok: false,
      message: "We need an email address to resend the verification link.",
    };
  }
  return {
    ok: true,
    message: `A new verification link would be sent to ${address}. No email is sent in this demonstration.`,
  };
}

export async function verifyEmail(
  input: VerifyEmailInput
): Promise<AuthResult<{ user: AuthUser }>> {
  await wait(750);
  const email = normalizeEmail(input.email);

  if (input.token === "expired") {
    return error(
      "expired_link",
      "This verification link has expired. Request a new link to continue."
    );
  }

  if (!email) {
    return error("invalid_email", "Open the verification link from your email to continue.");
  }

  const account = readAccounts().find(
    (candidate) => normalizeEmail(candidate.user.email) === email
  );

  const user: AuthUser =
    email === demoCredentials.email
      ? demoUser
      : account?.user ?? {
          id: "u-verified-demo",
          name: email.split("@")[0]?.replace(/[._-]+/g, " ") || "Researcher",
          email,
          createdAt: new Date().toISOString(),
        };

  return { ok: true, data: { user } };
}

export function describeRole(role?: AuthUser["role"]) {
  return role ? academicRoleLabels[role] : undefined;
}

import { randomToken, tokenHash } from "./tokens";
export { tokenHash };

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(opts: SendEmailOptions) {
  const provider = process.env.EMAIL_PROVIDER || (process.env.EMAIL_PROVIDER_API_KEY ? "resend" : "console");
  if (provider === "resend" && process.env.EMAIL_PROVIDER_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.EMAIL_PROVIDER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Folio <no-reply@folio.local>",
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
      }),
    });
    if (!res.ok) {
      console.error("Email send failed:", await res.text());
      throw new Error("Email delivery failed.");
    }
    return;
  }
  // Console provider: never pretends delivery; logs content for development.
  console.log(`[EMAIL:console] To: ${opts.to}\nSubject: ${opts.subject}\n${opts.text}`);
}

export function verificationUrl(token: string, email: string) {
  const base = process.env.APP_URL || "http://localhost:3000";
  const url = new URL("/verify-email", base);
  url.searchParams.set("token", token);
  url.searchParams.set("email", email);
  return url.toString();
}

export function resetUrl(token: string, email: string) {
  const base = process.env.APP_URL || "http://localhost:3000";
  const url = new URL("/reset-password", base);
  url.searchParams.set("token", token);
  url.searchParams.set("email", email);
  return url.toString();
}

export function newToken() {
  return randomToken();
}

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiError, badRequest, unauthorized, conflict } from "./errors";
export { badRequest, unauthorized, conflict };

export type ApiEnvelope<T> =
  | { success: true; data: T; meta?: Record<string, unknown> }
  | { success: false; error: { code: string; message: string; fields?: Record<string, string> } };

export function ok<T>(data: T, meta?: Record<string, unknown>, status = 200) {
  const body: ApiEnvelope<T> = meta ? { success: true, data, meta } : { success: true, data };
  return NextResponse.json(body, { status });
}

export function fail(error: ApiError | ZodError | Error, status?: number) {
  if (error instanceof ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of error.issues) {
      const path = issue.path.join(".") || "_";
      if (!fields[path]) fields[path] = issue.message;
    }
    const body: ApiEnvelope<never> = {
      success: false,
      error: { code: "validation_error", message: "Please correct the highlighted fields.", fields },
    };
    return NextResponse.json(body, { status: 422 });
  }
  if (error instanceof ApiError) {
    const body: ApiEnvelope<never> = {
      success: false,
      error: { code: error.code, message: error.message, fields: error.fields },
    };
    return NextResponse.json(body, { status: status ?? error.status });
  }
  const body: ApiEnvelope<never> = {
    success: false,
    error: { code: "internal_error", message: "Something went wrong. Please try again." },
  };
  return NextResponse.json(body, { status: 500 });
}

export async function withRoute<T extends Response>(
  fn: () => Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof ZodError || err instanceof ApiError) return fail(err) as unknown as T;
    console.error("Route error:", err);
    return fail(err instanceof Error ? err : new Error(String(err))) as unknown as T;
  }
}

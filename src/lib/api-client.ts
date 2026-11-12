/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE = "";

export class ApiClientError extends Error {
  code: string;
  status: number;
  fields?: Record<string, string>;
  constructor(code: string, message: string, status: number, fields?: Record<string, string>) {
    super(message);
    this.code = code;
    this.status = status;
    this.fields = fields;
  }
}

export async function apiFetch<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.success === false) {
    const err = json?.error || {};
    throw new ApiClientError(err.code || "internal_error", err.message || "Request failed.", res.status, err.fields);
  }
  return json.data as T;
}

export async function apiMutate<T = any>(path: string, method: string, body?: unknown) {
  return apiFetch<T>(path, { method, body: body ? JSON.stringify(body) : undefined });
}

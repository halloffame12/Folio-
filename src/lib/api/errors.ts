export type ApiErrorCode =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "validation_error"
  | "rate_limited"
  | "email_unverified"
  | "internal_error"
  | "external_api_error";

export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public status: number = 400,
    public fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function badRequest(message = "Invalid request.", fields?: Record<string, string>) {
  return new ApiError("bad_request", message, 400, fields);
}
export function unauthorized(message = "You must be signed in to continue.") {
  return new ApiError("unauthorized", message, 401);
}
export function forbidden(message = "You do not have permission to perform this action.") {
  return new ApiError("forbidden", message, 403);
}
export function notFound(message = "Resource not found.") {
  return new ApiError("not_found", message, 404);
}
export function conflict(message = "The request conflicts with the current state.", fields?: Record<string, string>) {
  return new ApiError("conflict", message, 409, fields);
}
export function validationError(message = "Validation failed.", fields?: Record<string, string>) {
  return new ApiError("validation_error", message, 422, fields);
}
export function rateLimited(message = "Too many attempts. Please try again later.") {
  return new ApiError("rate_limited", message, 429);
}
export function emailUnverified(message = "Verify your email address to perform this action.") {
  return new ApiError("email_unverified", message, 403);
}
export function internalError(message = "Something went wrong. Please try again.") {
  return new ApiError("internal_error", message, 500);
}
export function externalApiError(message = "External scholarly service is unavailable.") {
  return new ApiError("external_api_error", message, 502);
}

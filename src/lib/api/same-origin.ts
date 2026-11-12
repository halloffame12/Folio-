import { ApiError } from "./errors";

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin) {
    // Non-browser clients may omit Origin; allow but rely on cookie auth.
    return;
  }
  try {
    const originHost = new URL(origin).host;
    if (originHost !== host) {
      throw new ApiError("forbidden", "Cross-origin request blocked.", 403);
    }
  } catch {
    throw new ApiError("forbidden", "Cross-origin request blocked.", 403);
  }
}

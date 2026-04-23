import type { H3Event } from "h3";

export function getAuthToken(event: H3Event): string | null {
  return getCookie(event, "auth_token") ?? null;
}

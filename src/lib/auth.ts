import type { NextRequest } from "next/server";
import type { AdminSession, CandidateSession } from "@/lib/types";

export const ADMIN_SESSION_COOKIE = "kaoshi_admin_session";
export const CANDIDATE_SESSION_COOKIE = "kaoshi_candidate_session";

export function encodeAdminCookie(payload: {
  sessionId: string;
  userId: string;
  role: AdminSession["role"];
}) {
  return `${payload.sessionId}:${payload.userId}:${payload.role}`;
}

export function decodeAdminCookie(value?: string | null) {
  if (!value) {
    return null;
  }

  const decodedValue = decodeURIComponent(value);
  const [sessionId, userId, role] = decodedValue.split(":");
  if (!sessionId || !userId || (role !== "ADMIN" && role !== "REVIEWER")) {
    return null;
  }

  return { sessionId, userId, role };
}

export function getAdminSessionFromRequest(request: NextRequest) {
  return decodeAdminCookie(request.cookies.get(ADMIN_SESSION_COOKIE)?.value ?? null);
}

export function encodeCandidateCookie(payload: CandidateSession) {
  return `${payload.userId}:${payload.role}`;
}

export function decodeCandidateCookie(value?: string | null) {
  if (!value) {
    return null;
  }

  const decodedValue = decodeURIComponent(value);
  const [userId, role] = decodedValue.split(":");
  if (!userId || role !== "CANDIDATE") {
    return null;
  }

  return { userId, role } satisfies CandidateSession;
}

export function getCandidateSessionFromRequest(request: NextRequest) {
  return decodeCandidateCookie(request.cookies.get(CANDIDATE_SESSION_COOKIE)?.value ?? null);
}

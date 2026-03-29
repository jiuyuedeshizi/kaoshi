import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import {
  CANDIDATE_SESSION_COOKIE,
  decodeCandidateCookie,
} from "@/lib/auth";
import { repo } from "@/lib/repository";
import type { User } from "@/lib/types";

export interface CurrentCandidate {
  user: User & { role: "CANDIDATE" };
}

async function resolveCandidate(cookieValue?: string | null): Promise<CurrentCandidate | null> {
  const session = decodeCandidateCookie(cookieValue);
  if (!session) {
    return null;
  }

  const user = await repo.findUserById(session.userId);
  if (!user || user.role !== "CANDIDATE") {
    return null;
  }

  return {
    user: user as User & { role: "CANDIDATE" },
  };
}

export async function getCurrentCandidate() {
  const cookieStore = await cookies();
  return resolveCandidate(cookieStore.get(CANDIDATE_SESSION_COOKIE)?.value);
}

export async function requireCandidatePageAccess(nextPath: string) {
  const current = await getCurrentCandidate();
  if (!current) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return current;
}

export async function requireCandidateApiAccess(request: NextRequest | Request) {
  const cookieHeader = request.headers.get("cookie");
  const cookieValue = cookieHeader
    ?.split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${CANDIDATE_SESSION_COOKIE}=`))
    ?.split("=")[1];

  const current = await resolveCandidate(cookieValue);
  if (!current) {
    return { error: "考生接口需要登录", status: 401 as const };
  }

  return { current };
}

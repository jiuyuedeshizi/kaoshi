import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, decodeAdminCookie } from "@/lib/auth";
import { repo } from "@/lib/repository";
import { findAdminSession } from "@/lib/session-store";
import type { AdminPermission, AdminSession, User, UserRole } from "@/lib/types";

const roleLabels: Record<Exclude<UserRole, "CANDIDATE">, string> = {
  ADMIN: "系统管理员",
  REVIEWER: "审核专员",
};

const permissionMap: Record<Exclude<UserRole, "CANDIDATE">, AdminPermission[]> = {
  ADMIN: [
    "VIEW_DASHBOARD",
    "MANAGE_EXAMS",
    "REVIEW_APPLICATIONS",
    "VIEW_ORDERS",
    "MANAGE_SCORES",
    "MANAGE_NOTICES",
  ],
  REVIEWER: ["VIEW_DASHBOARD", "REVIEW_APPLICATIONS", "VIEW_ORDERS"],
};

export interface CurrentAdmin {
  session: AdminSession;
  user: User & { role: Exclude<UserRole, "CANDIDATE"> };
  roleLabel: string;
}

function hasPermission(role: Exclude<UserRole, "CANDIDATE">, permission: AdminPermission) {
  return permissionMap[role].includes(permission);
}

export function getRoleLabel(role: Exclude<UserRole, "CANDIDATE">) {
  return roleLabels[role];
}

async function resolveCurrentAdminByCookie(cookieValue?: string | null): Promise<CurrentAdmin | null> {
  const parsedCookie = decodeAdminCookie(cookieValue);
  if (!parsedCookie) {
    return null;
  }

  const user = await repo.findUserById(parsedCookie.userId);
  if (!user || user.role === "CANDIDATE" || user.role !== parsedCookie.role) {
    return null;
  }

  const session =
    (await findAdminSession(parsedCookie.sessionId)) ?? {
      id: parsedCookie.sessionId,
      userId: parsedCookie.userId,
      role: parsedCookie.role,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
    };

  return {
    session: {
      ...session,
      role: user.role,
    },
    user: user as User & { role: Exclude<UserRole, "CANDIDATE"> },
    roleLabel: getRoleLabel(user.role),
  };
}

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return resolveCurrentAdminByCookie(cookieValue);
}

export async function requireAdminPageAccess(permission: AdminPermission, nextPath: string) {
  const current = await getCurrentAdmin();

  if (!current) {
    redirect(`/admin/login?next=${encodeURIComponent(nextPath)}`);
  }

  if (!hasPermission(current.user.role, permission)) {
    redirect("/admin/forbidden");
  }

  return current;
}

export async function getAdminFromRequest(request: NextRequest | Request) {
  const cookieHeader = request.headers.get("cookie");
  const cookieValue = cookieHeader
    ?.split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${ADMIN_SESSION_COOKIE}=`))
    ?.split("=")[1];

  return resolveCurrentAdminByCookie(cookieValue);
}

export async function requireAdminApiAccess(
  request: NextRequest | Request,
  permission: AdminPermission,
) {
  const current = await getAdminFromRequest(request);
  if (!current) {
    return { error: "后台接口需要登录", status: 401 as const };
  }

  if (!hasPermission(current.user.role, permission)) {
    return { error: "当前账号无权执行此操作", status: 403 as const };
  }

  return { current };
}

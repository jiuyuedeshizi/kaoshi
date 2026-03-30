import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, encodeAdminCookie } from "@/lib/auth";
import { repo } from "@/lib/repository";
import { createAdminSession } from "@/lib/session-store";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const user = await repo.authenticate(parsed.data.account, parsed.data.password);

  if (!user || !["ADMIN", "REVIEWER", "SCHEDULER", "SCORE_MANAGER", "FINANCE", "CONTENT_MANAGER"].includes(user.role)) {
    await repo.createLoginLog({
      account: parsed.data.account,
      success: false,
      ip: request.headers.get("x-forwarded-for") ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });
    return NextResponse.json(
      { ok: false, error: "仅后台账号可以登录管理端" },
      { status: 401 },
    );
  }

  const role = user.role as "ADMIN" | "REVIEWER" | "SCHEDULER" | "SCORE_MANAGER" | "FINANCE" | "CONTENT_MANAGER";
  const session = await createAdminSession(user.id, role);
  await repo.createLoginLog({
    userId: user.id,
    account: parsed.data.account,
    role: user.role,
    success: true,
    ip: request.headers.get("x-forwarded-for") ?? undefined,
    userAgent: request.headers.get("user-agent") ?? undefined,
  });

  const response = NextResponse.json({
    ok: true,
    data: {
      id: user.id,
      name: user.name,
      role: user.role,
    },
  });

  response.cookies.set(
    ADMIN_SESSION_COOKIE,
    encodeAdminCookie({ sessionId: session.id, userId: user.id, role }),
    {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
    },
  );

  return response;
}

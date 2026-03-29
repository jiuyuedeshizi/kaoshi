import { NextResponse } from "next/server";
import { CANDIDATE_SESSION_COOKIE, encodeCandidateCookie } from "@/lib/auth";
import { repo } from "@/lib/repository";
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

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "账号或密码错误" },
      { status: 401 },
    );
  }

  if (user.role !== "CANDIDATE") {
    return NextResponse.json(
      { ok: false, error: "请使用后台登录入口访问管理员账号" },
      { status: 403 },
    );
  }

  const response = NextResponse.json({
    ok: true,
    data: {
      id: user.id,
      name: user.name,
      role: user.role,
      phone: user.phone,
    },
  });

  response.cookies.set(
    CANDIDATE_SESSION_COOKIE,
    encodeCandidateCookie({ userId: user.id, role: "CANDIDATE" }),
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

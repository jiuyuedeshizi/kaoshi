import { NextResponse } from "next/server";
import { repo } from "@/lib/repository";
import { registerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const exists = (await repo.listUsers()).find(
    (user) => user.phone === parsed.data.phone || user.idCard === parsed.data.idCard,
  );

  if (exists) {
    return NextResponse.json(
      { ok: false, error: "手机号或身份证号已注册" },
      { status: 409 },
    );
  }

  const user = await repo.createUser(parsed.data);
  return NextResponse.json(
    {
      ok: true,
      data: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    },
    { status: 201 },
  );
}

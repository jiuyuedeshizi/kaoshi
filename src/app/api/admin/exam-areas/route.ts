import { NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-auth";
import { repo } from "@/lib/repository";
import { examAreaSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const access = await requireAdminApiAccess(request, "MANAGE_LOCATIONS");
  if ("error" in access) {
    return NextResponse.json({ ok: false, error: access.error }, { status: access.status });
  }
  const body = await request.json();
  const parsed = examAreaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }
  const record = await repo.createExamArea(parsed.data);
  await repo.createAdminOperationLog({
    adminUserId: access.current.user.id,
    adminName: access.current.user.name,
    action: "CREATE_AREA",
    targetType: "EXAM_AREA",
    targetId: record.id,
    detail: `新增考区 ${record.name}。`,
  });
  return NextResponse.json({ ok: true, data: record }, { status: 201 });
}

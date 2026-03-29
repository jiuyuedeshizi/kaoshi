import { NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-auth";
import { repo } from "@/lib/repository";
import { scoreImportSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const access = await requireAdminApiAccess(request, "MANAGE_SCORES");
  if ("error" in access) {
    return NextResponse.json({ ok: false, error: access.error }, { status: access.status });
  }

  const body = await request.json();
  const parsed = scoreImportSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const record = await repo.importScore(parsed.data);
  await repo.createAdminOperationLog({
    adminUserId: access.current.user.id,
    adminName: access.current.user.name,
    action: "IMPORT_SCORE",
    targetType: "SCORE_RECORD",
    targetId: record.id,
    detail: `导入成绩 ${record.ticketNo}，当前状态为${record.published ? "已发布" : "未发布"}。`,
  });

  return NextResponse.json({ ok: true, data: record }, { status: 201 });
}

import { NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-auth";
import { repo } from "@/lib/repository";
import { systemSettingSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const access = await requireAdminApiAccess(request, "MANAGE_SETTINGS");
  if ("error" in access) {
    return NextResponse.json({ ok: false, error: access.error }, { status: access.status });
  }
  const body = await request.json();
  const parsed = systemSettingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }
  const record = await repo.upsertSystemSetting(parsed.data.key, parsed.data.value);
  await repo.createAdminOperationLog({
    adminUserId: access.current.user.id,
    adminName: access.current.user.name,
    action: "UPDATE_SETTING",
    targetType: "SYSTEM_SETTING",
    targetId: record.key,
    detail: `更新系统设置 ${record.key}。`,
  });
  return NextResponse.json({ ok: true, data: record });
}

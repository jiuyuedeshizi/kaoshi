import { NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-auth";
import { repo } from "@/lib/repository";
import { schedulingSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const access = await requireAdminApiAccess(request, "MANAGE_TICKETS");
  if ("error" in access) {
    return NextResponse.json({ ok: false, error: access.error }, { status: access.status });
  }
  const body = await request.json();
  const parsed = schedulingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }
  const items = await repo.generateTicketsByExam({
    ...parsed.data,
    regenerate: parsed.data.regenerate ?? true,
  });
  await repo.createAdminOperationLog({
    adminUserId: access.current.user.id,
    adminName: access.current.user.name,
    action: "GENERATE_TICKETS",
    targetType: "TICKET_BATCH",
    targetId: parsed.data.examProjectId,
    detail: `重新生成 ${items.length} 份准考证。`,
  });
  return NextResponse.json({ ok: true, data: { count: items.length, items } });
}

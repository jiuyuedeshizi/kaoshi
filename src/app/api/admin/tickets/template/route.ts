import { NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-auth";
import { repo } from "@/lib/repository";
import { ticketTemplateSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const access = await requireAdminApiAccess(request, "MANAGE_TICKETS");
  if ("error" in access) {
    return NextResponse.json({ ok: false, error: access.error }, { status: access.status });
  }
  const body = await request.json();
  const parsed = ticketTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }
  const template = await repo.saveTicketTemplate(parsed.data);
  await repo.createAdminOperationLog({
    adminUserId: access.current.user.id,
    adminName: access.current.user.name,
    action: "SAVE_TICKET_TEMPLATE",
    targetType: "TICKET_TEMPLATE",
    targetId: template.id,
    detail: `更新准考证模板 ${template.name}。`,
  });
  return NextResponse.json({ ok: true, data: template });
}

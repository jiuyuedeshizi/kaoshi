import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApiAccess } from "@/lib/admin-auth";
import { repo } from "@/lib/repository";

const importSchema = z.object({
  items: z.array(z.object({
    applicationId: z.string().min(1),
    ticketNo: z.string().min(1),
    examTime: z.string().min(1),
    areaName: z.string().optional(),
    venue: z.string().min(1),
    venueAddress: z.string().optional(),
    room: z.string().min(1),
    seatNo: z.string().min(1),
    examSubject: z.string().optional(),
    jobCode: z.string().optional(),
    jobName: z.string().optional(),
    templateId: z.string().optional(),
    templateVersion: z.string().optional(),
  })).min(1),
});

export async function POST(request: Request) {
  const access = await requireAdminApiAccess(request, "MANAGE_SCHEDULING");
  if ("error" in access) {
    return NextResponse.json({ ok: false, error: access.error }, { status: access.status });
  }
  const body = await request.json();
  const parsed = importSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const items = [];
  for (const item of parsed.data.items) {
    const record = await repo.upsertTicketAssignment(item);
    items.push(record);
  }

  await repo.createAdminOperationLog({
    adminUserId: access.current.user.id,
    adminName: access.current.user.name,
    action: "IMPORT_SCHEDULING",
    targetType: "TICKET_BATCH",
    targetId: String(items.length),
    detail: `导入 ${items.length} 条编排结果。`,
  });
  return NextResponse.json({ ok: true, data: { count: items.length, items } });
}

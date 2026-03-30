import { NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-auth";
import { repo } from "@/lib/repository";

export async function GET(request: Request) {
  const access = await requireAdminApiAccess(request, "VIEW_REPORTS");
  if ("error" in access) {
    return NextResponse.json({ ok: false, error: access.error }, { status: access.status });
  }
  const summary = await repo.getReportSummary();
  return NextResponse.json({ ok: true, data: summary });
}

import { NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-auth";
import { repo } from "@/lib/repository";

export async function GET(request: Request) {
  const access = await requireAdminApiAccess(request, "VIEW_LOGS");
  if ("error" in access) {
    return NextResponse.json({ ok: false, error: access.error }, { status: access.status });
  }
  const [operations, logins, callbacks, downloads] = await Promise.all([
    repo.listAdminOperationLogs(20),
    repo.listLoginLogs(20),
    repo.listPaymentCallbackLogs(20),
    repo.listTicketDownloadLogs(20),
  ]);
  return NextResponse.json({ ok: true, data: { operations, logins, callbacks, downloads } });
}

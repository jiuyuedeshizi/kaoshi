import { NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-auth";
import { repo } from "@/lib/repository";
import { reviewSchema } from "@/lib/validators";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await requireAdminApiAccess(request, "REVIEW_APPLICATIONS");
  if ("error" in access) {
    return NextResponse.json({ ok: false, error: access.error }, { status: access.status });
  }

  const body = await request.json();
  const parsed = reviewSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { id } = await params;
  const existing = await repo.findApplication(id);
  if (!existing) {
    return NextResponse.json({ ok: false, error: "报名记录不存在" }, { status: 404 });
  }

  if (existing.status !== "SUBMITTED") {
    return NextResponse.json({ ok: false, error: "仅已提交审核的报名可执行审核操作" }, { status: 409 });
  }

  const application = await repo.reviewApplication(id, parsed.data.status, parsed.data.reviewNote);

  if (!application) {
    return NextResponse.json({ ok: false, error: "报名记录不存在" }, { status: 404 });
  }

  await repo.createAdminOperationLog({
    adminUserId: access.current.user.id,
    adminName: access.current.user.name,
    action: "REVIEW_APPLICATION",
    targetType: "APPLICATION",
    targetId: application.id,
    detail: `${parsed.data.status === "APPROVED" ? "审核通过" : "审核驳回"}报名 ${application.id}。`,
  });

  return NextResponse.json({ ok: true, data: application });
}

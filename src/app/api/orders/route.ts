import { NextResponse } from "next/server";
import { requireCandidateApiAccess } from "@/lib/candidate-auth";
import { isReleasedAt } from "@/lib/exam-window";
import { repo } from "@/lib/repository";
import { createOrderSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const access = await requireCandidateApiAccess(request);
  if ("error" in access) {
    return NextResponse.json({ ok: false, error: access.error }, { status: access.status });
  }

  const body = await request.json();
  const parsed = createOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const application = await repo.findApplication(parsed.data.applicationId);
  if (!application || application.userId !== access.current.user.id) {
    return NextResponse.json({ ok: false, error: "报名记录不存在" }, { status: 404 });
  }

  if (application.status !== "APPROVED") {
    return NextResponse.json(
      { ok: false, error: "仅审核通过的报名可创建缴费订单" },
      { status: 400 },
    );
  }

  const existingOrders = await repo.findOrdersByApplicationId(application.id);
  const existingPaid = existingOrders.find((order) => order.status === "PAID");
  if (existingPaid) {
    return NextResponse.json(
      { ok: false, error: "该报名记录已缴费，无需重复支付" },
      { status: 409 },
    );
  }

  const existingPending = existingOrders.find((order) => order.status === "PENDING");
  if (existingPending) {
    return NextResponse.json(
      { ok: false, error: `已有待支付订单：${existingPending.orderNo}` },
      { status: 409 },
    );
  }

  const exam = await repo.findExamById(application.examProjectId);
  if (!exam) {
    return NextResponse.json({ ok: false, error: "考试项目不存在" }, { status: 404 });
  }

  if (isReleasedAt(exam.paymentEnd)) {
    return NextResponse.json({ ok: false, error: "缴费时间已截止，无法创建新订单" }, { status: 409 });
  }

  const order = await repo.createOrder({
    applicationId: application.id,
    amount: exam.fee,
    provider: parsed.data.provider,
  });

  return NextResponse.json({ ok: true, data: order }, { status: 201 });
}

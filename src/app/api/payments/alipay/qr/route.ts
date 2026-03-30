import { NextResponse } from "next/server";
import { createAlipayQrCode, isAlipayConfigured } from "@/lib/alipay";
import { requireCandidateApiAccess } from "@/lib/candidate-auth";
import { repo } from "@/lib/repository";

export async function GET(request: Request) {
  const access = await requireCandidateApiAccess(request);
  if ("error" in access) {
    return NextResponse.json({ ok: false, error: access.error }, { status: access.status });
  }

  const url = new URL(request.url);
  const orderNo = url.searchParams.get("orderNo");
  if (!orderNo) {
    return NextResponse.json({ ok: false, error: "缺少订单号" }, { status: 400 });
  }

  if (!isAlipayConfigured()) {
    return NextResponse.json({ ok: false, error: "支付宝参数未配置，请先完善 .env.local。" }, { status: 503 });
  }

  const order = await repo.findOrderByOrderNo(orderNo);
  if (!order) {
    return NextResponse.json({ ok: false, error: "订单不存在" }, { status: 404 });
  }

  if (order.provider !== "ALIPAY") {
    return NextResponse.json({ ok: false, error: "该订单不是支付宝订单" }, { status: 409 });
  }

  const application = await repo.findApplication(order.applicationId);
  if (!application || application.userId !== access.current.user.id) {
    return NextResponse.json({ ok: false, error: "报名记录不存在或无权访问" }, { status: 404 });
  }

  const exam = await repo.findExamById(application.examProjectId);
  if (!exam) {
    return NextResponse.json({ ok: false, error: "考试项目不存在" }, { status: 404 });
  }

  const payload = await createAlipayQrCode({
    request,
    order,
    exam,
    applicationId: application.id,
  });

  return NextResponse.json({ ok: true, data: { orderNo, ...payload } });
}

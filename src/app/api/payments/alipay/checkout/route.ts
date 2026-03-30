import { NextResponse } from "next/server";
import { buildAlipayPagePayUrl, isAlipayConfigured } from "@/lib/alipay";
import { requireCandidateApiAccess } from "@/lib/candidate-auth";
import { repo } from "@/lib/repository";

function redirectWithMessage(request: Request, message: string) {
  const url = new URL("/payments", request.url);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const access = await requireCandidateApiAccess(request);
  if ("error" in access) {
    return redirectWithMessage(request, "请先登录后再发起支付宝支付。");
  }

  const url = new URL(request.url);
  const orderNo = url.searchParams.get("orderNo");
  if (!orderNo) {
    return redirectWithMessage(request, "缺少订单号，无法发起支付宝支付。");
  }

  if (!isAlipayConfigured()) {
    return redirectWithMessage(request, "支付宝参数未配置，请先完善 .env.local。");
  }

  const order = await repo.findOrderByOrderNo(orderNo);
  if (!order) {
    return redirectWithMessage(request, "订单不存在。");
  }

  if (order.provider !== "ALIPAY") {
    return redirectWithMessage(request, "该订单不是支付宝订单。");
  }

  if (order.status === "PAID") {
    const paidUrl = new URL("/payments", request.url);
    paidUrl.searchParams.set("success", `订单 ${order.orderNo} 已支付，无需重复发起。`);
    return NextResponse.redirect(paidUrl);
  }

  const application = await repo.findApplication(order.applicationId);
  if (!application || application.userId !== access.current.user.id) {
    return redirectWithMessage(request, "报名记录不存在或无权访问。");
  }

  const exam = await repo.findExamById(application.examProjectId);
  if (!exam) {
    return redirectWithMessage(request, "考试项目不存在。");
  }

  const payUrl = buildAlipayPagePayUrl({
    request,
    order,
    exam,
    applicationId: application.id,
  });

  return NextResponse.redirect(payUrl);
}

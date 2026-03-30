import { NextResponse } from "next/server";
import { queryAlipayTrade } from "@/lib/alipay";
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

  const order = await repo.findOrderByOrderNo(orderNo);
  if (!order) {
    return NextResponse.json({ ok: false, error: "订单不存在" }, { status: 404 });
  }

  const application = await repo.findApplication(order.applicationId);
  if (!application || application.userId !== access.current.user.id) {
    return NextResponse.json({ ok: false, error: "订单不存在或无权访问" }, { status: 404 });
  }

  if (order.provider !== "ALIPAY") {
    return NextResponse.json({ ok: false, error: "该订单不是支付宝订单" }, { status: 409 });
  }

  if (order.status === "PAID") {
    return NextResponse.json({ ok: true, data: { order, paid: true, duplicate: true } });
  }

  const trade = await queryAlipayTrade(orderNo);
  const paid = ["TRADE_SUCCESS", "TRADE_FINISHED"].includes(trade.tradeStatus ?? "");

  if (!paid) {
    return NextResponse.json({
      ok: true,
      data: {
        order,
        paid: false,
        tradeStatus: trade.tradeStatus ?? "WAIT_BUYER_PAY",
      },
    });
  }

  const updated = await repo.markOrderPaid(orderNo, {
    provider: "ALIPAY",
    orderNo,
    tradeNo: trade.tradeNo ?? "",
    tradeStatus: trade.tradeStatus ?? "",
    buyerLogonId: trade.buyerLogonId ?? "",
  });

  return NextResponse.json({
    ok: true,
    data: {
      order: updated ?? order,
      paid: true,
      tradeStatus: trade.tradeStatus,
    },
  });
}

import { NextResponse } from "next/server";
import { queryAlipayTrade } from "@/lib/alipay";
import { requireCandidateApiAccess } from "@/lib/candidate-auth";
import { repo } from "@/lib/repository";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderNo: string }> },
) {
  const access = await requireCandidateApiAccess(request);
  if ("error" in access) {
    return NextResponse.json({ ok: false, error: access.error }, { status: access.status });
  }

  const { orderNo } = await params;
  const order = await repo.findOrderByOrderNo(orderNo);
  if (!order) {
    return NextResponse.json({ ok: false, error: "订单不存在" }, { status: 404 });
  }

  const application = await repo.findApplication(order.applicationId);
  if (!application || application.userId !== access.current.user.id) {
    return NextResponse.json({ ok: false, error: "订单不存在或无权访问" }, { status: 404 });
  }

  if (order.provider === "ALIPAY" && order.status === "PENDING") {
    try {
      const trade = await queryAlipayTrade(order.orderNo);
      const paid = ["TRADE_SUCCESS", "TRADE_FINISHED"].includes(trade.tradeStatus ?? "");

      if (paid) {
        const updated = await repo.markOrderPaid(order.orderNo, {
          provider: "ALIPAY",
          orderNo: order.orderNo,
          tradeNo: trade.tradeNo ?? "",
          tradeStatus: trade.tradeStatus ?? "",
          buyerLogonId: trade.buyerLogonId ?? "",
        });

        return NextResponse.json({ ok: true, data: updated ?? order });
      }
    } catch {
      // 查单失败时继续返回本地订单，避免影响页面展示。
    }
  }

  return NextResponse.json({ ok: true, data: order });
}

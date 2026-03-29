import { NextResponse } from "next/server";
import { repo } from "@/lib/repository";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const body = (await request.json()) as Record<string, string>;
  const { provider } = await params;
  const orderNo = body.orderNo;
  const normalizedProvider = provider.toUpperCase();

  if (!orderNo) {
    return NextResponse.json({ ok: false, error: "缺少订单号" }, { status: 400 });
  }

  if (!["MOCK", "WECHAT", "ALIPAY"].includes(normalizedProvider)) {
    return NextResponse.json({ ok: false, error: "不支持的支付渠道" }, { status: 400 });
  }

  const existingOrder = await repo.findOrderByOrderNo(orderNo);
  if (!existingOrder) {
    return NextResponse.json({ ok: false, error: "订单不存在" }, { status: 404 });
  }

  if (existingOrder.provider !== normalizedProvider) {
    return NextResponse.json({ ok: false, error: "订单支付渠道不匹配" }, { status: 409 });
  }

  if (existingOrder.status === "PAID") {
    return NextResponse.json({ ok: true, data: existingOrder, duplicate: true });
  }

  if (existingOrder.status !== "PENDING") {
    return NextResponse.json({ ok: false, error: "当前订单状态不可执行支付回调" }, { status: 409 });
  }

  const updated = await repo.markOrderPaid(orderNo, { ...body, provider });

  if (!updated) {
    return NextResponse.json({ ok: false, error: "订单不存在" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, data: updated });
}

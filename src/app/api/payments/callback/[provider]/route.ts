import { NextResponse } from "next/server";
import { verifyAlipayParams } from "@/lib/alipay";
import { repo } from "@/lib/repository";

function toRecordFromSearchParams(params: URLSearchParams) {
  return Object.fromEntries(params.entries());
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  const normalizedProvider = provider.toUpperCase();

  if (normalizedProvider === "ALIPAY") {
    const body = toRecordFromSearchParams(new URLSearchParams(await request.text()));
    const alipayOrderNo = body.out_trade_no;

    if (!alipayOrderNo) {
      return new Response("failure", { status: 400 });
    }

    if (!verifyAlipayParams(body)) {
      return new Response("failure", { status: 400 });
    }

    const existingOrder = await repo.findOrderByOrderNo(alipayOrderNo);
    if (!existingOrder || existingOrder.provider !== "ALIPAY") {
      return new Response("failure", { status: 404 });
    }

    if (!["TRADE_SUCCESS", "TRADE_FINISHED"].includes(body.trade_status ?? "")) {
      return new Response("success");
    }

    const updated = await repo.markOrderPaid(alipayOrderNo, { ...body, provider: normalizedProvider });
    return new Response(updated ? "success" : "failure");
  }

  const body = (await request.json()) as Record<string, string>;
  const orderNo = body.orderNo;

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

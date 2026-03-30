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
      await repo.createPaymentCallbackLog({
        provider: "ALIPAY",
        orderNo: "",
        success: false,
        message: "缺少 out_trade_no",
        payload: body,
      });
      return new Response("failure", { status: 400 });
    }

    if (!verifyAlipayParams(body)) {
      await repo.createPaymentCallbackLog({
        provider: "ALIPAY",
        orderNo: alipayOrderNo,
        success: false,
        message: "支付宝验签失败",
        payload: body,
      });
      return new Response("failure", { status: 400 });
    }

    const existingOrder = await repo.findOrderByOrderNo(alipayOrderNo);
    if (!existingOrder || existingOrder.provider !== "ALIPAY") {
      await repo.createPaymentCallbackLog({
        provider: "ALIPAY",
        orderNo: alipayOrderNo,
        success: false,
        message: "订单不存在或渠道不匹配",
        payload: body,
      });
      return new Response("failure", { status: 404 });
    }

    if (!["TRADE_SUCCESS", "TRADE_FINISHED"].includes(body.trade_status ?? "")) {
      await repo.createPaymentCallbackLog({
        provider: "ALIPAY",
        orderNo: alipayOrderNo,
        success: true,
        message: `收到非成功态回调：${body.trade_status ?? "UNKNOWN"}`,
        payload: body,
      });
      return new Response("success");
    }

    const updated = await repo.markOrderPaid(alipayOrderNo, { ...body, provider: normalizedProvider });
    await repo.createPaymentCallbackLog({
      provider: "ALIPAY",
      orderNo: alipayOrderNo,
      success: Boolean(updated),
      message: updated ? "支付回调处理成功" : "支付回调处理失败",
      payload: body,
    });
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
  await repo.createPaymentCallbackLog({
    provider: normalizedProvider as "MOCK" | "WECHAT" | "ALIPAY",
    orderNo,
    success: Boolean(updated),
    message: updated ? "模拟/其他支付回调成功" : "模拟/其他支付回调失败",
    payload: body,
  });

  if (!updated) {
    return NextResponse.json({ ok: false, error: "订单不存在" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, data: updated });
}

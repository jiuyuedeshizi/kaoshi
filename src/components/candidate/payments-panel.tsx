"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import type { Application, PaymentOrder } from "@/lib/types";

export function PaymentsPanel({
  applications,
  orders,
  alipayReady,
}: {
  applications: Application[];
  orders: PaymentOrder[];
  alipayReady: boolean;
}) {
  const router = useRouter();
  const providerOptions = useMemo(
    () => (alipayReady ? (["ALIPAY"] as const) : (["MOCK"] as const)),
    [alipayReady],
  );
  const payableApps = useMemo(
    () => applications.filter((item) => item.status === "APPROVED"),
    [applications],
  );
  const pendingOrders = useMemo(
    () => orders.filter((item) => item.status === "PENDING"),
    [orders],
  );
  const [selectedAppId, setSelectedAppId] = useState(payableApps[0]?.id ?? "");
  const [selectedProvider, setSelectedProvider] = useState<"MOCK" | "ALIPAY">("ALIPAY");
  const currentPendingOrder = useMemo(
    () =>
      pendingOrders.find(
        (item) => item.applicationId === selectedAppId && item.provider === selectedProvider,
      ),
    [pendingOrders, selectedAppId, selectedProvider],
  );
  const paidOrders = useMemo(
    () => orders.filter((item) => item.status === "PAID"),
    [orders],
  );
  const hasActionablePayment = payableApps.length > 0 || pendingOrders.length > 0;
  const [createdOrderNo, setCreatedOrderNo] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [loading, setLoading] = useState<"create" | "pay" | "">("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setSelectedProvider(providerOptions[0]);
  }, [providerOptions]);

  useEffect(() => {
    if (!payableApps.length) {
      setSelectedAppId("");
      return;
    }

    if (!payableApps.some((item) => item.id === selectedAppId)) {
      setSelectedAppId(payableApps[0].id);
    }
  }, [payableApps, selectedAppId]);

  async function loadAlipayQr(orderNo: string) {
    const qrResponse = await fetch(`/api/payments/alipay/qr?orderNo=${encodeURIComponent(orderNo)}`, {
      credentials: "include",
    });
    const qrResult = (await qrResponse.json()) as {
      ok: boolean;
      error?: string;
      data?: { qrCode: string };
    };

    if (!qrResponse.ok || !qrResult.ok || !qrResult.data?.qrCode) {
      throw new Error(qrResult.error ?? "支付宝二维码生成失败。");
    }

    const imageUrl = await QRCode.toDataURL(qrResult.data.qrCode, {
      width: 240,
      margin: 1,
    });

    setQrCodeUrl(imageUrl);
  }

  useEffect(() => {
    if (!createdOrderNo || selectedProvider !== "ALIPAY") {
      return;
    }

    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/payments/alipay/status?orderNo=${encodeURIComponent(createdOrderNo)}`, {
        credentials: "include",
      });

      if (!response.ok) {
        return;
      }

      const result = (await response.json()) as {
        ok: boolean;
        data?: { paid: boolean; tradeStatus?: string };
      };

      if (result.ok && result.data?.paid) {
        window.clearInterval(timer);
        setSuccess("支付宝支付成功，报名状态已更新，可前往准考证页面查看。");
        setCreatedOrderNo("");
        setQrCodeUrl("");
        router.refresh();
      }
    }, 3000);

    return () => window.clearInterval(timer);
  }, [createdOrderNo, router, selectedProvider]);

  async function createOrder() {
    if (!selectedAppId) {
      setError("当前没有可缴费的报名记录。");
      return;
    }

    if (selectedProvider === "ALIPAY" && !alipayReady) {
      setError("支付宝参数尚未配置，暂时无法生成二维码。");
      return;
    }

    setLoading("create");
    setError("");
    setSuccess("");
    setQrCodeUrl("");
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId: selectedAppId, provider: selectedProvider }),
    });
    const result = (await response.json()) as {
      ok: boolean;
      error?: string;
      data?: { orderNo: string };
    };

    if (!response.ok || !result.ok || !result.data) {
      setError(result.error ?? "创建订单失败。");
      setLoading("");
      return;
    }

    setCreatedOrderNo(result.data.orderNo);

    if (selectedProvider === "ALIPAY") {
      try {
        await loadAlipayQr(result.data.orderNo);
      } catch (qrError) {
        setError(qrError instanceof Error ? qrError.message : "支付宝二维码生成失败。");
        setLoading("");
        return;
      }
      setSuccess(`支付宝订单已创建：${result.data.orderNo}，请扫码完成支付。`);
    } else {
      setSuccess(`订单已创建：${result.data.orderNo}`);
    }

    setLoading("");
    router.refresh();
  }

  async function continuePay() {
    if (!currentPendingOrder) {
      setError("当前没有可继续支付的待支付订单。");
      return;
    }

    setLoading("create");
    setError("");
    setSuccess("");
    setCreatedOrderNo(currentPendingOrder.orderNo);

    if (currentPendingOrder.provider === "ALIPAY") {
      try {
        await loadAlipayQr(currentPendingOrder.orderNo);
        setSuccess(`已拉起待支付订单：${currentPendingOrder.orderNo}，请扫码完成支付。`);
      } catch (qrError) {
        setError(qrError instanceof Error ? qrError.message : "支付宝二维码生成失败。");
      } finally {
        setLoading("");
      }
      return;
    }

    setLoading("");
    setSuccess(`已切换到待支付订单：${currentPendingOrder.orderNo}`);
  }

  async function checkPaidNow() {
    if (!createdOrderNo) {
      setError("当前没有待查询的支付宝订单。");
      return;
    }

    setLoading("pay");
    setError("");
    setSuccess("");

    const response = await fetch(`/api/payments/alipay/status?orderNo=${encodeURIComponent(createdOrderNo)}`, {
      credentials: "include",
    });
    const result = (await response.json()) as {
      ok: boolean;
      error?: string;
      data?: { paid: boolean; tradeStatus?: string };
    };

    if (!response.ok || !result.ok) {
      setError(result.error ?? "支付结果查询失败。");
      setLoading("");
      return;
    }

    if (result.data?.paid) {
      setSuccess("支付宝支付成功，报名状态已更新，可前往准考证页面查看。");
      setCreatedOrderNo("");
      setQrCodeUrl("");
      setLoading("");
      router.refresh();
      return;
    }

    setError(`支付宝当前状态：${result.data?.tradeStatus ?? "WAIT_BUYER_PAY"}，请稍后再查。`);
    setLoading("");
  }

  async function payOrder() {
    if (!createdOrderNo) {
      setError("请先创建订单。");
      return;
    }

    setLoading("pay");
    setError("");
    setSuccess("");
    const response = await fetch("/api/payments/callback/MOCK", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNo: createdOrderNo, tradeNo: `MOCK-${Date.now()}` }),
    });
    const result = (await response.json()) as { ok: boolean; error?: string };

    if (!response.ok || !result.ok) {
      setError(result.error ?? "模拟支付失败。");
      setLoading("");
      return;
    }

    setSuccess("支付成功，报名状态已更新，可前往准考证页面查看。");
    setLoading("");
    setCreatedOrderNo("");
    router.refresh();
  }

  return (
    <section className="card payment-workbench">
      <div className="panel-header">
        <h2>当前待处理</h2>
        <span className={`badge ${pendingOrders.length ? "warning" : "success"}`.trim()}>
          {pendingOrders.length ? "有待支付订单" : "已完成全部缴费"}
        </span>
      </div>
      {hasActionablePayment ? (
        <>
          <p className="payment-lead">
            {pendingOrders.length
              ? `当前有 ${pendingOrders.length} 笔待支付订单，请先完成支付。`
              : "请选择需要缴费的报名记录，系统会创建订单并引导您完成支付。"}
          </p>
          <div className="form-grid">
            <div className="field-full">
              <label>报名记录</label>
              <select value={selectedAppId} onChange={(e) => setSelectedAppId(e.target.value)}>
                {payableApps.length ? (
                  payableApps.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.id} / {app.major} / {app.education}
                    </option>
                  ))
                ) : (
                  <option value="">暂无待缴费报名</option>
                )}
              </select>
            </div>
            <div className="field-full">
              <label>支付方式</label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value as "MOCK" | "ALIPAY")}
              >
                {providerOptions.map((provider) => (
                  <option key={provider} value={provider}>
                    {provider === "ALIPAY" ? "支付宝二维码支付" : "演示支付"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      ) : (
        <div className="payment-complete-state">
          <strong>当前没有待缴费报名</strong>
          <p>您已完成全部缴费事项，可直接进入准考证页面查看和下载准考证。</p>
          <div className="actions-row" style={{ marginTop: 16 }}>
            <Link className="button" href="/tickets">
              查看准考证
            </Link>
            {paidOrders.length ? (
              <Link className="button-secondary" href="/dashboard">
                返回个人中心
              </Link>
            ) : null}
          </div>
        </div>
      )}
      {error ? <p style={{ color: "var(--accent)", marginTop: 12 }}>{error}</p> : null}
      {success ? <p style={{ color: "var(--success)", marginTop: 12 }}>{success}</p> : null}
      {currentPendingOrder ? (
        <p className="payment-order-tip" style={{ color: "var(--accent)", marginTop: 12 }}>
          当前报名已有待支付订单：{currentPendingOrder.orderNo}，请继续完成支付，不必重复创建。
        </p>
      ) : null}
      {hasActionablePayment ? (
        <div className="actions-row" style={{ marginTop: 16 }}>
          {currentPendingOrder ? (
            <button className="button" type="button" disabled={!!loading} onClick={() => void continuePay()}>
              {loading === "create" ? "拉起中..." : "继续支付"}
            </button>
          ) : (
            <button className="button" type="button" disabled={!!loading} onClick={() => void createOrder()}>
              {loading === "create" ? "创建中..." : "创建订单"}
            </button>
          )}
          {selectedProvider === "MOCK" ? (
            <button className="button-secondary" type="button" disabled={!!loading || !createdOrderNo} onClick={() => void payOrder()}>
              {loading === "pay" ? "支付中..." : "标记为已支付"}
            </button>
          ) : createdOrderNo ? (
            <button className="button-secondary" type="button" disabled={!!loading} onClick={() => void checkPaidNow()}>
              {loading === "pay" ? "查询中..." : "我已支付，立即查询"}
            </button>
          ) : null}
        </div>
      ) : null}
      {qrCodeUrl ? (
        <div className="status-panel payment-qr-panel" style={{ marginTop: 18 }}>
          <h3>支付宝扫码支付</h3>
          <p>订单号：{createdOrderNo}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrCodeUrl} alt="支付宝支付二维码" style={{ width: 240, height: 240, display: "block" }} />
          <p style={{ marginTop: 12 }}>请使用支付宝扫码，系统会自动轮询支付结果。</p>
        </div>
      ) : null}
      <ul className="timeline" style={{ marginTop: 18 }}>
        <li>仅“审核通过”的报名记录可创建订单，且同一报名不会重复生成待支付订单。</li>
        <li>若支付宝已支付但页面未更新，点击“我已支付，立即查询”即可同步支付结果。</li>
        <li>完成缴费后，可前往准考证页面查看并下载准考证。</li>
      </ul>
    </section>
  );
}

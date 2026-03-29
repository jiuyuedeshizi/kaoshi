"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Application, PaymentOrder } from "@/lib/types";

export function PaymentsPanel({
  applications,
  orders,
}: {
  applications: Application[];
  orders: PaymentOrder[];
}) {
  const router = useRouter();
  const payableApps = useMemo(
    () => applications.filter((item) => item.status === "APPROVED"),
    [applications],
  );
  const pendingOrders = useMemo(
    () => orders.filter((item) => item.status === "PENDING"),
    [orders],
  );
  const [selectedAppId, setSelectedAppId] = useState(payableApps[0]?.id ?? "");
  const [createdOrderNo, setCreatedOrderNo] = useState("");
  const [loading, setLoading] = useState<"create" | "pay" | "">("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function createOrder() {
    if (!selectedAppId) {
      setError("当前没有可缴费的报名记录。");
      return;
    }

    setLoading("create");
    setError("");
    setSuccess("");
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId: selectedAppId, provider: "MOCK" }),
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
    setSuccess(`订单已创建：${result.data.orderNo}`);
    setLoading("");
    router.refresh();
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
    <section className="card">
      <div className="panel-header">
        <h2>缴费操作</h2>
        <span className="badge success">模拟支付闭环</span>
      </div>
      {pendingOrders.length ? (
        <p style={{ marginBottom: 12 }}>
          当前存在 {pendingOrders.length} 笔待支付订单，请优先完成支付，避免重复下单。
        </p>
      ) : null}
      <div className="form-grid">
        <div className="field-full">
          <label>待缴费报名记录</label>
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
      </div>
      {error ? <p style={{ color: "var(--accent)", marginTop: 12 }}>{error}</p> : null}
      {success ? <p style={{ color: "var(--success)", marginTop: 12 }}>{success}</p> : null}
      <div className="actions-row" style={{ marginTop: 16 }}>
        <button className="button" type="button" disabled={!!loading} onClick={() => void createOrder()}>
          {loading === "create" ? "创建中..." : "创建订单"}
        </button>
        <button className="button-secondary" type="button" disabled={!!loading || !createdOrderNo} onClick={() => void payOrder()}>
          {loading === "pay" ? "支付中..." : "模拟支付成功"}
        </button>
      </div>
      <ul className="timeline" style={{ marginTop: 18 }}>
        <li>当前订单数：{orders.length}</li>
        <li>仅“审核通过”的报名记录可创建订单，且同一报名不可重复生成待支付订单。</li>
        <li>支付成功后将自动联动更新报名状态。</li>
      </ul>
    </section>
  );
}

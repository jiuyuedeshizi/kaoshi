"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function AdminSettingsForm({
  initialValue,
}: {
  initialValue?: Record<string, unknown>;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    siteName: String(initialValue?.siteName ?? "邻泰人事考试服务平台"),
    servicePhone: String(initialValue?.servicePhone ?? "0471-1234567"),
    supportPhone: String(initialValue?.supportPhone ?? "0471-7654321"),
    uploadMaxMb: Number(initialValue?.uploadMaxMb ?? 8),
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const response = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: "platform",
        value: form,
      }),
    });
    const result = (await response.json()) as { ok: boolean; error?: string };
    if (!response.ok || !result.ok) {
      setError(result.error ?? "系统设置保存失败。");
      setLoading(false);
      return;
    }

    setSuccess("系统设置已保存。");
    setLoading(false);
    router.refresh();
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="field-full">
        <label>平台名称</label>
        <input value={form.siteName} onChange={(e) => setForm((current) => ({ ...current, siteName: e.target.value }))} />
      </div>
      <div className="field">
        <label>考务咨询电话</label>
        <input value={form.servicePhone} onChange={(e) => setForm((current) => ({ ...current, servicePhone: e.target.value }))} />
      </div>
      <div className="field">
        <label>技术支持电话</label>
        <input value={form.supportPhone} onChange={(e) => setForm((current) => ({ ...current, supportPhone: e.target.value }))} />
      </div>
      <div className="field">
        <label>上传大小限制（MB）</label>
        <input type="number" min={1} value={form.uploadMaxMb} onChange={(e) => setForm((current) => ({ ...current, uploadMaxMb: Number(e.target.value) || 1 }))} />
      </div>
      {error ? <p style={{ color: "var(--accent)" }}>{error}</p> : null}
      {success ? <p style={{ color: "var(--success)" }}>{success}</p> : null}
      <div className="actions-row">
        <button className="button" type="submit" disabled={loading}>{loading ? "保存中..." : "保存设置"}</button>
      </div>
    </form>
  );
}

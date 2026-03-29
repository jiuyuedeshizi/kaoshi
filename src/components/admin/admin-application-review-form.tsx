"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function AdminApplicationReviewForm({ applicationId }: { applicationId?: string }) {
  const router = useRouter();
  const [id, setId] = useState(applicationId ?? "");
  const [status, setStatus] = useState("APPROVED");
  const [reviewNote, setReviewNote] = useState("资料审核通过，可进入缴费环节。");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id) {
      setError("请输入报名单号。");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");

    const response = await fetch(`/api/admin/applications/${id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reviewNote }),
    });
    const result = (await response.json()) as { ok: boolean; error?: string };

    if (!response.ok || !result.ok) {
      setError(result.error ?? "审核失败。");
      setLoading(false);
      return;
    }

    setSuccess("审核结果已提交。");
    setLoading(false);
    router.refresh();
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="field">
        <label>报名单号</label>
        <input value={id} onChange={(e) => setId(e.target.value)} />
      </div>
      <div className="field">
        <label>审核结果</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="APPROVED">审核通过</option>
          <option value="REJECTED">审核驳回</option>
        </select>
      </div>
      <div className="field-full">
        <label>审核意见</label>
        <textarea value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} />
      </div>
      {error ? <p style={{ color: "var(--accent)" }}>{error}</p> : null}
      {success ? <p style={{ color: "var(--success)" }}>{success}</p> : null}
      <div className="actions-row">
        <button className="button" type="submit" disabled={loading}>
          {loading ? "提交中..." : "提交审核"}
        </button>
      </div>
    </form>
  );
}

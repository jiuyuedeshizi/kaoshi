"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function AdminScoreForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    applicationId: "app-1",
    ticketNo: "202605080001",
    idCard: "150101199506121234",
    score: 84.5,
    ranking: 16,
    published: true,
    queryNote: "成绩仅供招聘流程使用，请以官方公示名单为准。",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const response = await fetch("/api/admin/scores/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = (await response.json()) as { ok: boolean; error?: string };

    if (!response.ok || !result.ok) {
      setError(result.error ?? "导入失败。");
      setLoading(false);
      return;
    }

    setSuccess("成绩已导入并刷新列表。");
    setLoading(false);
    router.refresh();
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="field">
        <label>报名单号</label>
        <input value={form.applicationId} onChange={(e) => setForm((p) => ({ ...p, applicationId: e.target.value }))} />
      </div>
      <div className="field">
        <label>准考证号</label>
        <input value={form.ticketNo} onChange={(e) => setForm((p) => ({ ...p, ticketNo: e.target.value }))} />
      </div>
      <div className="field">
        <label>成绩</label>
        <input type="number" value={form.score} onChange={(e) => setForm((p) => ({ ...p, score: Number(e.target.value) }))} />
      </div>
      <div className="field">
        <label>排名</label>
        <input type="number" value={form.ranking} onChange={(e) => setForm((p) => ({ ...p, ranking: Number(e.target.value) }))} />
      </div>
      <div className="field-full">
        <label>查询说明</label>
        <textarea value={form.queryNote} onChange={(e) => setForm((p) => ({ ...p, queryNote: e.target.value }))} />
      </div>
      {error ? <p style={{ color: "var(--accent)" }}>{error}</p> : null}
      {success ? <p style={{ color: "var(--success)" }}>{success}</p> : null}
      <div className="actions-row">
        <button className="button" type="submit" disabled={loading}>
          {loading ? "导入中..." : "导入并发布"}
        </button>
      </div>
    </form>
  );
}

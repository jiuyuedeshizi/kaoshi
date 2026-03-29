"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const initialForm = {
  title: "2026 年笔试报名系统维护通知",
  category: "系统通知",
  summary: "系统将于今晚 22:00 至 23:00 进行短时维护，届时暂停报名与缴费服务。",
  body: "请考生合理安排报名和缴费时间，维护结束后平台将恢复正常访问。",
  pinned: false,
};

export function AdminNoticeForm() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const response = await fetch("/api/admin/notices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const result = (await response.json()) as { ok: boolean; error?: string };

    if (!response.ok || !result.ok) {
      setError(result.error ?? "发布失败，请稍后重试。");
      setLoading(false);
      return;
    }

    setSuccess("公告已发布，首页公告列表已更新。");
    setLoading(false);
    router.refresh();
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="field">
        <label>公告标题</label>
        <input
          value={form.title}
          onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
        />
      </div>
      <div className="field">
        <label>公告分类</label>
        <input
          value={form.category}
          onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
        />
      </div>
      <div className="field-full">
        <label>摘要</label>
        <textarea
          value={form.summary}
          onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))}
        />
      </div>
      <div className="field-full">
        <label>正文</label>
        <textarea
          value={form.body}
          onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))}
        />
      </div>
      <div className="field-full">
        <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            type="checkbox"
            checked={form.pinned}
            onChange={(event) => setForm((prev) => ({ ...prev, pinned: event.target.checked }))}
            style={{ minHeight: 18, width: 18 }}
          />
          置顶公告
        </label>
      </div>
      {error ? <p style={{ color: "var(--accent)" }}>{error}</p> : null}
      {success ? <p style={{ color: "var(--success)" }}>{success}</p> : null}
      <div className="actions-row">
        <button className="button" type="submit" disabled={loading}>
          {loading ? "发布中..." : "发布公告"}
        </button>
      </div>
    </form>
  );
}

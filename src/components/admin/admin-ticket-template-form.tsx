"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import type { TicketTemplate } from "@/lib/types";

export function AdminTicketTemplateForm({ template }: { template?: TicketTemplate | null }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: template?.name ?? "默认准考证模板",
    title: template?.title ?? "",
    subtitle: template?.subtitle ?? "准考证",
    noticeItems: (template?.noticeItems ?? []).join("\n"),
    showPhoto: template?.showPhoto ?? true,
    showEthnicity: template?.showEthnicity ?? true,
    showJobCode: template?.showJobCode ?? true,
    showExamSubject: template?.showExamSubject ?? true,
    isDefault: true,
    version: template?.version ?? "v2",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const response = await fetch("/api/admin/tickets/template", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        noticeItems: form.noticeItems.split("\n").map((item) => item.trim()).filter(Boolean),
      }),
    });
    const result = (await response.json()) as { ok: boolean; error?: string };
    if (!response.ok || !result.ok) {
      setError(result.error ?? "模板保存失败。");
      setLoading(false);
      return;
    }

    setSuccess("准考证模板已保存。");
    setLoading(false);
    router.refresh();
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="field">
        <label>模板名称</label>
        <input value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} />
      </div>
      <div className="field">
        <label>模板版本</label>
        <input value={form.version} onChange={(e) => setForm((current) => ({ ...current, version: e.target.value }))} />
      </div>
      <div className="field-full">
        <label>主标题</label>
        <input value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} />
      </div>
      <div className="field-full">
        <label>副标题</label>
        <input value={form.subtitle} onChange={(e) => setForm((current) => ({ ...current, subtitle: e.target.value }))} />
      </div>
      <div className="field-full">
        <label>注意事项</label>
        <textarea rows={10} value={form.noticeItems} onChange={(e) => setForm((current) => ({ ...current, noticeItems: e.target.value }))} />
      </div>
      <div className="field">
        <label><input type="checkbox" checked={form.showPhoto} onChange={(e) => setForm((current) => ({ ...current, showPhoto: e.target.checked }))} style={{ marginRight: 8 }} />显示照片</label>
      </div>
      <div className="field">
        <label><input type="checkbox" checked={form.showEthnicity} onChange={(e) => setForm((current) => ({ ...current, showEthnicity: e.target.checked }))} style={{ marginRight: 8 }} />显示民族</label>
      </div>
      <div className="field">
        <label><input type="checkbox" checked={form.showJobCode} onChange={(e) => setForm((current) => ({ ...current, showJobCode: e.target.checked }))} style={{ marginRight: 8 }} />显示岗位代码</label>
      </div>
      <div className="field">
        <label><input type="checkbox" checked={form.showExamSubject} onChange={(e) => setForm((current) => ({ ...current, showExamSubject: e.target.checked }))} style={{ marginRight: 8 }} />显示考试科目</label>
      </div>
      {error ? <p style={{ color: "var(--accent)" }}>{error}</p> : null}
      {success ? <p style={{ color: "var(--success)" }}>{success}</p> : null}
      <div className="actions-row">
        <button className="button" type="submit" disabled={loading}>{loading ? "保存中..." : "保存模板"}</button>
      </div>
    </form>
  );
}

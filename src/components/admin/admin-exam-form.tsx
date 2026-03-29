"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const initialForm = {
  slug: "2026-new-exam",
  title: "2026 年示例考试项目",
  category: "事业单位",
  location: "呼和浩特考区",
  description: "这里填写项目简介、岗位范围、报名规则和资格要求。",
  fee: 95,
  registrationStart: "2026-04-01 09:00",
  registrationEnd: "2026-04-10 17:00",
  reviewEnd: "2026-04-12 18:00",
  paymentEnd: "2026-04-14 18:00",
  ticketStart: "2026-05-08 09:00",
  scoreReleaseAt: "2026-05-28 10:00",
  admissionNotice: "请按要求上传报名材料并保证信息真实有效。",
};

export function AdminExamForm() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const response = await fetch("/api/admin/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = (await response.json()) as { ok: boolean; error?: string };

    if (!response.ok || !result.ok) {
      setError(result.error ?? "保存项目失败。");
      setLoading(false);
      return;
    }

    setSuccess("考试项目已创建。");
    setLoading(false);
    router.refresh();
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="field">
        <label>项目标识</label>
        <input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} />
      </div>
      <div className="field">
        <label>考试标题</label>
        <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
      </div>
      <div className="field">
        <label>考试类别</label>
        <input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} />
      </div>
      <div className="field">
        <label>考区</label>
        <input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
      </div>
      <div className="field">
        <label>报名费</label>
        <input type="number" value={form.fee} onChange={(e) => setForm((p) => ({ ...p, fee: Number(e.target.value) }))} />
      </div>
      <div className="field">
        <label>报名开始</label>
        <input value={form.registrationStart} onChange={(e) => setForm((p) => ({ ...p, registrationStart: e.target.value }))} />
      </div>
      <div className="field-full">
        <label>项目说明</label>
        <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
      </div>
      <div className="field-full">
        <label>报考须知</label>
        <textarea value={form.admissionNotice} onChange={(e) => setForm((p) => ({ ...p, admissionNotice: e.target.value }))} />
      </div>
      {error ? <p style={{ color: "var(--accent)" }}>{error}</p> : null}
      {success ? <p style={{ color: "var(--success)" }}>{success}</p> : null}
      <div className="actions-row">
        <button className="button" type="submit" disabled={loading}>
          {loading ? "保存中..." : "保存项目"}
        </button>
      </div>
    </form>
  );
}

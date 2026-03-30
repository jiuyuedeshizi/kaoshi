"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import type { ExamArea, ExamProject } from "@/lib/types";

export function AdminSchedulingForm({
  exams,
  areas,
}: {
  exams: ExamProject[];
  areas: ExamArea[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    examProjectId: exams[0]?.id ?? "",
    areaId: areas[0]?.id ?? "",
    regenerate: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const response = await fetch("/api/admin/scheduling/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = (await response.json()) as { ok: boolean; error?: string; data?: { count: number } };
    if (!response.ok || !result.ok) {
      setError(result.error ?? "编排失败。");
      setLoading(false);
      return;
    }

    setSuccess(`编排完成，已生成或更新 ${result.data?.count ?? 0} 份准考证。`);
    setLoading(false);
    router.refresh();
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="field">
        <label>考试项目</label>
        <select value={form.examProjectId} onChange={(e) => setForm((current) => ({ ...current, examProjectId: e.target.value }))}>
          {exams.map((exam) => <option key={exam.id} value={exam.id}>{exam.title}</option>)}
        </select>
      </div>
      <div className="field">
        <label>编排考区</label>
        <select value={form.areaId} onChange={(e) => setForm((current) => ({ ...current, areaId: e.target.value }))}>
          {areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}
        </select>
      </div>
      <div className="field-full">
        <label>
          <input
            type="checkbox"
            checked={form.regenerate}
            onChange={(e) => setForm((current) => ({ ...current, regenerate: e.target.checked }))}
            style={{ marginRight: 8 }}
          />
          已有准考证时允许重新编排
        </label>
      </div>
      {error ? <p style={{ color: "var(--accent)" }}>{error}</p> : null}
      {success ? <p style={{ color: "var(--success)" }}>{success}</p> : null}
      <div className="actions-row">
        <button className="button" type="submit" disabled={loading || !exams.length || !areas.length}>
          {loading ? "编排中..." : "执行编排"}
        </button>
      </div>
    </form>
  );
}

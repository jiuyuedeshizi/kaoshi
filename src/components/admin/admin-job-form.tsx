"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import type { ExamProject } from "@/lib/types";

export function AdminJobForm({ exams }: { exams: ExamProject[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    examProjectId: exams[0]?.id ?? "",
    code: "",
    name: "",
    quota: 1,
    organization: "",
    examSubject: "",
    majorRequirement: "",
    educationRequirement: "本科及以上",
    degreeRequirement: "",
    ageRequirement: "",
    genderRequirement: "",
    householdRequirement: "",
    experienceRequirement: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const response = await fetch("/api/admin/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        quota: Number(form.quota),
      }),
    });

    const result = (await response.json()) as { ok: boolean; error?: string };
    if (!response.ok || !result.ok) {
      setError(result.error ?? "岗位保存失败。");
      setLoading(false);
      return;
    }

    setSuccess("岗位已创建。");
    setForm((current) => ({
      ...current,
      code: "",
      name: "",
      organization: "",
      examSubject: "",
      majorRequirement: "",
      degreeRequirement: "",
      ageRequirement: "",
      genderRequirement: "",
      householdRequirement: "",
      experienceRequirement: "",
      notes: "",
    }));
    setLoading(false);
    router.refresh();
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="field-full">
        <label>所属考试项目</label>
        <select value={form.examProjectId} onChange={(e) => setForm((current) => ({ ...current, examProjectId: e.target.value }))}>
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.title}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>岗位代码</label>
        <input value={form.code} onChange={(e) => setForm((current) => ({ ...current, code: e.target.value }))} />
      </div>
      <div className="field">
        <label>岗位名称</label>
        <input value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} />
      </div>
      <div className="field">
        <label>招录人数</label>
        <input type="number" min={1} value={form.quota} onChange={(e) => setForm((current) => ({ ...current, quota: Number(e.target.value) || 1 }))} />
      </div>
      <div className="field">
        <label>所属单位</label>
        <input value={form.organization} onChange={(e) => setForm((current) => ({ ...current, organization: e.target.value }))} />
      </div>
      <div className="field-full">
        <label>考试科目</label>
        <input value={form.examSubject} onChange={(e) => setForm((current) => ({ ...current, examSubject: e.target.value }))} />
      </div>
      <div className="field">
        <label>专业要求</label>
        <input value={form.majorRequirement} onChange={(e) => setForm((current) => ({ ...current, majorRequirement: e.target.value }))} />
      </div>
      <div className="field">
        <label>学历要求</label>
        <input value={form.educationRequirement} onChange={(e) => setForm((current) => ({ ...current, educationRequirement: e.target.value }))} />
      </div>
      <div className="field">
        <label>学位要求</label>
        <input value={form.degreeRequirement} onChange={(e) => setForm((current) => ({ ...current, degreeRequirement: e.target.value }))} />
      </div>
      <div className="field">
        <label>年龄要求</label>
        <input value={form.ageRequirement} onChange={(e) => setForm((current) => ({ ...current, ageRequirement: e.target.value }))} />
      </div>
      <div className="field">
        <label>性别要求</label>
        <input value={form.genderRequirement} onChange={(e) => setForm((current) => ({ ...current, genderRequirement: e.target.value }))} />
      </div>
      <div className="field">
        <label>户籍要求</label>
        <input value={form.householdRequirement} onChange={(e) => setForm((current) => ({ ...current, householdRequirement: e.target.value }))} />
      </div>
      <div className="field-full">
        <label>工作经验要求</label>
        <input value={form.experienceRequirement} onChange={(e) => setForm((current) => ({ ...current, experienceRequirement: e.target.value }))} />
      </div>
      <div className="field-full">
        <label>岗位备注</label>
        <textarea value={form.notes} onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))} />
      </div>
      {error ? <p style={{ color: "var(--accent)" }}>{error}</p> : null}
      {success ? <p style={{ color: "var(--success)" }}>{success}</p> : null}
      <div className="actions-row">
        <button className="button" type="submit" disabled={loading || !exams.length}>
          {loading ? "保存中..." : "保存岗位"}
        </button>
      </div>
    </form>
  );
}

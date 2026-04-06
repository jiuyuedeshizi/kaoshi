"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function ExamRegisterForm({ examId }: { examId: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    idCard: "",
    password: "",
    gender: "男",
    ethnicity: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = (await response.json()) as { ok: boolean; error?: string };

    if (!response.ok || !result.ok) {
      setError(result.error ?? "注册失败，请检查信息。");
      setLoading(false);
      return;
    }

    setSuccess("注册成功，正在跳转登录页。");
    setTimeout(() => {
      router.replace(`/exam/${examId}/login`);
    }, 600);
  }

  return (
    <form onSubmit={handleSubmit} className="exam-register-form">
      <div className="form-item">
        <label>真实姓名</label>
        <input
          type="text"
          placeholder="请输入真实姓名"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          required
        />
      </div>

      <div className="form-item">
        <label>手机号</label>
        <input
          type="tel"
          placeholder="请输入手机号"
          value={form.phone}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          required
        />
      </div>

      <div className="form-item">
        <label>身份证号</label>
        <input
          type="text"
          placeholder="请输入18位身份证号"
          value={form.idCard}
          onChange={(e) => setForm((p) => ({ ...p, idCard: e.target.value }))}
          required
          pattern="[0-9]{17}[0-9X]"
        />
      </div>

      <div className="form-item">
        <label>登录密码</label>
        <input
          type="password"
          placeholder="请设置登录密码"
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          required
          minLength={6}
        />
      </div>

      <div className="form-row">
        <div className="form-item">
          <label>性别</label>
          <select
            value={form.gender}
            onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
          >
            <option value="男">男</option>
            <option value="女">女</option>
          </select>
        </div>

        <div className="form-item">
          <label>民族</label>
          <input
            type="text"
            placeholder="如：汉族"
            value={form.ethnicity}
            onChange={(e) => setForm((p) => ({ ...p, ethnicity: e.target.value }))}
          />
        </div>
      </div>

      <div className="form-notice">
        <p>注册后将建立个人考生档案，报名时自动带入实名信息、证件信息与联系方式。后续可补充学历、住址和紧急联系人。</p>
      </div>

      {error ? <p className="error-message">{error}</p> : null}
      {success ? <p className="success-message">{success}</p> : null}

      <button type="submit" className="register-btn" disabled={loading}>
        {loading ? "提交中..." : "提交注册"}
      </button>
    </form>
  );
}

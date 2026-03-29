"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function CandidateRegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "张晓明",
    phone: "13800000001",
    idCard: "150101199506121234",
    password: "123456",
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
      router.replace("/login");
    }, 600);
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="field">
        <label>真实姓名</label>
        <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
      </div>
      <div className="field">
        <label>手机号</label>
        <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
      </div>
      <div className="field">
        <label>身份证号</label>
        <input value={form.idCard} onChange={(e) => setForm((p) => ({ ...p, idCard: e.target.value }))} />
      </div>
      <div className="field">
        <label>登录密码</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
        />
      </div>
      <div className="field-full">
        <label>注册说明</label>
        <textarea
          readOnly
          value="注册后将建立个人考生档案，报名时自动带入实名信息、证件信息与联系方式。后续可补充学历、住址和紧急联系人。"
        />
      </div>
      {error ? <p style={{ color: "var(--accent)" }}>{error}</p> : null}
      {success ? <p style={{ color: "var(--success)" }}>{success}</p> : null}
      <div className="actions-row">
        <button className="button" type="submit" disabled={loading}>
          {loading ? "提交中..." : "提交注册"}
        </button>
      </div>
    </form>
  );
}

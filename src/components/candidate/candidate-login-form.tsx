"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function CandidateLoginForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [account, setAccount] = useState("13800000001");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account, password }),
    });

    const result = (await response.json()) as { ok: boolean; error?: string };

    if (!response.ok || !result.ok) {
      setError(result.error ?? "登录失败，请检查账号或密码。");
      setLoading(false);
      return;
    }

    router.replace(nextPath || "/dashboard");
    router.refresh();
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="field-full">
        <label>手机号 / 身份证号</label>
        <input
          placeholder="13800000001 或 150101199506121234"
          value={account}
          onChange={(event) => setAccount(event.target.value)}
        />
      </div>
      <div className="field-full">
        <label>密码</label>
        <input
          type="password"
          placeholder="请输入密码"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      {error ? <p style={{ color: "var(--accent)" }}>{error}</p> : null}
      <div className="actions-row">
        <button className="button" type="submit" disabled={loading}>
          {loading ? "登录中..." : "登录系统"}
        </button>
      </div>
    </form>
  );
}

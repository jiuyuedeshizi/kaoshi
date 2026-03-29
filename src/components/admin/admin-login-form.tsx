"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function AdminLoginForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [account, setAccount] = useState("13800000099");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account, password }),
    });

    const result = (await response.json()) as { ok: boolean; error?: string };

    if (!response.ok || !result.ok) {
      setError(result.error ?? "登录失败，请检查账号信息。");
      setLoading(false);
      return;
    }

    const next = nextPath || "/admin";
    router.replace(next);
    router.refresh();
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="field-full">
        <label>管理员账号</label>
        <input value={account} onChange={(event) => setAccount(event.target.value)} />
      </div>
      <div className="field-full">
        <label>登录密码</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      {error ? <p style={{ color: "var(--accent)" }}>{error}</p> : null}
      <div className="actions-row">
        <button className="button" type="submit" disabled={loading}>
          {loading ? "登录中..." : "进入后台"}
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ExamLoginForm({
  examId,
  nextPath,
}: {
  examId: string;
  nextPath?: string;
}) {
  const router = useRouter();
  const [idCard, setIdCard] = useState("");
  const [password, setPassword] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyImage, setVerifyImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 刷新验证码
  const refreshCode = () => {
    setVerifyImage(`/api/captcha?exam=${examId}&t=${Date.now()}`);
  };

  // 初始化验证码
  if (!verifyImage) {
    refreshCode();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_card: idCard, password, verify_code: verifyCode }),
      });

      const data = await res.json();

      if (data.ok) {
        router.push(nextPath || `/exams`);
      } else {
        setError(data.error || "登录失败");
        refreshCode();
      }
    } catch {
      setError("登录服务暂时不可用");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="exam-login-form">
      <div className="form-item">
        <img src="/images/card-icon.png" alt="" />
        <input
          type="text"
          placeholder="请输入身份证号"
          value={idCard}
          onChange={(e) => setIdCard(e.target.value)}
          required
        />
      </div>

      <div className="form-item">
        <img src="/images/pass-ico.jpg" alt="" />
        <input
          type="password"
          placeholder="请输入密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="form-item verify-code">
        <img src="/images/code-icon.png" alt="" />
        <input
          type="text"
          placeholder="验证码"
          value={verifyCode}
          onChange={(e) => setVerifyCode(e.target.value)}
          required
        />
        <img
          src={verifyImage}
          alt="验证码"
          onClick={refreshCode}
          className="verify-image"
        />
      </div>

      {error && <p className="error-message">{error}</p>}

      <button type="submit" className="login-btn" disabled={loading}>
        {loading ? "登录中..." : "登 录"}
      </button>
    </form>
  );
}

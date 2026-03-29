"use client";

import { FormEvent, useState } from "react";
import type { ScoreRecord } from "@/lib/types";

export function ScoreQueryForm() {
  const [ticketNo, setTicketNo] = useState("202605080001");
  const [idCard, setIdCard] = useState("150101199506121234");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ScoreRecord | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    if (!ticketNo.trim() && !idCard.trim()) {
      setError("请至少输入准考证号或身份证号。");
      setLoading(false);
      return;
    }

    const params = new URLSearchParams();
    if (ticketNo) params.set("ticketNo", ticketNo);
    if (idCard) params.set("idCard", idCard);

    const response = await fetch(`/api/scores/query?${params.toString()}`);
    const data = (await response.json()) as { ok: boolean; error?: string; data?: ScoreRecord };

    if (!response.ok || !data.ok || !data.data) {
      setError(data.error ?? "未查询到成绩。");
      setLoading(false);
      return;
    }

    setResult(data.data);
    setLoading(false);
  }

  return (
    <div className="cards-2">
      <section className="card">
        <div className="panel-header">
          <h2>查询条件</h2>
          <span className="badge">API: /api/scores/query</span>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label>准考证号</label>
            <input value={ticketNo} onChange={(e) => setTicketNo(e.target.value)} />
          </div>
          <div className="field">
            <label>身份证号</label>
            <input value={idCard} onChange={(e) => setIdCard(e.target.value)} />
          </div>
          <div className="actions-row">
            <button className="button" type="submit" disabled={loading}>
              {loading ? "查询中..." : "查询成绩"}
            </button>
          </div>
        </form>
      </section>
      <section className="status-panel">
        <div className="panel-header">
          <h2>查询结果</h2>
          <span className={`badge ${result ? "success" : "warning"}`.trim()}>
            {result ? "查询成功" : "等待查询"}
          </span>
        </div>
        {error ? <p style={{ color: "var(--accent)" }}>{error}</p> : null}
        {result ? (
          <>
            <div className="kpi">
              <span className="caption">成绩</span>
              <strong>{result.score}</strong>
              <span className="muted">排名：{result.ranking ?? "-"}</span>
            </div>
            <p>{result.queryNote}</p>
          </>
        ) : (
          <p>请输入准考证号或身份证号后进行查询。若成绩暂未发布，系统会返回明确提示。</p>
        )}
      </section>
    </div>
  );
}

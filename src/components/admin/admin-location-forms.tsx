"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ExamArea, ExamVenue } from "@/lib/types";

export function AdminLocationForms({
  areas,
  venues,
}: {
  areas: ExamArea[];
  venues: ExamVenue[];
}) {
  const router = useRouter();
  const [areaForm, setAreaForm] = useState({ code: "", name: "" });
  const [venueForm, setVenueForm] = useState({ areaId: areas[0]?.id ?? "", code: "", name: "", address: "" });
  const [roomForm, setRoomForm] = useState({ venueId: venues[0]?.id ?? "", name: "", capacity: 30 });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<"" | "area" | "venue" | "room">("");

  async function submit(path: string, body: Record<string, unknown>, type: "area" | "venue" | "room") {
    setLoading(type);
    setError("");
    setMessage("");
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = (await response.json()) as { ok: boolean; error?: string };
    if (!response.ok || !result.ok) {
      setError(result.error ?? "保存失败。");
      setLoading("");
      return;
    }
    setMessage("保存成功。");
    setLoading("");
    router.refresh();
  }

  return (
    <div className="content-stack">
      <form className="form-grid" onSubmit={(e) => {
        e.preventDefault();
        void submit("/api/admin/exam-areas", areaForm, "area");
      }}>
        <div className="field">
          <label>新增考区编码</label>
          <input value={areaForm.code} onChange={(e) => setAreaForm((current) => ({ ...current, code: e.target.value }))} />
        </div>
        <div className="field">
          <label>新增考区名称</label>
          <input value={areaForm.name} onChange={(e) => setAreaForm((current) => ({ ...current, name: e.target.value }))} />
        </div>
        <div className="actions-row">
          <button className="button" type="submit" disabled={loading === "area"}>{loading === "area" ? "保存中..." : "新增考区"}</button>
        </div>
      </form>

      <form className="form-grid" onSubmit={(e) => {
        e.preventDefault();
        void submit("/api/admin/exam-venues", venueForm, "venue");
      }}>
        <div className="field">
          <label>所属考区</label>
          <select value={venueForm.areaId} onChange={(e) => setVenueForm((current) => ({ ...current, areaId: e.target.value }))}>
            {areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label>考点编码</label>
          <input value={venueForm.code} onChange={(e) => setVenueForm((current) => ({ ...current, code: e.target.value }))} />
        </div>
        <div className="field">
          <label>考点名称</label>
          <input value={venueForm.name} onChange={(e) => setVenueForm((current) => ({ ...current, name: e.target.value }))} />
        </div>
        <div className="field-full">
          <label>考点地址</label>
          <input value={venueForm.address} onChange={(e) => setVenueForm((current) => ({ ...current, address: e.target.value }))} />
        </div>
        <div className="actions-row">
          <button className="button-secondary" type="submit" disabled={loading === "venue" || !areas.length}>{loading === "venue" ? "保存中..." : "新增考点"}</button>
        </div>
      </form>

      <form className="form-grid" onSubmit={(e) => {
        e.preventDefault();
        void submit("/api/admin/exam-rooms", { ...roomForm, capacity: Number(roomForm.capacity) }, "room");
      }}>
        <div className="field">
          <label>所属考点</label>
          <select value={roomForm.venueId} onChange={(e) => setRoomForm((current) => ({ ...current, venueId: e.target.value }))}>
            {venues.map((venue) => <option key={venue.id} value={venue.id}>{venue.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label>考场名称</label>
          <input value={roomForm.name} onChange={(e) => setRoomForm((current) => ({ ...current, name: e.target.value }))} />
        </div>
        <div className="field">
          <label>容纳人数</label>
          <input type="number" min={1} value={roomForm.capacity} onChange={(e) => setRoomForm((current) => ({ ...current, capacity: Number(e.target.value) || 1 }))} />
        </div>
        <div className="actions-row">
          <button className="button-secondary" type="submit" disabled={loading === "room" || !venues.length}>{loading === "room" ? "保存中..." : "新增考场"}</button>
        </div>
      </form>

      {error ? <p style={{ color: "var(--accent)" }}>{error}</p> : null}
      {message ? <p style={{ color: "var(--success)" }}>{message}</p> : null}
    </div>
  );
}

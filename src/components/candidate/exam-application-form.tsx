"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import type { Application } from "@/lib/types";

interface UploadedAsset {
  url: string;
  name: string;
}

export function ExamApplicationForm({
  examProjectId,
  admissionNotice,
  initialApplication,
}: {
  examProjectId: string;
  admissionNotice: string;
  initialApplication?: Application;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    major: initialApplication?.major ?? "行政管理",
    education: initialApplication?.education ?? "本科",
    employer: initialApplication?.employer ?? "青城人力服务有限公司",
    photoUrl: initialApplication?.photoUrl ?? "",
    photoName: initialApplication?.photoUrl?.split("/").pop() ?? "",
    documents: (initialApplication?.documents ?? []).map((url) => ({
      url,
      name: url.split("/").pop() ?? url,
    })),
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState<"draft" | "submit" | "">("");
  const [uploading, setUploading] = useState<"" | "photo" | "documents">("");

  async function uploadFile(file: File, kind: "photo" | "document") {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("kind", kind);

    const response = await fetch("/api/uploads", {
      method: "POST",
      body: formData,
    });

    const result = (await response.json()) as {
      ok: boolean;
      error?: string;
      data?: UploadedAsset;
    };

    if (!response.ok || !result.ok || !result.data) {
      throw new Error(result.error ?? "文件上传失败。");
    }

    return result.data;
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError("");
    setSuccess("");
    setUploading("photo");

    try {
      const uploaded = await uploadFile(file, "photo");
      setForm((current) => ({
        ...current,
        photoUrl: uploaded.url,
        photoName: uploaded.name,
      }));
      setSuccess("证件照上传成功。");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "证件照上传失败。");
    } finally {
      setUploading("");
      event.target.value = "";
    }
  }

  async function handleDocumentChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }

    setError("");
    setSuccess("");
    setUploading("documents");

    try {
      const uploadedItems: UploadedAsset[] = [];
      for (const file of files) {
        uploadedItems.push(await uploadFile(file, "document"));
      }

      setForm((current) => ({
        ...current,
        documents: [...current.documents, ...uploadedItems],
      }));
      setSuccess(`已上传 ${uploadedItems.length} 份报名材料。`);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "报名材料上传失败。");
    } finally {
      setUploading("");
      event.target.value = "";
    }
  }

  function removeDocument(url: string) {
    setForm((current) => ({
      ...current,
      documents: current.documents.filter((item) => item.url !== url),
    }));
  }

  async function handleSave(mode: "draft" | "submit") {
    setLoading(mode);
    setError("");
    setSuccess("");

    const createResponse = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        examProjectId,
        major: form.major,
        education: form.education,
        employer: form.employer,
        photoUrl: form.photoUrl || undefined,
        documents: form.documents.map((item) => item.url),
      }),
    });

    const createResult = (await createResponse.json()) as {
      ok: boolean;
      error?: string;
      data?: { id: string };
    };

    if (!createResponse.ok || !createResult.ok || !createResult.data) {
      setError(createResult.error ?? "报名保存失败。");
      setLoading("");
      return;
    }

    if (mode === "draft") {
      setSuccess(
        initialApplication ? "报名草稿已更新，可在个人中心继续编辑。" : "报名草稿已保存，可在个人中心继续编辑。",
      );
      setLoading("");
      router.refresh();
      return;
    }

    const submitResponse = await fetch(`/api/applications/${createResult.data.id}/submit`, {
      method: "POST",
    });
    const submitResult = (await submitResponse.json()) as { ok: boolean; error?: string };

    if (!submitResponse.ok || !submitResult.ok) {
      setError(submitResult.error ?? "提交审核失败。");
      setLoading("");
      return;
    }

    setSuccess("报名已提交审核，正在进入个人中心。");
    setLoading("");
    setTimeout(() => {
      router.replace("/dashboard");
    }, 600);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleSave("submit");
  }

  return (
    <form className="form-grid" onSubmit={onSubmit}>
      <div className="field">
        <label>报考专业 / 岗位</label>
        <input value={form.major} onChange={(e) => setForm((p) => ({ ...p, major: e.target.value }))} />
      </div>
      <div className="field">
        <label>最高学历</label>
        <select value={form.education} onChange={(e) => setForm((p) => ({ ...p, education: e.target.value }))}>
          <option>本科</option>
          <option>硕士研究生</option>
          <option>博士研究生</option>
        </select>
      </div>
      <div className="field">
        <label>工作单位</label>
        <input value={form.employer} onChange={(e) => setForm((p) => ({ ...p, employer: e.target.value }))} />
      </div>
      <div className="field">
        <label>证件照</label>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          onChange={(event) => void handlePhotoChange(event)}
        />
        <small className="field-hint">
          {uploading === "photo"
            ? "证件照上传中..."
            : form.photoUrl
              ? `已上传：${form.photoName || form.photoUrl}`
              : "支持 JPG、JPEG、PNG，大小不超过 3MB。"}
        </small>
        {form.photoUrl ? (
          <a className="inline-link" href={form.photoUrl} target="_blank" rel="noreferrer">
            查看已上传证件照
          </a>
        ) : null}
      </div>
      <div className="field-full">
        <label>报名材料上传</label>
        <input
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,image/jpeg,image/png,application/pdf"
          onChange={(event) => void handleDocumentChange(event)}
        />
        <small className="field-hint">
          {uploading === "documents"
            ? "报名材料上传中..."
            : "支持 JPG、PNG、PDF、DOC、DOCX，单个文件不超过 8MB。"}
        </small>
        <div className="upload-list">
          {form.documents.length ? (
            form.documents.map((item) => (
              <div className="upload-item" key={item.url}>
                <a className="inline-link" href={item.url} target="_blank" rel="noreferrer">
                  {item.name}
                </a>
                <button className="button-ghost" type="button" onClick={() => removeDocument(item.url)}>
                  移除
                </button>
              </div>
            ))
          ) : (
            <p className="empty-copy">尚未上传报名材料。</p>
          )}
        </div>
      </div>
      <div className="field-full">
        <label>报考须知</label>
        <textarea readOnly value={admissionNotice} />
      </div>
      {initialApplication ? (
        <p className="muted">当前正在编辑已有报名记录：{initialApplication.id}</p>
      ) : null}
      {error ? <p style={{ color: "var(--accent)" }}>{error}</p> : null}
      {success ? <p style={{ color: "var(--success)" }}>{success}</p> : null}
      <div className="actions-row">
        <button
          className="button-secondary"
          type="button"
          disabled={!!loading || !!uploading}
          onClick={() => void handleSave("draft")}
        >
          {loading === "draft" ? "保存中..." : "保存草稿"}
        </button>
        <button className="button" type="submit" disabled={!!loading || !!uploading}>
          {loading === "submit" ? "提交中..." : "提交审核"}
        </button>
      </div>
    </form>
  );
}

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const MAX_PHOTO_SIZE = 3 * 1024 * 1024;
const MAX_DOCUMENT_SIZE = 8 * 1024 * 1024;

function sanitizeSegment(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "file"
  );
}

function getAllowedExtensions(kind: "photo" | "document") {
  if (kind === "photo") {
    return [".jpg", ".jpeg", ".png"];
  }

  return [".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx"];
}

export function validateUpload(file: File, kind: "photo" | "document") {
  const extension = path.extname(file.name).toLowerCase();
  const allowedExtensions = getAllowedExtensions(kind);
  const maxSize = kind === "photo" ? MAX_PHOTO_SIZE : MAX_DOCUMENT_SIZE;

  if (!allowedExtensions.includes(extension)) {
    return {
      ok: false as const,
      error:
        kind === "photo"
          ? "证件照仅支持 JPG、JPEG、PNG 格式。"
          : "报名材料仅支持 JPG、JPEG、PNG、PDF、DOC、DOCX 格式。",
    };
  }

  if (file.size > maxSize) {
    return {
      ok: false as const,
      error: kind === "photo" ? "证件照大小不能超过 3MB。" : "单个报名材料大小不能超过 8MB。",
    };
  }

  return { ok: true as const };
}

export async function saveUpload(params: {
  file: File;
  userId: string;
  kind: "photo" | "document";
}) {
  const extension = path.extname(params.file.name).toLowerCase();
  const safeBase = sanitizeSegment(path.basename(params.file.name, extension));
  const filename = `${Date.now()}-${safeBase}${extension}`;
  const directory = path.join(
    process.cwd(),
    "public",
    "uploads",
    "candidates",
    params.userId,
    params.kind,
  );

  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), Buffer.from(await params.file.arrayBuffer()));

  return {
    url: `/uploads/candidates/${params.userId}/${params.kind}/${filename}`,
    name: params.file.name,
    size: params.file.size,
  };
}

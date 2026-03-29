import { NextResponse } from "next/server";
import { requireCandidateApiAccess } from "@/lib/candidate-auth";
import { saveUpload, validateUpload } from "@/lib/upload";

export async function POST(request: Request) {
  const access = await requireCandidateApiAccess(request);
  if ("error" in access) {
    return NextResponse.json({ ok: false, error: access.error }, { status: access.status });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const kindValue = formData.get("kind");
  const kind = kindValue === "photo" ? "photo" : kindValue === "document" ? "document" : null;

  if (!(file instanceof File) || !kind) {
    return NextResponse.json({ ok: false, error: "请上传有效文件。" }, { status: 400 });
  }

  const validation = validateUpload(file, kind);
  if (!validation.ok) {
    return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });
  }

  const uploaded = await saveUpload({
    file,
    kind,
    userId: access.current.user.id,
  });

  return NextResponse.json({ ok: true, data: uploaded }, { status: 201 });
}

import { NextResponse } from "next/server";
import { requireCandidateApiAccess } from "@/lib/candidate-auth";
import { isNowWithin } from "@/lib/exam-window";
import { repo } from "@/lib/repository";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await requireCandidateApiAccess(_request);
  if ("error" in access) {
    return NextResponse.json({ ok: false, error: access.error }, { status: access.status });
  }

  const { id } = await params;
  const application = await repo.findApplication(id);

  if (!application || application.userId !== access.current.user.id) {
    return NextResponse.json({ ok: false, error: "报名记录不存在" }, { status: 404 });
  }

  const exam = await repo.findExamById(application.examProjectId);
  if (!exam) {
    return NextResponse.json({ ok: false, error: "考试项目不存在" }, { status: 404 });
  }

  if (!isNowWithin(exam.registrationStart, exam.registrationEnd)) {
    return NextResponse.json({ ok: false, error: "报名时间已结束，无法提交审核" }, { status: 409 });
  }

  if (!["DRAFT", "REJECTED"].includes(application.status)) {
    return NextResponse.json({ ok: false, error: "当前报名状态不可再次提交" }, { status: 409 });
  }

  if (!application.photoUrl) {
    return NextResponse.json({ ok: false, error: "请先上传证件照后再提交" }, { status: 400 });
  }

  if (!application.documents.length) {
    return NextResponse.json({ ok: false, error: "请先补充材料后再提交" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, data: await repo.submitApplication(id) });
}

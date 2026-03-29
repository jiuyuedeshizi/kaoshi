import { NextResponse } from "next/server";
import { requireCandidateApiAccess } from "@/lib/candidate-auth";
import { isReleasedAt } from "@/lib/exam-window";
import { repo } from "@/lib/repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ applicationId: string }> },
) {
  const access = await requireCandidateApiAccess(_request);
  if ("error" in access) {
    return NextResponse.json({ ok: false, error: access.error }, { status: access.status });
  }

  const { applicationId } = await params;
  const application = await repo.findApplication(applicationId);
  if (!application || application.userId !== access.current.user.id) {
    return NextResponse.json({ ok: false, error: "准考证暂未生成" }, { status: 404 });
  }

  if (!["TICKET_READY", "FINISHED"].includes(application.status)) {
    return NextResponse.json({ ok: false, error: "当前报名状态暂不可打印准考证" }, { status: 409 });
  }

  const exam = await repo.findExamById(application.examProjectId);
  if (!exam) {
    return NextResponse.json({ ok: false, error: "考试项目不存在" }, { status: 404 });
  }

  if (!isReleasedAt(exam.ticketStart)) {
    return NextResponse.json({ ok: false, error: "准考证打印时间未到" }, { status: 409 });
  }

  const ticket = await repo.findTicketByApplicationId(applicationId);

  if (!ticket) {
    return NextResponse.json({ ok: false, error: "准考证暂未生成" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, data: ticket });
}

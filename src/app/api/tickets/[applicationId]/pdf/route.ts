import { NextResponse } from "next/server";
import { requireCandidateApiAccess } from "@/lib/candidate-auth";
import { isReleasedAt } from "@/lib/exam-window";
import { repo } from "@/lib/repository";
import { generateTicketPdf } from "@/lib/ticket-pdf";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ applicationId: string }> },
) {
  const access = await requireCandidateApiAccess(request);
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

  const [ticket, candidate, exam] = await Promise.all([
    repo.findTicketByApplicationId(applicationId),
    repo.findUserById(application.userId),
    repo.findExamById(application.examProjectId),
  ]);

  if (!ticket || !candidate || !exam) {
    return NextResponse.json({ ok: false, error: "准考证信息不完整" }, { status: 404 });
  }

  if (!isReleasedAt(exam.ticketStart)) {
    return NextResponse.json({ ok: false, error: "准考证打印时间未到" }, { status: 409 });
  }

  const template = await repo.findDefaultTicketTemplate();

  const pdf = await generateTicketPdf({
    ticket,
    application,
    candidate,
    exam,
    template,
  });

  const filename = `${candidate.name}-${ticket.ticketNo}-准考证.pdf`;
  const url = new URL(request.url);
  const disposition = url.searchParams.get("disposition") === "inline" ? "inline" : "attachment";
  await repo.createTicketDownloadLog({
    userId: candidate.id,
    applicationId,
    ticketId: ticket.id,
    disposition: disposition === "inline" ? "INLINE" : "ATTACHMENT",
  });

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "no-store",
    },
  });
}

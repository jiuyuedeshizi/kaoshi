import { notFound } from "next/navigation";
import Link from "next/link";
import { requireCandidatePageAccess } from "@/lib/candidate-auth";
import { TicketPdfPreview } from "@/components/candidate/ticket-pdf-preview";
import { SiteFrame } from "@/components/layout/site-frame";
import { isReleasedAt } from "@/lib/exam-window";
import { repo } from "@/lib/repository";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = await params;
  const current = await requireCandidatePageAccess(`/tickets/${applicationId}`);
  const ticket = await repo.findTicketByApplicationId(applicationId);
  const application = await repo.findApplication(applicationId);
  if (application && application.userId !== current.user.id) {
    notFound();
  }
  const candidate = application ? await repo.findUserById(application.userId) : null;
  const exam = application ? await repo.findExamById(application.examProjectId) : null;

  if (!ticket || !application || !candidate || !exam || !isReleasedAt(exam.ticketStart)) {
    notFound();
  }

  const downloadUrl = `/api/tickets/${applicationId}/pdf`;
  return (
    <SiteFrame currentPath="/tickets">
      <main className="page-section">
        <div className="actions-row no-print" style={{ width: "min(100%, 820px)", margin: "0 auto 16px" }}>
          <a
            className="button"
            href={downloadUrl}
            target="_blank"
            rel="noreferrer"
          >
            下载 PDF 准考证
          </a>
          <Link className="button-secondary" href="/tickets">
            返回准考证列表
          </Link>
        </div>
        <div className="pdf-preview-shell">
          <TicketPdfPreview
            src={downloadUrl}
            title={`${ticket.ticketNo} 准考证 PDF 预览`}
          />
          <p className="empty-copy no-print">
            页面展示内容与下载 PDF 保持一致，如预览失败可直接点击上方按钮下载。
          </p>
        </div>
      </main>
    </SiteFrame>
  );
}

import { notFound } from "next/navigation";
import { requireCandidatePageAccess } from "@/lib/candidate-auth";
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

  return (
    <SiteFrame currentPath="/tickets">
      <main className="page-section">
        <div className="print-sheet">
          <div className="ticket-header">
            <h1>邻泰人事考试准考证</h1>
            <p>{exam.title}</p>
          </div>
          <div className="ticket-grid">
            <div>姓名：{candidate.name}</div>
            <div>身份证号：{candidate.idCard}</div>
            <div>准考证号：{ticket.ticketNo}</div>
            <div>报考专业：{application.major}</div>
            <div>考试时间：{ticket.examTime}</div>
            <div>考试地点：{ticket.venue}</div>
            <div>考场：{ticket.room}</div>
            <div>座位号：{ticket.seatNo}</div>
          </div>
          <section className="card" style={{ marginTop: 24 }}>
            <h2>考生须知</h2>
            <ul className="timeline">
              <li>请考生携带本人有效身份证件和准考证按时参加考试。</li>
              <li>开考 30 分钟后不得进入考场，考试结束前不得提前交卷。</li>
              <li>请认真核对个人信息，如有问题请及时联系考务部门。</li>
            </ul>
          </section>
        </div>
      </main>
    </SiteFrame>
  );
}

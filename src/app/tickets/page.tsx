import Link from "next/link";
import { requireCandidatePageAccess } from "@/lib/candidate-auth";
import { SiteFrame } from "@/components/layout/site-frame";
import { PageHero } from "@/components/shared/page-hero";
import { isReleasedAt } from "@/lib/exam-window";
import { repo } from "@/lib/repository";

export default async function TicketsPage() {
  const current = await requireCandidatePageAccess("/tickets");
  const apps = await repo.findApplicationsByUser(current.user.id);
  const appIds = new Set(apps.map((item) => item.id));
  const exams = await repo.listExamProjects();
  const examMap = new Map(exams.map((item) => [item.id, item]));
  const printableAppIds = new Set(
    apps
      .filter((item) => {
        const exam = examMap.get(item.examProjectId);
        return exam && isReleasedAt(exam.ticketStart);
      })
      .map((item) => item.id),
  );
  const tickets = (await repo.listTickets()).filter((item) => appIds.has(item.applicationId) && printableAppIds.has(item.applicationId));
  const waitingApps = apps.filter((item) => {
    const exam = examMap.get(item.examProjectId);
    return item.status === "TICKET_READY" && exam && !isReleasedAt(exam.ticketStart);
  });

  return (
    <SiteFrame currentPath="/tickets">
      <PageHero
        title="打印准考证"
        description="仅审核通过且完成缴费的考生可在开放时间内打印准考证。打印页已按 A4 纸张版式优化。"
      />
      <main className="page-section cards-2">
        {tickets.length ? (
          tickets.map((ticket) => (
            <section className="card" key={ticket.id}>
              <div className="panel-header">
                <h2>准考证号 {ticket.ticketNo}</h2>
                <span className="badge success">可打印</span>
              </div>
              <ul className="timeline">
                <li>考试时间：{ticket.examTime}</li>
                <li>考试地点：{ticket.venue}</li>
                <li>考场：{ticket.room}</li>
                <li>座位号：{ticket.seatNo}</li>
              </ul>
              <div className="actions-row">
                <Link className="button" href={`/tickets/${ticket.applicationId}`}>
                  打开打印页
                </Link>
              </div>
            </section>
          ))
        ) : (
          <section className="card">
            <div className="panel-header">
              <h2>暂无可打印准考证</h2>
              <span className="badge warning">等待开放</span>
            </div>
            <p>请先完成报名审核和缴费。待准考证生成后，这里会显示打印入口。</p>
          </section>
        )}
        {waitingApps.length ? (
          <section className="card">
            <div className="panel-header">
              <h2>即将开放打印</h2>
              <span className="badge">请留意时间</span>
            </div>
            <ul className="timeline">
              {waitingApps.map((item) => {
                const exam = examMap.get(item.examProjectId);
                return <li key={item.id}>{item.id} / {item.major} / 开放时间：{exam?.ticketStart}</li>;
              })}
            </ul>
          </section>
        ) : null}
      </main>
    </SiteFrame>
  );
}

import { AdminSchedulingForm } from "@/components/admin/admin-scheduling-form";
import { SiteFrame } from "@/components/layout/site-frame";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { repo } from "@/lib/repository";

export default async function AdminSchedulingPage() {
  await requireAdminPageAccess("MANAGE_SCHEDULING", "/admin/scheduling");
  const [exams, areas, tickets] = await Promise.all([
    repo.listExamProjects(),
    repo.listExamAreas(),
    repo.listTickets(),
  ]);

  return (
    <SiteFrame currentPath="/admin">
      <PageHero title="考场座位编排" description="针对已缴费考生生成准考证号、考试时间、考点、考场和座位号，完成后自动开放准考证打印。" />
      <main className="page-section cards-2">
        <section className="card">
          <div className="panel-header">
            <h2>执行编排</h2>
            <span className="badge success">已接入状态流</span>
          </div>
          <AdminSchedulingForm exams={exams} areas={areas} />
        </section>
        <section className="table-card">
          <div className="panel-header">
            <h2>最近编排结果</h2>
            <span className="badge success">共 {tickets.length} 条</span>
          </div>
          {tickets.length ? (
            <table className="table">
              <thead>
                <tr>
                  <th>准考证号</th>
                  <th>考点</th>
                  <th>考场</th>
                  <th>座位</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>{ticket.ticketNo}</td>
                    <td>{ticket.venue}</td>
                    <td>{ticket.room}</td>
                    <td>{ticket.seatNo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState title="暂无编排结果" description="完成缴费并配置考场后，可在此执行自动编排。" />
          )}
        </section>
      </main>
    </SiteFrame>
  );
}

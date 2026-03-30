import { AdminTicketTemplateForm } from "@/components/admin/admin-ticket-template-form";
import { SiteFrame } from "@/components/layout/site-frame";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { repo } from "@/lib/repository";

export default async function AdminTicketsPage() {
  await requireAdminPageAccess("MANAGE_TICKETS", "/admin/tickets");
  const [template, tickets, downloads] = await Promise.all([
    repo.findDefaultTicketTemplate(),
    repo.listTickets(),
    repo.listTicketDownloadLogs(10),
  ]);

  return (
    <SiteFrame currentPath="/admin">
      <PageHero title="准考证管理" description="维护准考证标题、注意事项和字段显示规则，并查看最近生成与下载记录。" />
      <main className="page-section cards-2">
        <section className="card">
          <div className="panel-header">
            <h2>模板配置</h2>
            <span className="badge success">当前默认模板</span>
          </div>
          <AdminTicketTemplateForm template={template} />
        </section>
        <div className="content-stack">
          <section className="table-card">
            <div className="panel-header">
              <h2>已生成准考证</h2>
              <span className="badge success">共 {tickets.length} 条</span>
            </div>
            {tickets.length ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>准考证号</th>
                    <th>岗位</th>
                    <th>考试科目</th>
                    <th>考场</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>{ticket.ticketNo}</td>
                      <td>{ticket.jobName ?? "-"}</td>
                      <td>{ticket.examSubject ?? "-"}</td>
                      <td>{ticket.venue} / {ticket.room} / {ticket.seatNo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState title="暂无准考证" description="先完成缴费和排考后，系统才会生成准考证。" />
            )}
          </section>
          <section className="table-card">
            <div className="panel-header">
              <h2>最近下载记录</h2>
            </div>
            {downloads.length ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>报名单号</th>
                    <th>准考证</th>
                    <th>方式</th>
                    <th>时间</th>
                  </tr>
                </thead>
                <tbody>
                  {downloads.map((log) => (
                    <tr key={log.id}>
                      <td>{log.applicationId}</td>
                      <td>{log.ticketId}</td>
                      <td>{log.disposition === "INLINE" ? "页面预览" : "PDF 下载"}</td>
                      <td>{log.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState title="暂无下载记录" description="考生查看或下载准考证后，这里会记录访问明细。" />
            )}
          </section>
        </div>
      </main>
    </SiteFrame>
  );
}

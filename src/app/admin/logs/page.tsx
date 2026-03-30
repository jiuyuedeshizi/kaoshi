import { SiteFrame } from "@/components/layout/site-frame";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { repo } from "@/lib/repository";

export default async function AdminLogsPage() {
  await requireAdminPageAccess("VIEW_LOGS", "/admin/logs");
  const [operations, logins, callbacks, downloads] = await Promise.all([
    repo.listAdminOperationLogs(12),
    repo.listLoginLogs(12),
    repo.listPaymentCallbackLogs(12),
    repo.listTicketDownloadLogs(12),
  ]);

  return (
    <SiteFrame currentPath="/admin">
      <PageHero title="日志审计" description="集中查看后台操作、登录、支付回调和准考证下载日志，便于排查问题和责任追踪。" />
      <main className="page-section cards-2">
        <section className="table-card">
          <div className="panel-header"><h2>后台操作日志</h2></div>
          {operations.length ? <ul className="timeline">{operations.map((log) => <li key={log.id}>{log.createdAt} / {log.adminName} / {log.detail}</li>)}</ul> : <EmptyState title="暂无日志" description="关键后台操作会记录在这里。" />}
        </section>
        <section className="table-card">
          <div className="panel-header"><h2>登录日志</h2></div>
          {logins.length ? <ul className="timeline">{logins.map((log) => <li key={log.id}>{log.createdAt} / {log.account} / {log.success ? "成功" : "失败"}</li>)}</ul> : <EmptyState title="暂无登录日志" description="用户或管理员登录后会记录访问日志。" />}
        </section>
        <section className="table-card">
          <div className="panel-header"><h2>支付回调日志</h2></div>
          {callbacks.length ? <ul className="timeline">{callbacks.map((log) => <li key={log.id}>{log.createdAt} / {log.orderNo} / {log.success ? "成功" : "失败"} / {log.message ?? "-"}</li>)}</ul> : <EmptyState title="暂无支付日志" description="支付回调和补单日志会显示在这里。" />}
        </section>
        <section className="table-card">
          <div className="panel-header"><h2>准考证下载日志</h2></div>
          {downloads.length ? <ul className="timeline">{downloads.map((log) => <li key={log.id}>{log.createdAt} / {log.applicationId} / {log.disposition === "INLINE" ? "页面预览" : "PDF 下载"}</li>)}</ul> : <EmptyState title="暂无下载日志" description="考生查看或下载准考证后会自动记录。" />}
        </section>
      </main>
    </SiteFrame>
  );
}

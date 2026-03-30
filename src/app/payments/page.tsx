import { requireCandidatePageAccess } from "@/lib/candidate-auth";
import { isAlipayConfigured } from "@/lib/alipay";
import { PaymentsPanel } from "@/components/candidate/payments-panel";
import { SiteFrame } from "@/components/layout/site-frame";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { StatusBadge } from "@/components/shared/status-badge";
import { isReleasedAt } from "@/lib/exam-window";
import { formatMoney, paymentProviderLabel } from "@/lib/format";
import { repo } from "@/lib/repository";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const current = await requireCandidatePageAccess("/payments");
  const params = ((await searchParams) ?? {}) as Record<string, string | undefined>;
  const errorMessage = typeof params.error === "string" ? params.error : "";
  const successMessage = typeof params.success === "string" ? params.success : "";
  const applications = await repo.findApplicationsByUser(current.user.id);
  const exams = await repo.listExamProjects();
  const examMap = new Map(exams.map((item) => [item.id, item]));
  const applicationIds = new Set(applications.map((item) => item.id));
  const orders = (await repo.listOrders())
    .filter((item) => applicationIds.has(item.applicationId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const pendingOrders = orders.filter((item) => item.status === "PENDING");
  const paidOrders = orders.filter((item) => item.status === "PAID");
  const readyForPayApps = applications.filter((item) => item.status === "APPROVED");
  const blockedApps = applications.filter((item) => {
    const exam = examMap.get(item.examProjectId);
    return item.status === "APPROVED" && exam && isReleasedAt(exam.paymentEnd);
  });

  return (
    <SiteFrame currentPath="/payments">
      <PageHero
        title="网上缴费"
        description="缴费完成后，报名状态会自动更新，并进入准考证打印阶段。当前页面优先展示您下一步需要处理的事项。"
      />
      <main className="page-section content-stack">
        {errorMessage ? (
          <section className="card">
            <p style={{ color: "var(--accent)" }}>{errorMessage}</p>
          </section>
        ) : null}
        {successMessage ? (
          <section className="card">
            <p style={{ color: "var(--success)" }}>{successMessage}</p>
          </section>
        ) : null}
        <section className="cards-3">
          <article className="status-panel payment-summary-card">
            <span className="caption">当前状态</span>
            <strong>{pendingOrders.length ? `有 ${pendingOrders.length} 笔待支付订单` : "当前无待缴费项目"}</strong>
            <p>{pendingOrders.length ? "请优先完成待支付订单，避免重复下单。" : "您当前没有需要处理的缴费事项，可查看历史记录或进入准考证页面。"}</p>
          </article>
          <article className="status-panel payment-summary-card">
            <span className="caption">待缴费报名</span>
            <strong>{readyForPayApps.length}</strong>
            <p>仅审核通过且未过缴费期的报名记录可以创建缴费订单。</p>
          </article>
          <article className="status-panel payment-summary-card">
            <span className="caption">已完成缴费</span>
            <strong>{paidOrders.length}</strong>
            <p>已完成缴费的报名记录可继续进入准考证查看与下载环节。</p>
          </article>
        </section>
        <PaymentsPanel
          applications={applications}
          orders={orders}
          alipayReady={isAlipayConfigured()}
        />
        <section className="table-card">
          <div className="panel-header">
            <h2>缴费记录</h2>
            <span className="badge success">已完成 {paidOrders.length} 笔</span>
          </div>
          {orders.length ? (
            <table className="table">
              <thead>
                <tr>
                  <th>订单号</th>
                  <th>报名项目</th>
                  <th>金额</th>
                  <th>支付方式</th>
                  <th>状态</th>
                  <th>完成时间</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.orderNo}</td>
                    <td>
                      {applications.find((item) => item.id === order.applicationId)?.major ?? order.applicationId}
                    </td>
                    <td>{formatMoney(order.amount)}</td>
                    <td>{paymentProviderLabel(order.provider)}</td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                    <td>{order.paidAt ? order.paidAt.replace("T", " ").slice(0, 16) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState
              title="暂无缴费订单"
              description="请先完成报名并等待审核通过。审核通过后，系统才会允许创建缴费订单。"
            />
          )}
        </section>
        {blockedApps.length ? (
          <section className="card">
            <div className="panel-header">
              <h2>已过缴费期</h2>
              <span className="badge danger">不可下单</span>
            </div>
            <ul className="timeline">
              {blockedApps.map((item) => (
                <li key={item.id}>{item.id} / {item.major}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </SiteFrame>
  );
}

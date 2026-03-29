import { requireCandidatePageAccess } from "@/lib/candidate-auth";
import { PaymentsPanel } from "@/components/candidate/payments-panel";
import { SiteFrame } from "@/components/layout/site-frame";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { StatusBadge } from "@/components/shared/status-badge";
import { isReleasedAt } from "@/lib/exam-window";
import { formatMoney, paymentProviderLabel } from "@/lib/format";
import { repo } from "@/lib/repository";

export default async function PaymentsPage() {
  const current = await requireCandidatePageAccess("/payments");
  const applications = await repo.findApplicationsByUser(current.user.id);
  const exams = await repo.listExamProjects();
  const examMap = new Map(exams.map((item) => [item.id, item]));
  const applicationIds = new Set(applications.map((item) => item.id));
  const orders = (await repo.listOrders()).filter((item) => applicationIds.has(item.applicationId));
  const blockedApps = applications.filter((item) => {
    const exam = examMap.get(item.examProjectId);
    return item.status === "APPROVED" && exam && isReleasedAt(exam.paymentEnd);
  });

  return (
    <SiteFrame currentPath="/payments">
      <PageHero
        title="网上缴费"
        description="审核通过后生成缴费订单。首版已预留微信、支付宝和模拟网关适配方式，后续可直接接入商户参数和回调验签。"
      />
      <main className="page-section cards-2">
        <section className="table-card">
          <div className="panel-header">
            <h2>当前订单</h2>
            <span className="badge">API: /api/orders</span>
          </div>
          {orders.length ? (
            <table className="table">
              <thead>
                <tr>
                  <th>订单号</th>
                  <th>报名单号</th>
                  <th>金额</th>
                  <th>渠道</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.orderNo}</td>
                    <td>{order.applicationId}</td>
                    <td>{formatMoney(order.amount)}</td>
                    <td>{paymentProviderLabel(order.provider)}</td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
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
        <PaymentsPanel applications={applications} orders={orders} />
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

import { AdminListControls } from "@/components/admin/admin-list-controls";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { SiteFrame } from "@/components/layout/site-frame";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { StatusBadge } from "@/components/shared/status-badge";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { formatMoney, paymentProviderLabel } from "@/lib/format";
import { repo } from "@/lib/repository";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminPageAccess("VIEW_ORDERS", "/admin/orders");
  const params = ((await searchParams) ?? {}) as Record<string, string | undefined>;
  const keyword = typeof params.keyword === "string" ? params.keyword : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;
  const provider = typeof params.provider === "string" ? params.provider : undefined;
  const page = Number(params.page ?? "1") || 1;
  const result = await repo.listOrdersPage({
    keyword,
    status: status as never,
    provider: provider as never,
    page,
    pageSize: 8,
  });
  const orders = result.items;

  return (
    <SiteFrame currentPath="/admin">
      <PageHero
        title="订单管理"
        description="追踪报名缴费订单状态、回调结果和支付渠道，后续可扩展对账、退款和异常重试。"
      />
      <main className="page-section">
        <section className="table-card">
          <div className="panel-header">
            <h2>订单列表</h2>
            <span className="badge">共 {result.total} 条</span>
          </div>
          <AdminListControls
            action="/admin/orders"
            keyword={keyword}
            keywordPlaceholder="搜索订单号、报名单号、支付渠道"
            filters={[
              {
                name: "status",
                value: status,
                placeholder: "全部状态",
                options: [
                  { label: "待支付", value: "PENDING" },
                  { label: "已支付", value: "PAID" },
                  { label: "支付失败", value: "FAILED" },
                  { label: "已关闭", value: "CLOSED" },
                ],
              },
              {
                name: "provider",
                value: provider,
                placeholder: "全部渠道",
                options: [
                  { label: "模拟支付", value: "MOCK" },
                  { label: "微信", value: "WECHAT" },
                  { label: "支付宝", value: "ALIPAY" },
                ],
              },
            ]}
          />
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
              {orders.length ? (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.orderNo}</td>
                    <td>{order.applicationId}</td>
                    <td>{formatMoney(order.amount)}</td>
                    <td>{paymentProviderLabel(order.provider)}</td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      title="没有符合条件的订单"
                      description="可以调整筛选条件，或等待考生完成审核通过后的缴费操作。"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <AdminPagination
            pathname="/admin/orders"
            page={result.page}
            totalPages={result.totalPages}
            params={{ keyword, status, provider }}
          />
        </section>
      </main>
    </SiteFrame>
  );
}

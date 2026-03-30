import Link from "next/link";
import { PageHero } from "@/components/shared/page-hero";
import { StatusBadge } from "@/components/shared/status-badge";
import { SiteFrame } from "@/components/layout/site-frame";
import { EmptyState } from "@/components/shared/empty-state";
import { formatMoney, paymentProviderLabel } from "@/lib/format";
import type {
  AdmissionTicket,
  Application,
  PaymentOrder,
  User,
} from "@/lib/types";

export function CandidateDashboard({
  candidate,
  apps,
  exams,
  orders,
  tickets,
}: {
  candidate?: User;
  apps: Application[];
  exams: Array<{ id: string; slug: string; title: string }>;
  orders: PaymentOrder[];
  tickets: AdmissionTicket[];
}) {
  const examMap = new Map(exams.map((item) => [item.id, item]));

  return (
    <SiteFrame currentPath="">
      <PageHero
        title="考生个人中心"
        description="查看个人实名资料、报名状态、缴费订单、准考证和成绩发布情况，当前页面已按登录考生读取真实数据。"
        actions={
          <>
            <Link className="button" href="/exams">
              继续报名
            </Link>
            <Link className="button-secondary" href="/tickets">
              打印准考证
            </Link>
          </>
        }
      />
      <main className="page-section layout-grid">
        <div className="content-stack">
          <section className="card">
            <div className="panel-header">
              <h2>实名档案</h2>
              <span className="badge success">已建档</span>
            </div>
            {candidate ? (
              <div className="form-grid">
                <div className="field">
                  <label>姓名</label>
                  <input readOnly value={candidate.name} />
                </div>
                <div className="field">
                  <label>手机号</label>
                  <input readOnly value={candidate.phone} />
                </div>
                <div className="field">
                  <label>身份证号</label>
                  <input readOnly value={candidate.idCard} />
                </div>
                <div className="field">
                  <label>邮箱</label>
                  <input readOnly value={candidate.email ?? ""} />
                </div>
                <div className="field">
                  <label>民族</label>
                  <input readOnly value={candidate.ethnicity ?? ""} />
                </div>
                <div className="field-full">
                  <label>联系地址</label>
                  <input readOnly value={candidate.address ?? ""} />
                </div>
              </div>
            ) : null}
          </section>

          <section className="table-card">
            <div className="panel-header">
              <h2>报名记录</h2>
              <Link className="button-ghost" href="/exams">
                新建报名
              </Link>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>报名单号</th>
                  <th>报考专业</th>
                  <th>学历</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {apps.length ? (
                  apps.map((app) => (
                    <tr key={app.id}>
                      <td>{app.id}</td>
                      <td>{app.major}</td>
                      <td>{app.education}</td>
                      <td>
                        <StatusBadge status={app.status} />
                      </td>
                      <td>
                        <div className="actions-row">
                          {["DRAFT", "REJECTED"].includes(app.status) ? (
                            <Link className="button-ghost" href={`/exams/${examMap.get(app.examProjectId)?.slug ?? ""}`}>
                              继续编辑
                            </Link>
                          ) : null}
                          <Link className="button-ghost" href="/payments">
                            查看缴费
                          </Link>
                          <Link className="button-ghost" href={`/tickets/${app.id}`}>
                            准考证
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState
                        title="还没有报名记录"
                        description="可以先进入考试报名页填写资料并保存草稿，提交审核后这里会显示最新进度。"
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          <section className="table-card">
            <div className="panel-header">
              <h2>缴费订单</h2>
              <Link className="button-ghost" href="/payments">
                订单中心
              </Link>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>订单号</th>
                  <th>支付方式</th>
                  <th>金额</th>
                  <th>状态</th>
                  <th>支付时间</th>
                </tr>
              </thead>
              <tbody>
                {orders.length ? (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.orderNo}</td>
                      <td>{paymentProviderLabel(order.provider)}</td>
                      <td>{formatMoney(order.amount)}</td>
                      <td>
                        <StatusBadge status={order.status} />
                      </td>
                      <td>{order.paidAt ?? "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState
                        title="暂无缴费订单"
                        description="审核通过后可以在缴费中心创建订单。支付成功后，这里会显示订单状态和支付时间。"
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </div>

        <aside className="content-stack">
          <section className="status-panel">
            <h2>准考证状态</h2>
            <p>已审核并完成缴费的报名记录会在开放时间自动转入准考证打印阶段。</p>
            <div className="stat-list">
              {tickets.length ? (
                tickets.map((ticket) => (
                  <div key={ticket.id} className="kpi">
                    <strong>{ticket.ticketNo}</strong>
                    <span>{ticket.venue}</span>
                    <Link className="button-secondary" href={`/tickets/${ticket.applicationId}`}>
                      打印准考证
                    </Link>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="暂无可打印准考证"
                  description="报名审核通过并完成缴费后，系统会先进入排考编排，再在开放时间生成准考证。"
                />
              )}
            </div>
          </section>
          <section className="status-panel">
            <h2>温馨提示</h2>
            <ul className="timeline">
              <li>报名提交后请关注审核反馈，驳回原因会展示在报名记录中。</li>
              <li>缴费成功后系统会进入排考编排阶段，完成编排后再开放准考证打印。</li>
              <li>成绩发布后可使用证件号或准考证号查询。</li>
            </ul>
          </section>
        </aside>
      </main>
    </SiteFrame>
  );
}

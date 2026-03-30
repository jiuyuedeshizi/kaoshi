import Link from "next/link";
import { SiteFrame } from "@/components/layout/site-frame";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { StatusBadge } from "@/components/shared/status-badge";
import type { AdminOperationLog, DashboardMetric, Notice, UserRole } from "@/lib/types";

interface AdminDashboardProps {
  currentUser: {
    name: string;
    role: Exclude<UserRole, "CANDIDATE">;
    roleLabel: string;
  };
  metrics: DashboardMetric[];
  exams: Array<{ id: string; title: string; registrationEnd: string; paymentEnd: string }>;
  applications: Array<{ id: string; status: string; major: string; submittedAt?: string }>;
  orders: Array<{ id: string; orderNo: string; amount: number; status: string }>;
  scores: Array<{ id: string; ticketNo: string; score: number; published: boolean }>;
  notices: Notice[];
  logs: AdminOperationLog[];
}

const menuItems = [
  { href: "/admin/exams", label: "考试项目管理", roles: ["ADMIN"] },
  { href: "/admin/jobs", label: "岗位管理", roles: ["ADMIN"] },
  { href: "/admin/applications", label: "报名审核", roles: ["ADMIN", "REVIEWER"] },
  { href: "/admin/orders", label: "订单管理", roles: ["ADMIN", "REVIEWER"] },
  { href: "/admin/locations", label: "考区考点管理", roles: ["ADMIN", "SCHEDULER"] },
  { href: "/admin/scheduling", label: "考场座位编排", roles: ["ADMIN", "SCHEDULER"] },
  { href: "/admin/tickets", label: "准考证管理", roles: ["ADMIN", "SCHEDULER"] },
  { href: "/admin/scores", label: "成绩管理", roles: ["ADMIN"] },
  { href: "/admin/notices", label: "公告发布", roles: ["ADMIN"] },
  { href: "/admin/users", label: "用户管理", roles: ["ADMIN"] },
  { href: "/admin/reports", label: "统计报表", roles: ["ADMIN", "FINANCE", "SCORE_MANAGER"] },
  { href: "/admin/logs", label: "日志审计", roles: ["ADMIN", "FINANCE"] },
  { href: "/admin/settings", label: "系统设置", roles: ["ADMIN"] },
  { href: "/admin/permissions", label: "权限管理", roles: ["ADMIN"] },
];

export function AdminDashboard(props: AdminDashboardProps) {
  const { currentUser, metrics, exams, applications, orders, scores, notices, logs } = props;
  const visibleMenus = menuItems.filter((item) => item.roles.includes(currentUser.role));

  return (
    <SiteFrame currentPath="/admin">
      <PageHero
        title="考试运营后台"
        description="面向考试运营团队的统一后台，集中管理考试项目、报名审核、订单缴费、准考证准备、成绩导入和公告发布。"
        actions={
          <>
            <Link className="button" href="/admin/exams">
              新建考试项目
            </Link>
            <Link className="button-secondary" href="/admin/notices">
              发布公告
            </Link>
          </>
        }
      />
      <main className="page-section layout-grid">
        <div className="content-stack">
          <section className="cards-4">
            {metrics.map((metric) => (
              <article className="kpi" key={metric.label}>
                <span className="caption">{metric.label}</span>
                <strong>{metric.value}</strong>
                <span className="muted">{metric.hint}</span>
              </article>
            ))}
          </section>
          <section className="table-card">
            <div className="panel-header">
              <h2>考试项目概览</h2>
              <Link className="button-ghost" href="/admin/exams">
                进入项目管理
              </Link>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>考试项目</th>
                  <th>报名截止</th>
                  <th>缴费截止</th>
                </tr>
              </thead>
              <tbody>
                {exams.length ? (
                  exams.map((exam) => (
                    <tr key={exam.id}>
                      <td>{exam.title}</td>
                      <td>{exam.registrationEnd}</td>
                      <td>{exam.paymentEnd}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3}>
                      <EmptyState
                        title="暂无考试项目"
                        description="创建考试项目后，这里会显示报名和缴费时间概览。"
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
          <section className="cards-2">
            <section className="table-card">
              <div className="panel-header">
                <h2>待处理报名</h2>
                <Link className="button-ghost" href="/admin/applications">
                  审核中心
                </Link>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>报名单号</th>
                    <th>专业</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.length ? (
                    applications.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.major}</td>
                        <td>
                          <StatusBadge status={item.status} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3}>
                        <EmptyState
                          title="暂无待处理报名"
                          description="考生提交报名后，这里会展示最新的审核任务。"
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
                <Link className="button-ghost" href="/admin/orders">
                  全部订单
                </Link>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>订单号</th>
                    <th>金额</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length ? (
                    orders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.orderNo}</td>
                        <td>¥{order.amount.toFixed(2)}</td>
                        <td>
                          <StatusBadge status={order.status} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3}>
                        <EmptyState
                          title="暂无订单"
                          description="考生缴费后，这里会显示最新订单和支付状态。"
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          </section>
          <section className="cards-2">
            <section className="table-card">
              <div className="panel-header">
                <h2>成绩发布</h2>
                <Link className="button-ghost" href="/admin/scores">
                  成绩导入
                </Link>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>准考证号</th>
                    <th>成绩</th>
                    <th>发布状态</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.length ? (
                    scores.map((score) => (
                      <tr key={score.id}>
                        <td>{score.ticketNo}</td>
                        <td>{score.score}</td>
                        <td>{score.published ? "已发布" : "未发布"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3}>
                        <EmptyState
                          title="暂无成绩记录"
                          description="导入成绩后，这里会显示待发布或已发布的成绩概览。"
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
            <section className="table-card">
              <div className="panel-header">
                <h2>公告发布</h2>
                <Link className="button-ghost" href="/admin/notices">
                  公告管理
                </Link>
              </div>
              {notices.length ? (
                <ul className="notice-list">
                  {notices.map((notice) => (
                    <li key={notice.id}>
                      <div className="meta-row">
                        <span>{notice.title}</span>
                        <span className="notice-date">{notice.publishedAt}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  title="暂无公告"
                  description="发布公告后，这里会同步显示最近的通知内容。"
                />
              )}
            </section>
          </section>
        </div>
        <aside className="content-stack">
          <section className="status-panel">
            <h2>当前登录</h2>
            <div className="kpi">
              <span className="caption">后台账号</span>
              <strong>{currentUser.name}</strong>
              <span className="muted">{currentUser.roleLabel}</span>
            </div>
          </section>
          <section className="status-panel">
            <h2>后台模块</h2>
            <ul className="menu-list">
              {visibleMenus.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </section>
          <section className="status-panel">
            <h2>运营建议</h2>
            <ul className="timeline">
              <li>临近报名截止时建议开启短信或站内通知提醒。</li>
              <li>支付回调建议开启验签与订单幂等校验。</li>
              <li>成绩导入后应先预览校验，再批量发布。</li>
            </ul>
          </section>
          <section className="status-panel">
            <h2>最近操作</h2>
            {logs.length ? (
              <ul className="timeline">
                {logs.map((log) => (
                  <li key={log.id}>
                    <strong>{log.adminName}</strong>
                    <p>{log.detail}</p>
                    <span className="notice-date">{log.createdAt}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="暂无操作记录"
                description="创建考试、审核报名、导入成绩或发布公告后，这里会显示最近操作。"
              />
            )}
          </section>
        </aside>
      </main>
    </SiteFrame>
  );
}

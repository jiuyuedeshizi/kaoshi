import Link from "next/link";
import { SiteFrame } from "@/components/layout/site-frame";
import { getRegistrationLabel, getRegistrationPhase } from "@/lib/exam-window";
import type { DashboardMetric, ExamProject, Notice } from "@/lib/types";

export function HomePage({
  notices,
  exams,
  categories,
  metrics,
  faqItems,
  guideSteps,
}: {
  notices: Notice[];
  exams: ExamProject[];
  categories: Array<{ id: string; name: string; slug: string }>;
  metrics: DashboardMetric[];
  faqItems: Array<{ question: string; answer: string }>;
  guideSteps: string[];
}) {
  return (
    <SiteFrame currentPath="/">
      <main>
        <section className="hero">
          <div className="page-section hero-grid">
            <div className="hero-panel">
              <span className="eyebrow">公开招聘 · 人事考试 · 成绩查询</span>
              <h1>一站式完成注册、报名、缴费、打印与查分</h1>
              <p>
                面向长期运营的人事考试场景打造，保留政务门户的正式可信感，同时将复杂报考流程收拢为清晰、可追踪的线上办理链路。
              </p>
              <div className="hero-actions">
                <Link className="button" href="/register">
                  立即实名注册
                </Link>
                <Link className="button-secondary" href="/exams">
                  查看考试项目
                </Link>
              </div>
              <div className="hero-stats">
                {metrics.map((metric) => (
                  <div className="hero-stat" key={metric.label}>
                    <strong>{metric.value}</strong>
                    <span>{metric.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="sidebar-stack">
              <div className="quick-panel">
                <div className="panel-header">
                  <h2>快捷入口</h2>
                  <span className="caption">服务全流程</span>
                </div>
                <div className="quick-grid">
                  <Link className="quick-link" href="/register">
                    <strong>考生注册</strong>
                    <span>实名建档，建立个人考试中心。</span>
                  </Link>
                  <Link className="quick-link" href="/exams">
                    <strong>考试报名</strong>
                    <span>按项目选择岗位并提交报考信息。</span>
                  </Link>
                  <Link className="quick-link" href="/payments">
                    <strong>网上缴费</strong>
                    <span>审核通过后在线完成报名费支付。</span>
                  </Link>
                  <Link className="quick-link" href="/tickets">
                    <strong>打印准考证</strong>
                    <span>开放后获取 A4 版准考证。</span>
                  </Link>
                  <Link className="quick-link" href="/scores">
                    <strong>成绩查询</strong>
                    <span>按准考证号或证件号查询成绩。</span>
                  </Link>
                  <Link className="quick-link" href="/admin/login">
                    <strong>后台管理</strong>
                    <span>考试项目、审核、订单和公告运营。</span>
                  </Link>
                </div>
              </div>
              <div className="notice-panel">
                <div className="panel-header">
                  <h2>最新公告</h2>
                  <Link href="/admin/notices" className="caption">
                    管理发布
                  </Link>
                </div>
                <ul className="notice-list">
                  {notices.slice(0, 4).map((notice) => (
                    <li key={notice.id}>
                      <Link href={`/notices/${notice.id}`}>
                        <span>{notice.title}</span>
                        <span className="notice-date">{notice.publishedAt}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 考试分类导航 */}
        {categories.length > 0 && (
          <section className="exam-categories">
            <div className="category-tabs">
              <Link href="/" className="active">全部</Link>
              {categories.map((cat) => (
                <Link key={cat.id} href={`/category/${cat.slug}`}>
                  {cat.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="page-section">
          <div className="section-title">
            <div>
              <h2>报名中的考试项目</h2>
              <p>
                平台按多考试项目运营，每个项目独立配置报名时间、审核时间、缴费截止时间、准考证打印窗口和成绩发布时间。
              </p>
            </div>
            <Link className="button-ghost" href="/exams">
              查看全部项目
            </Link>
          </div>
          <div className="cards-2">
            {exams.map((exam) => {
              const phase = getRegistrationPhase(exam);

              return (
                <article className="feature-panel" key={exam.id}>
                  <div className="badge-row">
                    <span className="badge">{exam.category}</span>
                    <span className="badge">{exam.location}</span>
                    <span className={`badge ${phase === "open" ? "success" : phase === "upcoming" ? "warning" : "danger"}`}>
                      {getRegistrationLabel(exam)}
                    </span>
                  </div>
                  <h3>{exam.title}</h3>
                  <p>{exam.description}</p>
                  <ul className="guide-list">
                    <li>报名时间：{exam.registrationStart} 至 {exam.registrationEnd}</li>
                    <li>缴费截止：{exam.paymentEnd}</li>
                    <li>准考证打印：{exam.ticketStart}</li>
                  </ul>
                  <div className="actions-row">
                    {phase === "closed" ? (
                      <span className="button-secondary">报名已结束</span>
                    ) : (
                      <Link className="button" href={`/exams/${exam.slug}`}>
                        进入报名
                      </Link>
                    )}
                    <Link className="button-secondary" href="/payments">
                      缴费说明
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="page-section">
          <div className="cards-3">
            <div className="card">
              <h2>报考流程</h2>
              <ul className="timeline">
                {guideSteps.map((step, index) => (
                  <li key={step}>
                    <strong>{String(index + 1).padStart(2, "0")}.</strong> {step}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card">
              <h2>平台特色</h2>
              <ul className="timeline">
                <li>支持多考试项目长期运营，统一门户对外发布。</li>
                <li>审核、缴费、准考证、成绩联动，减少线下人工通知。</li>
                <li>后台支持公告、成绩导入、订单追踪和统计看板。</li>
              </ul>
            </div>
            <div className="faq-card">
              <h2>常见问题</h2>
              <ul className="faq-list">
                {faqItems.map((item) => (
                  <li key={item.question}>
                    <h3>{item.question}</h3>
                    <p>{item.answer}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}

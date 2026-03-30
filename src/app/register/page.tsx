import Link from "next/link";
import { CandidateRegisterForm } from "@/components/candidate/candidate-register-form";
import { SiteFrame } from "@/components/layout/site-frame";
import { PageHero } from "@/components/shared/page-hero";

export default function RegisterPage() {
  return (
    <SiteFrame currentPath="">
      <PageHero
        title="考生实名注册"
        description="首次报名请先完成实名注册。当前页面使用表单原型与 API 接口联动设计，可直接对接真实短信、实名核验和正式数据库。"
      />
      <main className="page-section layout-grid">
        <section className="card">
          <div className="panel-header">
            <h2>注册信息</h2>
          </div>
          <CandidateRegisterForm />
        </section>
        <aside className="content-stack">
          <section className="status-panel">
            <h2>注册后可办理</h2>
            <ul className="timeline">
              <li>在线选择考试项目并提交报名资料</li>
              <li>查看资格审核结果与驳回原因</li>
              <li>完成网上缴费并打印准考证</li>
              <li>成绩发布后在线查询考试成绩</li>
            </ul>
            <div className="actions-row" style={{ marginTop: 16 }}>
              <Link className="button-secondary" href="/login">
                已有账号，去登录
              </Link>
            </div>
          </section>
        </aside>
      </main>
    </SiteFrame>
  );
}

import { use } from "react";
import Link from "next/link";
import { CandidateLoginForm } from "@/components/candidate/candidate-login-form";
import { SiteFrame } from "@/components/layout/site-frame";
import { PageHero } from "@/components/shared/page-hero";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const resolvedSearchParams = searchParams ? use(searchParams) : undefined;

  return (
    <SiteFrame currentPath="">
      <PageHero
        title="考生登录"
        description="支持手机号或身份证号登录。接入正式认证后，可在服务端设置会话、角色权限和后台登录态。"
      />
      <main className="page-section layout-grid">
        <section className="card">
          <div className="panel-header">
            <h2>登录表单</h2>
            <span className="badge">API: /api/auth/login</span>
          </div>
          <CandidateLoginForm nextPath={resolvedSearchParams?.next} />
        </section>
        <aside className="content-stack">
          <section className="status-panel">
            <h2>账号说明</h2>
            <ul className="timeline">
              <li>同一身份证号只允许注册一个考生账号。</li>
              <li>忘记密码可通过手机号校验或人工客服找回。</li>
              <li>演示考生账号：13800000001 / 123456</li>
              <li>后台管理端可扩展为独立管理员登录入口。</li>
            </ul>
            <div className="actions-row" style={{ marginTop: 16 }}>
              <Link className="button-secondary" href="/dashboard">
                查看演示个人中心
              </Link>
            </div>
          </section>
        </aside>
      </main>
    </SiteFrame>
  );
}

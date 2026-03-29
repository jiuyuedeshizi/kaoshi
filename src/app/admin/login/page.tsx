import { use } from "react";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { SiteFrame } from "@/components/layout/site-frame";
import { PageHero } from "@/components/shared/page-hero";

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const resolvedSearchParams = searchParams ? use(searchParams) : undefined;

  return (
    <SiteFrame currentPath="">
      <PageHero
        title="后台管理登录"
        description="后台页面和后台接口均需要管理员登录后才可访问。当前演示账号已预填，可直接进入后台查看完整流程。"
      />
      <main className="page-section layout-grid">
        <section className="card">
          <div className="panel-header">
            <h2>管理员认证</h2>
            <span className="badge">API: /api/admin/login</span>
          </div>
          <AdminLoginForm nextPath={resolvedSearchParams?.next} />
        </section>
        <aside className="content-stack">
          <section className="status-panel">
            <h2>演示账号</h2>
            <ul className="timeline">
              <li>管理员：13800000099 / admin123</li>
              <li>审核员：13800000088 / review123</li>
              <li>审核员可访问后台首页、报名审核、订单管理。</li>
            </ul>
          </section>
        </aside>
      </main>
    </SiteFrame>
  );
}

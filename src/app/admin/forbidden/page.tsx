import Link from "next/link";
import { SiteFrame } from "@/components/layout/site-frame";
import { PageHero } from "@/components/shared/page-hero";

export default async function AdminForbiddenPage() {
  return (
    <SiteFrame currentPath="/admin">
      <PageHero
        title="无权限访问该后台模块"
        description="当前登录账号已通过认证，但不具备访问这个管理模块的权限。请使用系统管理员账号登录，或联系管理员分配更高权限。"
      />
      <main className="page-section cards-2">
        <section className="status-panel">
          <h2>可继续操作</h2>
          <div className="actions-row">
            <Link className="button" href="/admin">
              返回后台首页
            </Link>
            <Link className="button-secondary" href="/admin/logout">
              切换后台账号
            </Link>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}

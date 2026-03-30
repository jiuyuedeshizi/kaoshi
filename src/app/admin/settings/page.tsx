import { AdminSettingsForm } from "@/components/admin/admin-settings-form";
import { SiteFrame } from "@/components/layout/site-frame";
import { PageHero } from "@/components/shared/page-hero";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { repo } from "@/lib/repository";

export default async function AdminSettingsPage() {
  await requireAdminPageAccess("MANAGE_SETTINGS", "/admin/settings");
  const platformSetting = await repo.findSystemSetting("platform");

  return (
    <SiteFrame currentPath="/admin">
      <PageHero title="系统设置" description="维护平台名称、联系电话和上传限制等基础配置，后续可在此扩展支付、通知和成绩查询策略。" />
      <main className="page-section">
        <section className="card">
          <div className="panel-header">
            <h2>基础配置</h2>
          </div>
          <AdminSettingsForm initialValue={platformSetting?.value} />
        </section>
      </main>
    </SiteFrame>
  );
}

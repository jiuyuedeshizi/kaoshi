import { SiteFrame } from "@/components/layout/site-frame";
import { PageHero } from "@/components/shared/page-hero";
import { requireAdminPageAccess } from "@/lib/admin-auth";

const roleMatrix = [
  { role: "管理员", permissions: "全部模块、全部操作" },
  { role: "审核员", permissions: "工作台、报名审核、订单查看" },
  { role: "排考管理员", permissions: "考区考点、考场编排、准考证管理" },
  { role: "成绩管理员", permissions: "成绩管理、统计报表" },
  { role: "财务人员", permissions: "订单管理、统计报表、日志查看" },
  { role: "公告管理员", permissions: "公告管理、工作台" },
];

export default async function AdminPermissionsPage() {
  await requireAdminPageAccess("MANAGE_PERMISSIONS", "/admin/permissions");

  return (
    <SiteFrame currentPath="/admin">
      <PageHero title="权限管理" description="当前版本先按固定角色维护菜单与操作权限，后续可继续扩展为更细的角色、菜单、操作三级授权。" />
      <main className="page-section">
        <section className="table-card">
          <div className="panel-header">
            <h2>角色权限矩阵</h2>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>角色</th>
                <th>权限范围</th>
              </tr>
            </thead>
            <tbody>
              {roleMatrix.map((item) => (
                <tr key={item.role}>
                  <td>{item.role}</td>
                  <td>{item.permissions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </SiteFrame>
  );
}

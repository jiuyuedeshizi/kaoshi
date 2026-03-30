import { AdminListControls } from "@/components/admin/admin-list-controls";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { SiteFrame } from "@/components/layout/site-frame";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { repo } from "@/lib/repository";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminPageAccess("MANAGE_USERS", "/admin/users");
  const params = ((await searchParams) ?? {}) as Record<string, string | undefined>;
  const keyword = typeof params.keyword === "string" ? params.keyword : undefined;
  const role = typeof params.role === "string" ? params.role : undefined;
  const page = Number(params.page ?? "1") || 1;
  const result = await repo.listUsersPage({ keyword, role: role as never, page, pageSize: 10 });

  return (
    <SiteFrame currentPath="/admin">
      <PageHero title="用户管理" description="集中查看考生和后台账号，后续可以在此扩展禁用、拉黑、重置密码等操作。" />
      <main className="page-section">
        <section className="table-card">
          <div className="panel-header">
            <h2>用户列表</h2>
            <span className="badge success">共 {result.total} 人</span>
          </div>
          <AdminListControls
            action="/admin/users"
            keyword={keyword}
            keywordPlaceholder="搜索姓名、手机号、身份证号"
            filters={[
              {
                name: "role",
                value: role,
                placeholder: "全部角色",
                options: [
                  { label: "考生", value: "CANDIDATE" },
                  { label: "管理员", value: "ADMIN" },
                  { label: "审核员", value: "REVIEWER" },
                  { label: "排考管理员", value: "SCHEDULER" },
                ],
              },
            ]}
          />
          <table className="table">
            <thead>
              <tr>
                <th>姓名</th>
                <th>手机号</th>
                <th>身份证号</th>
                <th>角色</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {result.items.length ? (
                result.items.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.phone}</td>
                    <td>{user.idCard}</td>
                    <td>{user.role}</td>
                    <td>{user.disabled ? "已禁用" : user.blacklisted ? "黑名单" : "正常"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <EmptyState title="暂无用户" description="当前筛选条件下没有匹配的用户记录。" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <AdminPagination pathname="/admin/users" page={result.page} totalPages={result.totalPages} params={{ keyword, role }} />
        </section>
      </main>
    </SiteFrame>
  );
}

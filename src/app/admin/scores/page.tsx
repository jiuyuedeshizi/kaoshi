import { AdminScoreForm } from "@/components/admin/admin-score-form";
import { AdminListControls } from "@/components/admin/admin-list-controls";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { SiteFrame } from "@/components/layout/site-frame";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { repo } from "@/lib/repository";

export default async function AdminScoresPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminPageAccess("MANAGE_SCORES", "/admin/scores");
  const params = ((await searchParams) ?? {}) as Record<string, string | undefined>;
  const keyword = typeof params.keyword === "string" ? params.keyword : undefined;
  const published = typeof params.published === "string" ? params.published : undefined;
  const page = Number(params.page ?? "1") || 1;
  const result = await repo.listScoresPage({
    keyword,
    published: published as "true" | "false" | undefined,
    page,
    pageSize: 8,
  });
  const scores = result.items;

  return (
    <SiteFrame currentPath="/admin">
      <PageHero
        title="成绩管理"
        description="支持成绩导入、发布状态控制和查询说明维护，当前接口以 JSON 导入为主，后续可扩展 Excel 模板导入。"
      />
      <main className="page-section cards-2">
        <section className="card">
          <div className="panel-header">
            <h2>导入成绩</h2>
            <span className="badge">API: /api/admin/scores/import</span>
          </div>
          <AdminScoreForm />
        </section>
        <section className="table-card">
          <div className="panel-header">
            <h2>成绩记录</h2>
            <span className="badge success">共 {result.total} 条</span>
          </div>
          <AdminListControls
            action="/admin/scores"
            keyword={keyword}
            keywordPlaceholder="搜索准考证号、身份证号、报名单号"
            filters={[
              {
                name: "published",
                value: published,
                placeholder: "全部状态",
                options: [
                  { label: "已发布", value: "true" },
                  { label: "未发布", value: "false" },
                ],
              },
            ]}
          />
          <table className="table">
            <thead>
              <tr>
                <th>准考证号</th>
                <th>身份证号</th>
                <th>成绩</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {scores.length ? (
                scores.map((score) => (
                  <tr key={score.id}>
                    <td>{score.ticketNo}</td>
                    <td>{score.idCard}</td>
                    <td>{score.score}</td>
                    <td>{score.published ? "已发布" : "未发布"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>
                    <EmptyState
                      title="没有符合条件的成绩记录"
                      description="可以先导入成绩，或调整当前筛选条件后再查看。"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <AdminPagination
            pathname="/admin/scores"
            page={result.page}
            totalPages={result.totalPages}
            params={{ keyword, published }}
          />
        </section>
      </main>
    </SiteFrame>
  );
}

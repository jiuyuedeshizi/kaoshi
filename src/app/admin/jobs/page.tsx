import { AdminJobForm } from "@/components/admin/admin-job-form";
import { AdminListControls } from "@/components/admin/admin-list-controls";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { SiteFrame } from "@/components/layout/site-frame";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { repo } from "@/lib/repository";

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminPageAccess("MANAGE_JOBS", "/admin/jobs");
  const params = ((await searchParams) ?? {}) as Record<string, string | undefined>;
  const keyword = typeof params.keyword === "string" ? params.keyword : undefined;
  const examProjectId = typeof params.examProjectId === "string" ? params.examProjectId : undefined;
  const page = Number(params.page ?? "1") || 1;
  const exams = await repo.listExamProjects();
  const result = await repo.listJobPositionsPage({ keyword, examProjectId, page, pageSize: 8 });

  return (
    <SiteFrame currentPath="/admin">
      <PageHero title="岗位管理" description="统一维护岗位代码、岗位名称、条件要求和考试科目，报名时从这里选择岗位并写入岗位快照。" />
      <main className="page-section cards-2">
        <section className="card">
          <div className="panel-header">
            <h2>新增岗位</h2>
            <span className="badge success">已接入报名链路</span>
          </div>
          <AdminJobForm exams={exams} />
        </section>
        <section className="table-card">
          <div className="panel-header">
            <h2>岗位列表</h2>
            <span className="badge success">共 {result.total} 条</span>
          </div>
          <AdminListControls
            action="/admin/jobs"
            keyword={keyword}
            keywordPlaceholder="搜索岗位代码、岗位名称、单位"
            filters={[
              {
                name: "examProjectId",
                value: examProjectId,
                placeholder: "全部考试项目",
                options: exams.map((item) => ({ label: item.title, value: item.id })),
              },
            ]}
          />
          <table className="table">
            <thead>
              <tr>
                <th>岗位代码</th>
                <th>岗位名称</th>
                <th>招录人数</th>
                <th>考试科目</th>
              </tr>
            </thead>
            <tbody>
              {result.items.length ? (
                result.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.code}</td>
                    <td>{item.name}</td>
                    <td>{item.quota}</td>
                    <td>{item.examSubject ?? "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>
                    <EmptyState title="暂无岗位" description="请先新增岗位，考生报名页才会显示可选岗位列表。" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <AdminPagination pathname="/admin/jobs" page={result.page} totalPages={result.totalPages} params={{ keyword, examProjectId }} />
        </section>
      </main>
    </SiteFrame>
  );
}

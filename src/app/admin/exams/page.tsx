import { AdminExamForm } from "@/components/admin/admin-exam-form";
import { AdminListControls } from "@/components/admin/admin-list-controls";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { SiteFrame } from "@/components/layout/site-frame";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { formatMoney } from "@/lib/format";
import { repo } from "@/lib/repository";

export default async function AdminExamsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminPageAccess("MANAGE_EXAMS", "/admin/exams");
  const params = ((await searchParams) ?? {}) as Record<string, string | undefined>;
  const keyword = typeof params.keyword === "string" ? params.keyword : undefined;
  const category = typeof params.category === "string" ? params.category : undefined;
  const page = Number(params.page ?? "1") || 1;
  const allExams = await repo.listExamProjects();
  const result = await repo.listExamProjectsPage({
    keyword,
    category,
    page,
    pageSize: 6,
  });
  const exams = result.items;
  const categories = Array.from(new Set(allExams.map((item) => item.category)));

  return (
    <SiteFrame currentPath="/admin">
      <PageHero
        title="考试项目管理"
        description="配置考试基础信息、报名和缴费时间窗口、成绩发布时间、准考证打印开放时间与公告说明。"
      />
      <main className="page-section cards-2">
        <section className="card">
          <div className="panel-header">
            <h2>新建项目</h2>
            <span className="badge">API: /api/admin/exams</span>
          </div>
          <AdminExamForm />
        </section>
        <section className="table-card">
          <div className="panel-header">
            <h2>已发布项目</h2>
            <span className="badge success">共 {result.total} 条</span>
          </div>
          <AdminListControls
            action="/admin/exams"
            keyword={keyword}
            keywordPlaceholder="搜索考试标题、考区、项目标识"
            filters={[
              {
                name: "category",
                value: category,
                placeholder: "全部类别",
                options: categories.map((item) => ({ label: item, value: item })),
              },
            ]}
          />
          <table className="table">
            <thead>
              <tr>
                <th>标题</th>
                <th>考区</th>
                <th>费用</th>
              </tr>
            </thead>
            <tbody>
              {exams.length ? (
                exams.map((exam) => (
                  <tr key={exam.id}>
                    <td>{exam.title}</td>
                    <td>{exam.location}</td>
                    <td>{formatMoney(exam.fee)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3}>
                    <EmptyState
                      title="没有符合条件的考试项目"
                      description="可以直接在左侧创建新项目，或调整筛选条件后重新查看。"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <AdminPagination
            pathname="/admin/exams"
            page={result.page}
            totalPages={result.totalPages}
            params={{ keyword, category }}
          />
        </section>
      </main>
    </SiteFrame>
  );
}

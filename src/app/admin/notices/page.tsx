import Link from "next/link";
import { AdminListControls } from "@/components/admin/admin-list-controls";
import { AdminNoticeForm } from "@/components/admin/admin-notice-form";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { SiteFrame } from "@/components/layout/site-frame";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { repo } from "@/lib/repository";

export default async function AdminNoticesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminPageAccess("MANAGE_NOTICES", "/admin/notices");
  const params = ((await searchParams) ?? {}) as Record<string, string | undefined>;
  const keyword = typeof params.keyword === "string" ? params.keyword : undefined;
  const category = typeof params.category === "string" ? params.category : undefined;
  const page = Number(params.page ?? "1") || 1;
  const allNotices = await repo.listNotices();
  const result = await repo.listNoticesPage({
    keyword,
    category,
    page,
    pageSize: 6,
  });
  const notices = result.items;
  const categories = Array.from(new Set(allNotices.map((item) => item.category)));

  return (
    <SiteFrame currentPath="/admin">
      <PageHero
        title="公告管理"
        description="维护首页公告、报名通知、准考证打印提醒和成绩发布说明，支持置顶和分类管理。"
      />
      <main className="page-section cards-2">
        <section className="card">
          <div className="panel-header">
            <h2>发布公告</h2>
            <span className="badge">API: /api/admin/notices</span>
          </div>
          <AdminNoticeForm />
        </section>
        <section className="table-card">
          <div className="panel-header">
            <h2>已发布公告</h2>
            <span className="badge success">共 {result.total} 条</span>
          </div>
          <AdminListControls
            action="/admin/notices"
            keyword={keyword}
            keywordPlaceholder="搜索公告标题、摘要、正文"
            filters={[
              {
                name: "category",
                value: category,
                placeholder: "全部分类",
                options: categories.map((item) => ({ label: item, value: item })),
              },
            ]}
          />
          <table className="table">
            <thead>
              <tr>
                <th>标题</th>
                <th>分类</th>
                <th>发布时间</th>
              </tr>
            </thead>
            <tbody>
              {notices.length ? (
                notices.map((notice) => (
                  <tr key={notice.id}>
                    <td>
                      <Link href={`/notices/${notice.id}`}>{notice.title}</Link>
                    </td>
                    <td>{notice.category}</td>
                    <td>{notice.publishedAt}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3}>
                    <EmptyState
                      title="没有符合条件的公告"
                      description="可以在左侧发布新公告，或者调整筛选条件后重新查看。"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <AdminPagination
            pathname="/admin/notices"
            page={result.page}
            totalPages={result.totalPages}
            params={{ keyword, category }}
          />
        </section>
      </main>
    </SiteFrame>
  );
}

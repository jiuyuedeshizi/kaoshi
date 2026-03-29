import { AdminListControls } from "@/components/admin/admin-list-controls";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminApplicationReviewForm } from "@/components/admin/admin-application-review-form";
import { SiteFrame } from "@/components/layout/site-frame";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { StatusBadge } from "@/components/shared/status-badge";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { repo } from "@/lib/repository";

function isFileLink(value: string) {
  return value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://");
}

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminPageAccess("REVIEW_APPLICATIONS", "/admin/applications");
  const params = ((await searchParams) ?? {}) as Record<string, string | undefined>;
  const keyword = typeof params.keyword === "string" ? params.keyword : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;
  const page = Number(params.page ?? "1") || 1;
  const result = await repo.listApplicationsPage({
    keyword,
    status: status as never,
    page,
    pageSize: 8,
  });
  const applications = result.items;

  return (
    <SiteFrame currentPath="/admin">
      <PageHero
        title="报名审核"
        description="支持按报名状态筛选、查看材料快照、记录审核意见，并通过接口统一驱动审核状态流转。"
      />
      <main className="page-section cards-2">
        <section className="table-card">
          <div className="panel-header">
            <h2>待审核记录</h2>
            <span className="badge">共 {result.total} 条</span>
          </div>
          <AdminListControls
            action="/admin/applications"
            keyword={keyword}
            keywordPlaceholder="搜索报名单号、专业、学历、单位"
            filters={[
              {
                name: "status",
                value: status,
                placeholder: "全部状态",
                options: [
                  { label: "草稿", value: "DRAFT" },
                  { label: "已提交", value: "SUBMITTED" },
                  { label: "已通过", value: "APPROVED" },
                  { label: "已驳回", value: "REJECTED" },
                  { label: "已缴费", value: "PAID" },
                  { label: "可打印准考证", value: "TICKET_READY" },
                ],
              },
            ]}
          />
          <table className="table">
            <thead>
              <tr>
                <th>报名单号</th>
                <th>专业</th>
                <th>学历</th>
                <th>状态</th>
                <th>材料</th>
              </tr>
            </thead>
            <tbody>
              {applications.length ? (
                applications.map((application) => (
                  <tr key={application.id}>
                    <td>{application.id}</td>
                    <td>{application.major}</td>
                    <td>{application.education}</td>
                    <td>
                      <StatusBadge status={application.status} />
                    </td>
                    <td>
                      <div style={{ display: "grid", gap: 6 }}>
                        {application.photoUrl ? (
                          isFileLink(application.photoUrl) ? (
                            <a href={application.photoUrl} target="_blank" rel="noreferrer">
                              证件照
                            </a>
                          ) : (
                            <span>证件照：{application.photoUrl}</span>
                          )
                        ) : null}
                        {application.documents.length ? (
                          application.documents.map((documentUrl, index) => (
                            isFileLink(documentUrl) ? (
                              <a key={documentUrl} href={documentUrl} target="_blank" rel="noreferrer">
                                材料 {index + 1}
                              </a>
                            ) : (
                              <span key={`${application.id}-${index}`}>材料 {index + 1}：{documentUrl}</span>
                            )
                          ))
                        ) : (
                          <span style={{ color: "var(--muted)" }}>未上传</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      title="当前没有符合条件的报名记录"
                      description="可以调整筛选条件，或者等待考生提交报名后再进入审核。"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <AdminPagination
            pathname="/admin/applications"
            page={result.page}
            totalPages={result.totalPages}
            params={{ keyword, status }}
          />
        </section>
        <section className="card">
          <div className="panel-header">
            <h2>审核动作示例</h2>
            <span className="badge warning">批量审核可扩展</span>
          </div>
          {applications.length ? (
            <AdminApplicationReviewForm applicationId={applications[0]?.id} />
          ) : (
            <EmptyState
              title="暂无可操作的审核对象"
              description="筛选到具体报名记录后，就可以在这里提交通过或驳回意见。"
            />
          )}
        </section>
      </main>
    </SiteFrame>
  );
}

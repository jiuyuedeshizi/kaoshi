import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFrame } from "@/components/layout/site-frame";
import { PageHero } from "@/components/shared/page-hero";
import { repo } from "@/lib/repository";

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const notice = await repo.findNoticeById(id);

  if (!notice) {
    notFound();
  }

  const latest = (await repo.listNotices()).filter((item) => item.id !== notice.id).slice(0, 4);

  return (
    <SiteFrame currentPath="">
      <PageHero
        title={notice.title}
        description={`${notice.category} · 发布时间 ${notice.publishedAt}${notice.pinned ? " · 置顶公告" : ""}`}
        actions={
          <Link className="button-secondary" href="/">
            返回首页
          </Link>
        }
      />
      <main className="page-section layout-grid">
        <section className="card">
          <div className="panel-header">
            <h2>公告正文</h2>
            <span className={`badge ${notice.pinned ? "danger" : ""}`.trim()}>
              {notice.category}
            </span>
          </div>
          <p>{notice.summary}</p>
          <div className="notice-article">
            {notice.body.split("\n").map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
        <aside className="content-stack">
          <section className="status-panel">
            <h2>最新公告</h2>
            <ul className="notice-list">
              {latest.map((item) => (
                <li key={item.id}>
                  <Link href={`/notices/${item.id}`}>
                    <span>{item.title}</span>
                    <span className="notice-date">{item.publishedAt}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </main>
    </SiteFrame>
  );
}

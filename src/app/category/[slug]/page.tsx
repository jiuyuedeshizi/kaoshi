import { notFound } from "next/navigation";
import Link from "next/link";
import { repo } from "@/lib/repository";
import { SiteFrame } from "@/components/layout/site-frame";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Derive category name from slug
  const categoryName = slug.replace(/-/g, " ");
  const exams = await repo.listExamsByCategory(categoryName);

  if (!exams.length) {
    notFound();
  }

  // Get the first exam's category info
  const firstExam = exams[0];
  const categoryDisplayName = firstExam.category;

  return (
    <SiteFrame currentPath="/">
      <div className="category-header">
        <h1>{categoryDisplayName}</h1>
      </div>

      <div className="exam-grid">
        {exams.map((exam) => (
          <div key={exam.id} className="exam-card">
            <img src={exam.logoUrl || "/images/logo-default.png"} alt="" className="exam-card-logo" />
            <div className="exam-info">
              <h3>{exam.title}</h3>
              {exam.subtitle && <p className="exam-subtitle">{exam.subtitle}</p>}
              <div className="exam-meta">
                <span>报名时间：{exam.registrationStart} ~ {exam.registrationEnd}</span>
              </div>
              <div className="exam-actions">
                <Link href={`/exams/${exam.slug}`} className="btn-primary">
                  查看详情
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SiteFrame>
  );
}

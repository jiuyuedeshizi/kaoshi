import { notFound } from "next/navigation";
import { requireCandidatePageAccess } from "@/lib/candidate-auth";
import { ExamApplicationForm } from "@/components/candidate/exam-application-form";
import { SiteFrame } from "@/components/layout/site-frame";
import { PageHero } from "@/components/shared/page-hero";
import { repo } from "@/lib/repository";

export default async function ExamDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const current = await requireCandidatePageAccess(`/exams/${slug}`);
  const exam = await repo.findExamBySlug(slug);

  if (!exam) {
    notFound();
  }

  const existingApplication = await repo.findApplicationByUserAndExam(current.user.id, exam.id);
  const jobs = await repo.listJobPositionsByExam(exam.id);

  return (
    <SiteFrame currentPath="/exams">
      {/* 考试独立 Header */}
      <div className="exam-header">
        <div className="exam-header-content">
          <img
            src={exam.logoUrl || "/images/logo-default.png"}
            alt=""
            className="exam-logo"
          />
          <div className="exam-title-area">
            <h1>{exam.title}</h1>
            {exam.subtitle && <p className="exam-subtitle">{exam.subtitle}</p>}
          </div>
        </div>
        {exam.contactPhone && (
          <div className="exam-contact">
            咨询电话：{exam.contactPhone}
          </div>
        )}
      </div>

      <PageHero
        title={exam.title}
        description={`${exam.location} · ${exam.category}。请按要求填写报考信息、上传材料并提交资格审核。`}
      />
      <main className="page-section layout-grid">
        <section className="card">
          <div className="panel-header">
            <h2>报名信息填报</h2>
          </div>
          <ExamApplicationForm
            examProjectId={exam.id}
            admissionNotice={exam.admissionNotice}
            jobs={jobs}
            initialApplication={existingApplication ?? undefined}
          />
        </section>
        <aside className="content-stack">
          <section className="status-panel">
            <h2>时间安排</h2>
            <ul className="timeline">
              <li>报名开始：{exam.registrationStart}</li>
              <li>报名截止：{exam.registrationEnd}</li>
              <li>审核截止：{exam.reviewEnd}</li>
              <li>缴费截止：{exam.paymentEnd}</li>
              <li>打印准考证：{exam.ticketStart}</li>
            </ul>
          </section>
        </aside>
      </main>
    </SiteFrame>
  );
}

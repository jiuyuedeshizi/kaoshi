import Link from "next/link";
import { SiteFrame } from "@/components/layout/site-frame";
import { PageHero } from "@/components/shared/page-hero";
import { getRegistrationLabel, getRegistrationPhase } from "@/lib/exam-window";
import { formatMoney } from "@/lib/format";
import { repo } from "@/lib/repository";

export default async function ExamsPage() {
  const exams = await repo.listExamProjects();

  return (
    <SiteFrame currentPath="/exams">
      <PageHero
        title="考试报名"
        description="查看平台已发布的考试项目，按项目完成岗位选择、信息填报、材料上传、提交审核和缴费。"
      />
      <main className="page-section">
        <div className="cards-2">
          {exams.map((exam) => {
            const phase = getRegistrationPhase(exam);

            return (
              <section className="card" key={exam.id}>
                <div className="badge-row">
                  <span className="badge">{exam.category}</span>
                  <span className="badge">{exam.location}</span>
                  <span className="badge danger">报名费 {formatMoney(exam.fee)}</span>
                  <span className={`badge ${phase === "open" ? "success" : phase === "upcoming" ? "warning" : "danger"}`}>
                    {getRegistrationLabel(exam)}
                  </span>
                </div>
                <h2>{exam.title}</h2>
                <p>{exam.description}</p>
                <ul className="timeline">
                  <li>报名时间：{exam.registrationStart} 至 {exam.registrationEnd}</li>
                  <li>审核截止：{exam.reviewEnd}</li>
                  <li>缴费截止：{exam.paymentEnd}</li>
                  <li>成绩发布时间：{exam.scoreReleaseAt}</li>
                </ul>
                <div className="actions-row">
                  {phase === "closed" ? (
                    <span className="button-secondary">报名已结束</span>
                  ) : (
                    <Link className="button" href={`/exams/${exam.slug}`}>
                      填写报名信息
                    </Link>
                  )}
                  <Link className="button-secondary" href="/dashboard">
                    查看我的报名
                  </Link>
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </SiteFrame>
  );
}

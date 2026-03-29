import { ScoreQueryForm } from "@/components/candidate/score-query-form";
import { SiteFrame } from "@/components/layout/site-frame";
import { PageHero } from "@/components/shared/page-hero";

export default function ScoresPage() {
  return (
    <SiteFrame currentPath="/scores">
      <PageHero
        title="成绩查询"
        description="成绩发布后，考生可通过准考证号或身份证号查询成绩。后台支持批量导入、预览校验与发布控制。"
      />
      <main className="page-section">
        <ScoreQueryForm />
      </main>
    </SiteFrame>
  );
}

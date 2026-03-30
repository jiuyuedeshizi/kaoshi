import { SiteFrame } from "@/components/layout/site-frame";
import { PageHero } from "@/components/shared/page-hero";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { repo } from "@/lib/repository";

export default async function AdminReportsPage() {
  await requireAdminPageAccess("VIEW_REPORTS", "/admin/reports");
  const summary = await repo.getReportSummary();

  return (
    <SiteFrame currentPath="/admin">
      <PageHero title="统计报表" description="按报名、缴费、准考证、成绩等维度提供后台运营概览，作为后续导出和更细报表的基础页面。" />
      <main className="page-section cards-4">
        <section className="kpi"><span className="caption">用户总数</span><strong>{summary.userCount}</strong><span className="muted">包含考生与后台账号</span></section>
        <section className="kpi"><span className="caption">岗位总数</span><strong>{summary.jobCount}</strong><span className="muted">当前已配置岗位</span></section>
        <section className="kpi"><span className="caption">报名总量</span><strong>{summary.applicationCount}</strong><span className="muted">已保存或已提交报名记录</span></section>
        <section className="kpi"><span className="caption">缴费转化率</span><strong>{summary.paymentRate}</strong><span className="muted">按报名总量计算</span></section>
        <section className="kpi"><span className="caption">审核通过</span><strong>{summary.approvedApplications}</strong><span className="muted">审核已通过报名</span></section>
        <section className="kpi"><span className="caption">已支付订单</span><strong>{summary.paidOrders}</strong><span className="muted">支付成功订单数</span></section>
        <section className="kpi"><span className="caption">已生成准考证</span><strong>{summary.ticketCount}</strong><span className="muted">可打印准考证数量</span></section>
        <section className="kpi"><span className="caption">已发布成绩</span><strong>{summary.publishedScores}</strong><span className="muted">已向考生开放查询</span></section>
      </main>
    </SiteFrame>
  );
}

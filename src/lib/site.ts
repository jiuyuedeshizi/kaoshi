import {
  adminMetrics,
  faqItems,
  frontMetrics,
  guideSteps,
} from "@/lib/demo-data";
import { getRoleLabel } from "@/lib/admin-auth";
import { repo } from "@/lib/repository";
import { paymentProviderLabel, statusLabel } from "@/lib/format";
import type {
  AdminOperationLog,
  Application,
  Notice,
  PaymentOrder,
  ScoreRecord,
  UserRole,
} from "@/lib/types";

type AdminTone = "danger" | "warning" | "success";

function parseDateTime(value?: string) {
  if (!value) {
    return null;
  }

  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isWithinWindow(start?: string, end?: string) {
  const now = new Date();
  const startAt = parseDateTime(start);
  const endAt = parseDateTime(end);

  if (!startAt || !endAt) {
    return false;
  }

  return now >= startAt && now <= endAt;
}

function sortDesc<T>(items: T[], getValue: (item: T) => string | undefined) {
  return [...items].sort((a, b) => {
    const aDate = parseDateTime(getValue(a))?.getTime() ?? 0;
    const bDate = parseDateTime(getValue(b))?.getTime() ?? 0;
    return bDate - aDate;
  });
}

function buildRoleTasks(
  role: Exclude<UserRole, "CANDIDATE">,
  counts: {
    pendingApplications: number;
    failedOrders: number;
    pendingOrders: number;
    unscheduledApplications: number;
    unpublishedScores: number;
    notices: number;
    logs: number;
  },
) {
  const tasksByRole: Record<
    Exclude<UserRole, "CANDIDATE">,
    Array<{ label: string; value: string; href: string; tone?: AdminTone }>
  > = {
    ADMIN: [
      { label: "待审核报名", value: String(counts.pendingApplications), href: "/admin/applications", tone: counts.pendingApplications ? "warning" : "success" },
      { label: "支付异常", value: String(counts.failedOrders), href: "/admin/orders?status=FAILED", tone: counts.failedOrders ? "danger" : "success" },
      { label: "待排考人数", value: String(counts.unscheduledApplications), href: "/admin/scheduling", tone: counts.unscheduledApplications ? "warning" : "success" },
      { label: "待发布成绩", value: String(counts.unpublishedScores), href: "/admin/scores?published=false", tone: counts.unpublishedScores ? "warning" : "success" },
    ],
    REVIEWER: [
      { label: "待审核报名", value: String(counts.pendingApplications), href: "/admin/applications", tone: counts.pendingApplications ? "warning" : "success" },
      { label: "待支付订单", value: String(counts.pendingOrders), href: "/admin/orders?status=PENDING", tone: counts.pendingOrders ? "warning" : "success" },
      { label: "异常订单", value: String(counts.failedOrders), href: "/admin/orders?status=FAILED", tone: counts.failedOrders ? "danger" : "success" },
    ],
    SCHEDULER: [
      { label: "待排考人数", value: String(counts.unscheduledApplications), href: "/admin/scheduling", tone: counts.unscheduledApplications ? "warning" : "success" },
      { label: "待开放准考证", value: String(counts.pendingOrders), href: "/admin/tickets", tone: counts.pendingOrders ? "warning" : "success" },
    ],
    SCORE_MANAGER: [
      { label: "待发布成绩", value: String(counts.unpublishedScores), href: "/admin/scores?published=false", tone: counts.unpublishedScores ? "warning" : "success" },
      { label: "已归档成绩", value: String(Math.max(adminMetrics.length, 0)), href: "/admin/reports", tone: "success" },
    ],
    FINANCE: [
      { label: "待支付订单", value: String(counts.pendingOrders), href: "/admin/orders?status=PENDING", tone: counts.pendingOrders ? "warning" : "success" },
      { label: "支付异常", value: String(counts.failedOrders), href: "/admin/orders?status=FAILED", tone: counts.failedOrders ? "danger" : "success" },
      { label: "审计日志", value: String(counts.logs), href: "/admin/logs", tone: "success" },
    ],
    CONTENT_MANAGER: [
      { label: "已发布公告", value: String(counts.notices), href: "/admin/notices", tone: "success" },
      { label: "待更新公告", value: counts.notices ? "建议复核" : "立即发布", href: "/admin/notices", tone: counts.notices ? "warning" : "danger" },
    ],
  };

  return tasksByRole[role];
}

function buildRiskAlerts(
  applications: Application[],
  orders: PaymentOrder[],
  scores: ScoreRecord[],
  notices: Notice[],
) {
  const alerts: Array<{ title: string; detail: string; href: string; tone: AdminTone }> = [];
  const pendingApplications = applications.filter((item) => item.status === "SUBMITTED").length;
  const failedOrders = orders.filter((item) => item.status === "FAILED").length;
  const unpublishedScores = scores.filter((item) => !item.published).length;

  if (pendingApplications) {
    alerts.push({
      title: "报名审核积压",
      detail: `当前有 ${pendingApplications} 份已提交报名待审核，建议优先处理避免影响缴费链路。`,
      href: "/admin/applications",
      tone: "warning",
    });
  }

  if (failedOrders) {
    alerts.push({
      title: "支付异常待核验",
      detail: `发现 ${failedOrders} 笔失败订单，需结合回调日志与渠道状态排查。`,
      href: "/admin/orders?status=FAILED",
      tone: "danger",
    });
  }

  if (unpublishedScores) {
    alerts.push({
      title: "成绩尚未发布",
      detail: `当前有 ${unpublishedScores} 条成绩未发布，发布前请再次核验导入批次。`,
      href: "/admin/scores?published=false",
      tone: "warning",
    });
  }

  if (!notices.length) {
    alerts.push({
      title: "缺少公告触达",
      detail: "当前尚未发布后台公告，建议补充报名或成绩相关通知。",
      href: "/admin/notices",
      tone: "danger",
    });
  }

  if (!alerts.length) {
    alerts.push({
      title: "运行状态平稳",
      detail: "当前未发现明显积压或异常，可继续按计划推进报名、排考与发布工作。",
      href: "/admin/reports",
      tone: "success",
    });
  }

  return alerts;
}

function buildSystemSignals(orders: PaymentOrder[], scores: ScoreRecord[], logs: AdminOperationLog[]) {
  const lastOrder = sortDesc(orders, (item) => item.paidAt ?? item.createdAt)[0];
  const lastScore = sortDesc(scores, (item) => item.releasedAt)[0];
  const lastLog = sortDesc(logs, (item) => item.createdAt)[0];

  return [
    {
      label: "支付通道",
      value: lastOrder ? `${paymentProviderLabel(lastOrder.provider)} · ${statusLabel(lastOrder.status)}` : "暂无订单",
      tone: (lastOrder?.status === "FAILED" ? "danger" : lastOrder?.status === "PENDING" ? "warning" : "success") as AdminTone,
    },
    {
      label: "最近成绩动作",
      value: lastScore ? `${lastScore.ticketNo} · ${lastScore.published ? "已发布" : "待发布"}` : "暂无成绩记录",
      tone: (lastScore?.published ? "success" : "warning") as AdminTone,
    },
    {
      label: "最近后台动作",
      value: lastLog ? `${lastLog.adminName} · ${lastLog.action}` : "暂无操作日志",
      tone: "success" as AdminTone,
    },
  ];
}

export async function getHomePageData() {
  const [notices, exams, categories] = await Promise.all([
    repo.listNotices(),
    repo.listPublishedExams(),
    repo.listExamCategories(),
  ]);
  return {
    notices,
    exams,
    categories,
    metrics: frontMetrics,
    faqItems,
    guideSteps,
  };
}

export async function getCandidateDashboard(userId: string) {
  const candidate = await repo.findUserById(userId);
  const apps = await repo.findApplicationsByUser(userId);
  const exams = await repo.listExamProjects();
  const applicationIds = new Set(apps.map((item) => item.id));
  const orders = await repo.listOrders();
  const tickets = await repo.listTickets();

  return {
    candidate: candidate ?? undefined,
    apps,
    exams,
    orders: orders.filter((item) => applicationIds.has(item.applicationId)),
    tickets: tickets.filter((item) => applicationIds.has(item.applicationId)),
  };
}

export async function getAdminDashboard(currentUser: {
  name: string;
  role: "ADMIN" | "REVIEWER" | "SCHEDULER" | "SCORE_MANAGER" | "FINANCE" | "CONTENT_MANAGER";
}) {
  const [exams, applications, orders, scores, notices, logs] = await Promise.all([
    repo.listExamProjects(),
    repo.listApplications(),
    repo.listOrders(),
    repo.listScores(),
    repo.listNotices(),
    repo.listAdminOperationLogs(8),
  ]);
  const openRegistrationExam = exams.find((exam) => isWithinWindow(exam.registrationStart, exam.registrationEnd));
  const pendingApplications = applications.filter((item) => item.status === "SUBMITTED");
  const approvedUnpaidApplications = applications.filter((item) => item.status === "APPROVED");
  const unscheduledApplications = applications.filter((item) => item.status === "PAID");
  const failedOrders = orders.filter((item) => item.status === "FAILED");
  const pendingOrders = orders.filter((item) => item.status === "PENDING");
  const unpublishedScores = scores.filter((item) => !item.published);
  const recentLogs = sortDesc(logs, (item) => item.createdAt).slice(0, 5);
  const recentNotices = sortDesc(notices, (item) => item.publishedAt).slice(0, 4);

  return {
    currentUser: {
      ...currentUser,
      roleLabel: getRoleLabel(currentUser.role),
    },
    metrics: adminMetrics,
    exams,
    applications,
    orders,
    scores,
    notices,
    logs,
    focusProject: openRegistrationExam?.title ?? exams[0]?.title ?? "全局运营视图",
    taskCards: buildRoleTasks(currentUser.role, {
      pendingApplications: pendingApplications.length,
      failedOrders: failedOrders.length,
      pendingOrders: pendingOrders.length,
      unscheduledApplications: unscheduledApplications.length,
      unpublishedScores: unpublishedScores.length,
      notices: notices.length,
      logs: logs.length,
    }),
    pipeline: [
      { label: "待审核报名", value: pendingApplications.length, hint: "考生已提交，等待资料审核", href: "/admin/applications", tone: (pendingApplications.length ? "warning" : "success") as AdminTone },
      { label: "审核通过待缴费", value: approvedUnpaidApplications.length, hint: "可继续推动订单支付", href: "/admin/orders?status=PENDING", tone: (approvedUnpaidApplications.length ? "warning" : "success") as AdminTone },
      { label: "已缴费待排考", value: unscheduledApplications.length, hint: "需要生成准考证与座位", href: "/admin/scheduling", tone: (unscheduledApplications.length ? "warning" : "success") as AdminTone },
      { label: "待发布成绩", value: unpublishedScores.length, hint: "已导入但尚未开放查询", href: "/admin/scores?published=false", tone: (unpublishedScores.length ? "warning" : "success") as AdminTone },
    ],
    riskAlerts: buildRiskAlerts(applications, orders, scores, notices),
    recentLogs,
    recentNotices,
    systemSignals: buildSystemSignals(orders, scores, logs),
  };
}

export async function getAdminShellData() {
  const [exams, orders, tickets, scores] = await Promise.all([
    repo.listExamProjects(),
    repo.listOrders(),
    repo.listTickets(),
    repo.listScores(),
  ]);
  const openExam = exams.find((item) => isWithinWindow(item.registrationStart, item.registrationEnd));
  const latestTicket = sortDesc(tickets, (item) => item.examTime)[0];
  const unpublishedScores = scores.filter((item) => !item.published).length;
  const failedOrders = orders.filter((item) => item.status === "FAILED").length;

  return {
    currentProjectLabel: openExam?.title ?? exams[0]?.title ?? "全局运营视图",
    statusChips: [
      {
        label: "当前开放报名",
        value: openExam?.title ?? "暂无开放项目",
        tone: (openExam ? "success" : "warning") as AdminTone,
      },
      {
        label: "支付异常",
        value: failedOrders ? `${failedOrders} 笔待核查` : "运行正常",
        tone: (failedOrders ? "danger" : "success") as AdminTone,
      },
      {
        label: "最近编排",
        value: latestTicket ? `${latestTicket.venue} · ${latestTicket.room}` : "暂无编排结果",
        tone: (latestTicket ? "success" : "warning") as AdminTone,
      },
      {
        label: "成绩发布",
        value: unpublishedScores ? `${unpublishedScores} 条待发布` : "已同步",
        tone: (unpublishedScores ? "warning" : "success") as AdminTone,
      },
    ],
  };
}

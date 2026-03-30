import {
  adminMetrics,
  faqItems,
  frontMetrics,
  guideSteps,
} from "@/lib/demo-data";
import { getRoleLabel } from "@/lib/admin-auth";
import { repo } from "@/lib/repository";

export async function getHomePageData() {
  return {
    notices: await repo.listNotices(),
    exams: await repo.listExamProjects(),
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
  return {
    currentUser: {
      ...currentUser,
      roleLabel: getRoleLabel(currentUser.role),
    },
    metrics: adminMetrics,
    exams: await repo.listExamProjects(),
    applications: await repo.listApplications(),
    orders: await repo.listOrders(),
    scores: await repo.listScores(),
    notices: await repo.listNotices(),
    logs: await repo.listAdminOperationLogs(8),
  };
}

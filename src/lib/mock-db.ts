import {
  adminOperationLogs,
  applications,
  examProjects,
  notices,
  paymentOrders,
  scores,
  tickets,
  users,
} from "@/lib/demo-data";
import type {
  AdmissionTicket,
  AdminOperationLog,
  AdminSession,
  Application,
  ExamProject,
  Notice,
  PaymentOrder,
  ScoreRecord,
  User,
} from "@/lib/types";

const state = {
  users: [...users],
  examProjects: [...examProjects],
  applications: [...applications],
  orders: [...paymentOrders],
  tickets: [...tickets],
  scores: [...scores],
  notices: [...notices],
  adminOperationLogs: [...adminOperationLogs],
  sessions: [] as AdminSession[],
};

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function sanitizeUser(user: User): User {
  return {
    ...user,
    password: "",
  };
}

export const db = {
  listNotices(): Notice[] {
    return [...state.notices].sort((a, b) => {
      if (a.pinned === b.pinned) {
        return b.publishedAt.localeCompare(a.publishedAt);
      }

      return Number(b.pinned) - Number(a.pinned);
    });
  },
  findNoticeById(id: string) {
    return state.notices.find((item) => item.id === id);
  },
  createNotice(notice: Omit<Notice, "id" | "publishedAt">) {
    const record: Notice = {
      id: createId("notice"),
      publishedAt: new Date().toISOString(),
      ...notice,
    };
    state.notices.unshift(record);
    return record;
  },
  listExamProjects(): ExamProject[] {
    return [...state.examProjects];
  },
  findExamById(id: string) {
    return state.examProjects.find((item) => item.id === id);
  },
  findExamBySlug(slug: string) {
    return state.examProjects.find((item) => item.slug === slug);
  },
  createExamProject(exam: Omit<ExamProject, "id" | "published"> & { published?: boolean }) {
    const record: ExamProject = {
      id: createId("exam"),
      published: exam.published ?? true,
      ...exam,
    };
    state.examProjects.unshift(record);
    return record;
  },
  listUsers(): User[] {
    return state.users.map(sanitizeUser);
  },
  findUserById(id: string) {
    const user = state.users.find((item) => item.id === id);
    return user ? sanitizeUser(user) : undefined;
  },
  createUser(input: Omit<User, "id" | "role"> & { role?: User["role"] }) {
    const record: User = {
      id: createId("user"),
      role: input.role ?? "CANDIDATE",
      ...input,
    };
    state.users.push(record);
    return sanitizeUser(record);
  },
  authenticate(account: string, password: string) {
    const user = state.users.find(
      (user) => (user.phone === account || user.idCard === account) && user.password === password,
    );
    return user ? sanitizeUser(user) : undefined;
  },
  createAdminSession(userId: string, role: AdminSession["role"]) {
    const record: AdminSession = {
      id: createId("session"),
      userId,
      role,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
    };
    state.sessions = state.sessions.filter((item) => item.userId !== userId);
    state.sessions.unshift(record);
    return record;
  },
  findAdminSession(id: string) {
    const session = state.sessions.find((item) => item.id === id);
    if (!session) {
      return null;
    }

    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      state.sessions = state.sessions.filter((item) => item.id !== id);
      return null;
    }

    return session;
  },
  deleteAdminSession(id: string) {
    state.sessions = state.sessions.filter((item) => item.id !== id);
  },
  listApplications() {
    return [...state.applications];
  },
  findApplication(id: string) {
    return state.applications.find((item) => item.id === id);
  },
  findApplicationsByUser(userId: string) {
    return state.applications.filter((item) => item.userId === userId);
  },
  findApplicationByUserAndExam(userId: string, examProjectId: string) {
    return state.applications.find((item) => item.userId === userId && item.examProjectId === examProjectId);
  },
  createApplication(
    input: Omit<Application, "id" | "status" | "createdAt" | "submittedAt" | "approvedAt">,
  ) {
    const record: Application = {
      id: createId("app"),
      status: "DRAFT",
      createdAt: new Date().toISOString(),
      ...input,
    };
    state.applications.unshift(record);
    return record;
  },
  updateApplication(
    id: string,
    input: Omit<Application, "id" | "userId" | "examProjectId" | "status" | "createdAt" | "submittedAt" | "approvedAt">,
  ) {
    const record = state.applications.find((item) => item.id === id);
    if (!record) {
      return null;
    }

    record.major = input.major;
    record.education = input.education;
    record.employer = input.employer;
    record.photoUrl = input.photoUrl;
    record.documents = input.documents;
    return record;
  },
  submitApplication(id: string) {
    const record = state.applications.find((item) => item.id === id);
    if (!record) {
      return null;
    }

    record.status = "SUBMITTED";
    record.submittedAt = new Date().toISOString();
    return record;
  },
  reviewApplication(id: string, status: "APPROVED" | "REJECTED", reviewNote: string) {
    const record = state.applications.find((item) => item.id === id);
    if (!record) {
      return null;
    }

    record.status = status;
    record.reviewNote = reviewNote;
    record.approvedAt = status === "APPROVED" ? new Date().toISOString() : undefined;
    return record;
  },
  listOrders() {
    return [...state.orders];
  },
  createOrder(input: Omit<PaymentOrder, "id" | "orderNo" | "status" | "createdAt">) {
    const record: PaymentOrder = {
      id: createId("order"),
      orderNo: `KS${Date.now()}`,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      ...input,
    };
    state.orders.unshift(record);
    return record;
  },
  markOrderPaid(orderNo: string, payload: Record<string, string>) {
    const record = state.orders.find((item) => item.orderNo === orderNo);
    if (!record) {
      return null;
    }

    if (record.status === "PAID") {
      return record;
    }

    record.status = "PAID";
    record.paidAt = new Date().toISOString();
    record.callbackPayload = payload;

    const application = state.applications.find((item) => item.id === record.applicationId);
    if (application) {
      application.status = "TICKET_READY";
      const existingTicket = state.tickets.find((item) => item.applicationId === application.id);
      if (!existingTicket) {
        state.tickets.unshift({
          id: createId("ticket"),
          applicationId: application.id,
          ticketNo: `${Date.now()}`.slice(-12),
          examTime: "2026-05-18 09:00",
          venue: "呼和浩特职业学院综合楼",
          room: "B201",
          seatNo: "12",
          templateVersion: "v1",
        });
      }
    }

    return record;
  },
  listTickets() {
    return [...state.tickets];
  },
  findTicketByApplicationId(applicationId: string): AdmissionTicket | undefined {
    return state.tickets.find((item) => item.applicationId === applicationId);
  },
  listScores() {
    return [...state.scores];
  },
  findScore(criteria: { ticketNo?: string; idCard?: string }): ScoreRecord | undefined {
    return state.scores.find((item) => {
      const ticketMatch = criteria.ticketNo ? item.ticketNo === criteria.ticketNo : true;
      const idCardMatch = criteria.idCard ? item.idCard === criteria.idCard : true;
      return ticketMatch && idCardMatch;
    });
  },
  importScore(input: Omit<ScoreRecord, "id" | "releasedAt">) {
    const existing = state.scores.find((item) => item.applicationId === input.applicationId);
    if (existing) {
      Object.assign(existing, input, {
        releasedAt: input.published ? new Date().toISOString() : undefined,
      });
      return existing;
    }

    const record: ScoreRecord = {
      id: createId("score"),
      releasedAt: input.published ? new Date().toISOString() : undefined,
      ...input,
    };
    state.scores.unshift(record);
    return record;
  },
  listAdminOperationLogs() {
    return [...state.adminOperationLogs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  createAdminOperationLog(input: Omit<AdminOperationLog, "id" | "createdAt">) {
    const record: AdminOperationLog = {
      id: createId("log"),
      createdAt: new Date().toISOString(),
      ...input,
    };
    state.adminOperationLogs.unshift(record);
    return record;
  },
};

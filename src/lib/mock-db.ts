import {
  adminOperationLogs,
  applications,
  examAreas,
  examProjects,
  examRooms,
  examVenues,
  jobPositions,
  loginLogs,
  notices,
  paymentCallbackLogs,
  paymentOrders,
  scores,
  systemSettings,
  ticketDownloadLogs,
  ticketTemplates,
  tickets,
  users,
} from "@/lib/demo-data";
import type {
  AdmissionTicket,
  AdminOperationLog,
  AdminSession,
  Application,
  ExamArea,
  ExamProject,
  ExamRoom,
  ExamVenue,
  JobPosition,
  LoginLog,
  Notice,
  PaymentCallbackLog,
  PaymentOrder,
  ScoreRecord,
  SystemSetting,
  TicketDownloadLog,
  TicketTemplate,
  User,
} from "@/lib/types";

const state = {
  users: [...users],
  examProjects: [...examProjects],
  jobPositions: [...jobPositions],
  examAreas: [...examAreas],
  examVenues: [...examVenues],
  examRooms: [...examRooms],
  applications: [...applications],
  orders: [...paymentOrders],
  ticketTemplates: [...ticketTemplates],
  tickets: [...tickets],
  scores: [...scores],
  notices: [...notices],
  adminOperationLogs: [...adminOperationLogs],
  loginLogs: [...loginLogs],
  paymentCallbackLogs: [...paymentCallbackLogs],
  ticketDownloadLogs: [...ticketDownloadLogs],
  systemSettings: [...systemSettings],
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
  listJobPositions(): JobPosition[] {
    return [...state.jobPositions];
  },
  findJobPositionById(id: string) {
    return state.jobPositions.find((item) => item.id === id);
  },
  createJobPosition(input: Omit<JobPosition, "id" | "createdAt" | "enabled"> & { enabled?: boolean }) {
    const record: JobPosition = {
      id: createId("job"),
      createdAt: new Date().toISOString(),
      enabled: input.enabled ?? true,
      ...input,
    };
    state.jobPositions.unshift(record);
    return record;
  },
  listExamAreas(): ExamArea[] {
    return [...state.examAreas];
  },
  createExamArea(input: Omit<ExamArea, "id" | "createdAt" | "enabled"> & { enabled?: boolean }) {
    const record: ExamArea = {
      id: createId("area"),
      createdAt: new Date().toISOString(),
      enabled: input.enabled ?? true,
      ...input,
    };
    state.examAreas.unshift(record);
    return record;
  },
  listExamVenues(): ExamVenue[] {
    return [...state.examVenues];
  },
  createExamVenue(input: Omit<ExamVenue, "id" | "createdAt" | "enabled"> & { enabled?: boolean }) {
    const record: ExamVenue = {
      id: createId("venue"),
      createdAt: new Date().toISOString(),
      enabled: input.enabled ?? true,
      ...input,
    };
    state.examVenues.unshift(record);
    return record;
  },
  listExamRooms(): ExamRoom[] {
    return [...state.examRooms];
  },
  createExamRoom(input: Omit<ExamRoom, "id" | "createdAt" | "enabled"> & { enabled?: boolean }) {
    const record: ExamRoom = {
      id: createId("room"),
      createdAt: new Date().toISOString(),
      enabled: input.enabled ?? true,
      ...input,
    };
    state.examRooms.unshift(record);
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
      disabled: false,
      blacklisted: false,
      ...input,
    };
    state.users.push(record);
    return sanitizeUser(record);
  },
  authenticate(account: string, password: string) {
    const user = state.users.find(
      (item) => (item.phone === account || item.idCard === account) && item.password === password,
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
    input: Omit<Application, "id" | "status" | "createdAt" | "submittedAt" | "approvedAt" | "materialRevision" | "locked">,
  ) {
    const record: Application = {
      id: createId("app"),
      status: "DRAFT",
      createdAt: new Date().toISOString(),
      materialRevision: 0,
      locked: false,
      ...input,
    };
    state.applications.unshift(record);
    return record;
  },
  updateApplication(
    id: string,
    input: Omit<
      Application,
      "id" | "userId" | "examProjectId" | "status" | "createdAt" | "submittedAt" | "approvedAt" | "materialRevision" | "locked"
    >,
  ) {
    const record = state.applications.find((item) => item.id === id);
    if (!record) {
      return null;
    }

    record.jobPositionId = input.jobPositionId;
    record.jobCode = input.jobCode;
    record.subjectName = input.subjectName;
    record.jobSnapshot = input.jobSnapshot;
    record.major = input.major;
    record.education = input.education;
    record.employer = input.employer;
    record.photoUrl = input.photoUrl;
    record.documents = input.documents;
    record.materialRevision = (record.materialRevision ?? 0) + 1;
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
    record.providerTradeNo = payload.tradeNo ?? record.providerTradeNo;
    record.reconciliationStatus = "PAID";
    record.lastQueriedAt = new Date().toISOString();
    record.paidAt = new Date().toISOString();
    record.callbackPayload = payload;

    const application = state.applications.find((item) => item.id === record.applicationId);
    if (application) {
      application.status = "PAID";
    }

    return record;
  },
  listTickets() {
    return [...state.tickets];
  },
  findTicketByApplicationId(applicationId: string): AdmissionTicket | undefined {
    return state.tickets.find((item) => item.applicationId === applicationId);
  },
  listTicketTemplates() {
    return [...state.ticketTemplates];
  },
  findDefaultTicketTemplate() {
    return state.ticketTemplates.find((item) => item.isDefault) ?? state.ticketTemplates[0];
  },
  saveTicketTemplate(input: Omit<TicketTemplate, "id" | "createdAt" | "updatedAt">) {
    state.ticketTemplates = state.ticketTemplates.map((item) => ({ ...item, isDefault: false }));
    const existing = state.ticketTemplates.find((item) => item.version === input.version);
    if (existing) {
      Object.assign(existing, input, { updatedAt: new Date().toISOString() });
      existing.isDefault = input.isDefault;
      return existing;
    }

    const record: TicketTemplate = {
      id: createId("template"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...input,
    };
    state.ticketTemplates.unshift(record);
    return record;
  },
  generateTicketsByExam(input: { examProjectId: string; areaId?: string; regenerate?: boolean }) {
    const exam = state.examProjects.find((item) => item.id === input.examProjectId);
    if (!exam) {
      throw new Error("考试项目不存在");
    }

    const template = this.findDefaultTicketTemplate();
    const venues = state.examVenues.filter((item) => item.enabled && (!input.areaId || item.areaId === input.areaId));
    const roomPool = venues.flatMap((venue) =>
      state.examRooms
        .filter((room) => room.venueId === venue.id && room.enabled)
        .map((room) => ({
          room,
          venue,
          area: state.examAreas.find((area) => area.id === venue.areaId)!,
        })),
    );

    if (!roomPool.length) {
      throw new Error("请先配置考点和考场");
    }

    const apps = state.applications.filter((item) => item.examProjectId === input.examProjectId && ["PAID", "TICKET_READY"].includes(item.status));
    let runningIndex = 1;
    const results: AdmissionTicket[] = [];

    for (const app of apps) {
      const existing = state.tickets.find((item) => item.applicationId === app.id);
      if (existing && !input.regenerate) {
        results.push(existing);
        continue;
      }

      let selected = roomPool[roomPool.length - 1];
      let seatOffset = runningIndex;
      let capacityCursor = 0;
      for (const candidateRoom of roomPool) {
        capacityCursor += candidateRoom.room.capacity;
        if (runningIndex <= capacityCursor) {
          selected = candidateRoom;
          seatOffset = runningIndex - (capacityCursor - candidateRoom.room.capacity);
          break;
        }
      }

      const record: AdmissionTicket = {
        id: existing?.id ?? createId("ticket"),
        applicationId: app.id,
        ticketNo: `${new Date(exam.ticketStart.replace(" ", "T")).getFullYear()}${selected.area.code}${String(runningIndex).padStart(6, "0")}`,
        examTime: exam.ticketStart,
        areaName: selected.area.name,
        venue: selected.venue.name,
        venueAddress: selected.venue.address,
        room: selected.room.name,
        seatNo: String(seatOffset).padStart(2, "0"),
        examSubject: app.subjectName ?? exam.defaultSubject,
        jobCode: app.jobCode,
        jobName: app.major,
        templateId: template?.id,
        schedulingStatus: "ASSIGNED",
        templateVersion: template?.version ?? "v2",
      };

      if (existing) {
        Object.assign(existing, record);
        results.push(existing);
      } else {
        state.tickets.unshift(record);
        results.push(record);
      }

      app.status = "TICKET_READY";
      runningIndex += 1;
    }

    return results;
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
  listLoginLogs() {
    return [...state.loginLogs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  createLoginLog(input: Omit<LoginLog, "id" | "createdAt">) {
    const record: LoginLog = {
      id: createId("login"),
      createdAt: new Date().toISOString(),
      ...input,
    };
    state.loginLogs.unshift(record);
    return record;
  },
  listPaymentCallbackLogs() {
    return [...state.paymentCallbackLogs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  createPaymentCallbackLog(input: Omit<PaymentCallbackLog, "id" | "createdAt">) {
    const record: PaymentCallbackLog = {
      id: createId("callback"),
      createdAt: new Date().toISOString(),
      ...input,
    };
    state.paymentCallbackLogs.unshift(record);
    return record;
  },
  listTicketDownloadLogs() {
    return [...state.ticketDownloadLogs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  createTicketDownloadLog(input: Omit<TicketDownloadLog, "id" | "createdAt">) {
    const record: TicketDownloadLog = {
      id: createId("download"),
      createdAt: new Date().toISOString(),
      ...input,
    };
    state.ticketDownloadLogs.unshift(record);
    return record;
  },
  listSystemSettings() {
    return [...state.systemSettings];
  },
  findSystemSetting(key: string) {
    return state.systemSettings.find((item) => item.key === key) ?? null;
  },
  upsertSystemSetting(key: string, value: Record<string, unknown>) {
    const existing = state.systemSettings.find((item) => item.key === key);
    if (existing) {
      existing.value = value;
      existing.updatedAt = new Date().toISOString();
      return existing;
    }

    const record: SystemSetting = {
      id: createId("setting"),
      key,
      value,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.systemSettings.unshift(record);
    return record;
  },
};

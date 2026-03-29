import { Prisma } from "@prisma/client";
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
import { db as mockDb } from "@/lib/mock-db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getPrismaClient } from "@/lib/prisma";
import type {
  AdmissionTicket,
  AdminOperationLog,
  Application,
  ExamProject,
  Notice,
  PaginationResult,
  PaymentOrder,
  ScoreRecord,
  User,
} from "@/lib/types";

function formatDateTime(value: Date | string) {
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    const hour = String(value.getHours()).padStart(2, "0");
    const minute = String(value.getMinutes()).padStart(2, "0");
    const second = String(value.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }

  if (typeof value === "string") {
    return value.replace("T", " ").replace(".000Z", "").slice(0, 19);
  }

  return String(value);
}

function toUser(user: {
  id: string;
  role: User["role"];
  name: string;
  phone: string;
  idCard: string;
  passwordHash?: string;
  password?: string;
  gender?: string | null;
  email?: string | null;
  address?: string | null;
  emergencyContact?: string | null;
}): User {
  return {
    id: user.id,
    role: user.role,
    name: user.name,
    phone: user.phone,
    idCard: user.idCard,
    // Never expose stored credentials back into the app-facing user object.
    password: "",
    gender: user.gender ?? undefined,
    email: user.email ?? undefined,
    address: user.address ?? undefined,
    emergencyContact: user.emergencyContact ?? undefined,
  };
}

function toExamProject(exam: {
  id: string;
  slug: string;
  title: string;
  category: string;
  location: string;
  description: string;
  registrationStart: Date | string;
  registrationEnd: Date | string;
  reviewEnd: Date | string;
  paymentEnd: Date | string;
  ticketStart: Date | string;
  scoreReleaseAt: Date | string;
  fee: Prisma.Decimal | number;
  published: boolean;
  admissionNotice: string;
}): ExamProject {
  return {
    id: exam.id,
    slug: exam.slug,
    title: exam.title,
    category: exam.category,
    location: exam.location,
    description: exam.description,
    registrationStart: formatDateTime(exam.registrationStart),
    registrationEnd: formatDateTime(exam.registrationEnd),
    reviewEnd: formatDateTime(exam.reviewEnd),
    paymentEnd: formatDateTime(exam.paymentEnd),
    ticketStart: formatDateTime(exam.ticketStart),
    scoreReleaseAt: formatDateTime(exam.scoreReleaseAt),
    fee: Number(exam.fee),
    published: exam.published,
    admissionNotice: exam.admissionNotice,
  };
}

function toNotice(notice: {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  pinned: boolean;
  publishedAt: Date | string;
}): Notice {
  return {
    id: notice.id,
    title: notice.title,
    summary: notice.summary,
    body: notice.body,
    category: notice.category,
    pinned: notice.pinned,
    publishedAt: formatDateTime(notice.publishedAt),
  };
}

function toApplication(application: {
  id: string;
  examProjectId: string;
  userId: string;
  status: Application["status"];
  major: string;
  education: string;
  employer?: string | null;
  photoUrl?: string | null;
  documents?: Prisma.JsonValue;
  reviewNote?: string | null;
  submittedAt?: Date | null;
  approvedAt?: Date | null;
  createdAt: Date | string;
}): Application {
  return {
    id: application.id,
    examProjectId: application.examProjectId,
    userId: application.userId,
    status: application.status,
    major: application.major,
    education: application.education,
    employer: application.employer ?? undefined,
    photoUrl: application.photoUrl ?? undefined,
    documents: Array.isArray(application.documents) ? (application.documents as string[]) : [],
    reviewNote: application.reviewNote ?? undefined,
    submittedAt: application.submittedAt ? formatDateTime(application.submittedAt) : undefined,
    approvedAt: application.approvedAt ? formatDateTime(application.approvedAt) : undefined,
    createdAt: formatDateTime(application.createdAt),
  };
}

function toOrder(order: {
  id: string;
  orderNo: string;
  applicationId: string;
  amount: Prisma.Decimal | number;
  provider: PaymentOrder["provider"];
  status: PaymentOrder["status"];
  callbackPayload?: Prisma.JsonValue;
  createdAt: Date | string;
  paidAt?: Date | null;
}): PaymentOrder {
  return {
    id: order.id,
    orderNo: order.orderNo,
    applicationId: order.applicationId,
    amount: Number(order.amount),
    provider: order.provider,
    status: order.status,
    callbackPayload: (order.callbackPayload as Record<string, string> | undefined) ?? undefined,
    createdAt: formatDateTime(order.createdAt),
    paidAt: order.paidAt ? formatDateTime(order.paidAt) : undefined,
  };
}

function toTicket(ticket: {
  id: string;
  applicationId: string;
  ticketNo: string;
  examTime: Date | string;
  venue: string;
  room: string;
  seatNo: string;
  templateVersion: string;
  printedAt?: Date | null;
}): AdmissionTicket {
  return {
    id: ticket.id,
    applicationId: ticket.applicationId,
    ticketNo: ticket.ticketNo,
    examTime: formatDateTime(ticket.examTime),
    venue: ticket.venue,
    room: ticket.room,
    seatNo: ticket.seatNo,
    templateVersion: ticket.templateVersion,
    printedAt: ticket.printedAt ? formatDateTime(ticket.printedAt) : undefined,
  };
}

function toScore(score: {
  id: string;
  applicationId: string;
  ticketNo: string;
  idCard: string;
  score: Prisma.Decimal | number;
  ranking?: number | null;
  published: boolean;
  queryNote?: string | null;
  releasedAt?: Date | null;
}): ScoreRecord {
  return {
    id: score.id,
    applicationId: score.applicationId,
    ticketNo: score.ticketNo,
    idCard: score.idCard,
    score: Number(score.score),
    ranking: score.ranking ?? undefined,
    published: score.published,
    queryNote: score.queryNote ?? "",
    releasedAt: score.releasedAt ? formatDateTime(score.releasedAt) : undefined,
  };
}

function parseDate(value: string) {
  return new Date(value.replace(" ", "T"));
}

function normalizePage(page?: number) {
  return Math.max(1, page ?? 1);
}

function normalizePageSize(pageSize?: number) {
  return Math.min(50, Math.max(1, pageSize ?? 10));
}

function paginateItems<T>(items: T[], page = 1, pageSize = 10): PaginationResult<T> {
  const safePage = normalizePage(page);
  const safePageSize = normalizePageSize(pageSize);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const currentPage = Math.min(safePage, totalPages);
  const start = (currentPage - 1) * safePageSize;

  return {
    items: items.slice(start, start + safePageSize),
    total,
    page: currentPage,
    pageSize: safePageSize,
    totalPages,
  };
}

function includesKeyword(values: Array<string | undefined>, keyword?: string) {
  if (!keyword) {
    return true;
  }

  const normalized = keyword.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  return values.some((value) => value?.toLowerCase().includes(normalized));
}

function toAdminOperationLog(log: {
  id: string;
  adminUserId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string;
  detail: string;
  createdAt: Date | string;
}): AdminOperationLog {
  return {
    id: log.id,
    adminUserId: log.adminUserId,
    adminName: log.adminName,
    action: log.action,
    targetType: log.targetType,
    targetId: log.targetId,
    detail: log.detail,
    createdAt: formatDateTime(log.createdAt),
  };
}

export const repo = {
  async listNotices() {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.listNotices();
    const rows = await prisma.notice.findMany({ orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }] });
    return rows.map(toNotice);
  },
  async findNoticeById(id: string) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.findNoticeById(id);
    const row = await prisma.notice.findUnique({ where: { id } });
    return row ? toNotice(row) : null;
  },
  async createNotice(input: Omit<Notice, "id" | "publishedAt">) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.createNotice(input);
    const row = await prisma.notice.create({ data: input });
    return toNotice(row);
  },
  async listExamProjects() {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.listExamProjects();
    const rows = await prisma.examProject.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map(toExamProject);
  },
  async findExamById(id: string) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.findExamById(id);
    const row = await prisma.examProject.findUnique({ where: { id } });
    return row ? toExamProject(row) : null;
  },
  async findExamBySlug(slug: string) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.findExamBySlug(slug);
    const row = await prisma.examProject.findUnique({ where: { slug } });
    return row ? toExamProject(row) : null;
  },
  async createExamProject(input: Omit<ExamProject, "id" | "published"> & { published?: boolean }) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.createExamProject(input);
    const row = await prisma.examProject.create({
      data: {
        ...input,
        published: input.published ?? true,
        fee: input.fee,
        registrationStart: parseDate(input.registrationStart),
        registrationEnd: parseDate(input.registrationEnd),
        reviewEnd: parseDate(input.reviewEnd),
        paymentEnd: parseDate(input.paymentEnd),
        ticketStart: parseDate(input.ticketStart),
        scoreReleaseAt: parseDate(input.scoreReleaseAt),
      },
    });
    return toExamProject(row);
  },
  async listUsers() {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.listUsers();
    const rows = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map(toUser);
  },
  async findUserById(id: string) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.findUserById(id);
    const row = await prisma.user.findUnique({ where: { id } });
    return row ? toUser(row) : null;
  },
  async createUser(input: Omit<User, "id" | "role"> & { role?: User["role"] }) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.createUser(input);
    const passwordHash = hashPassword(input.password);
    const row = await prisma.user.create({
      data: {
        role: input.role ?? "CANDIDATE",
        name: input.name,
        phone: input.phone,
        idCard: input.idCard,
        passwordHash,
        gender: input.gender,
        email: input.email,
        address: input.address,
        emergencyContact: input.emergencyContact,
      },
    });
    return toUser(row);
  },
  async authenticate(account: string, password: string) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.authenticate(account, password);
    const row = await prisma.user.findFirst({
      where: {
        OR: [{ phone: account }, { idCard: account }],
      },
    });
    if (!row || !verifyPassword(password, row.passwordHash)) {
      return null;
    }
    return toUser(row);
  },
  async listApplications() {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.listApplications();
    const rows = await prisma.application.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map(toApplication);
  },
  async findApplication(id: string) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.findApplication(id);
    const row = await prisma.application.findUnique({ where: { id } });
    return row ? toApplication(row) : null;
  },
  async findApplicationsByUser(userId: string) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.findApplicationsByUser(userId);
    const rows = await prisma.application.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
    return rows.map(toApplication);
  },
  async findApplicationByUserAndExam(userId: string, examProjectId: string) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.findApplicationByUserAndExam(userId, examProjectId);
    const row = await prisma.application.findFirst({
      where: { userId, examProjectId },
      orderBy: { createdAt: "desc" },
    });
    return row ? toApplication(row) : null;
  },
  async createApplication(input: Omit<Application, "id" | "status" | "createdAt" | "submittedAt" | "approvedAt">) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.createApplication(input);
    const row = await prisma.application.create({
      data: {
        examProjectId: input.examProjectId,
        userId: input.userId,
        major: input.major,
        education: input.education,
        employer: input.employer,
        photoUrl: input.photoUrl,
        documents: input.documents,
      },
    });
    return toApplication(row);
  },
  async updateApplication(
    id: string,
    input: Omit<Application, "id" | "userId" | "examProjectId" | "status" | "createdAt" | "submittedAt" | "approvedAt">,
  ) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.updateApplication(id, input);
    const row = await prisma.application.update({
      where: { id },
      data: {
        major: input.major,
        education: input.education,
        employer: input.employer,
        photoUrl: input.photoUrl,
        documents: input.documents,
      },
    });
    return toApplication(row);
  },
  async submitApplication(id: string) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.submitApplication(id);
    const row = await prisma.application.update({
      where: { id },
      data: { status: "SUBMITTED", submittedAt: new Date() },
    });
    return toApplication(row);
  },
  async reviewApplication(id: string, status: "APPROVED" | "REJECTED", reviewNote: string) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.reviewApplication(id, status, reviewNote);
    const row = await prisma.application.update({
      where: { id },
      data: {
        status,
        reviewNote,
        approvedAt: status === "APPROVED" ? new Date() : null,
      },
    });
    return toApplication(row);
  },
  async listOrders() {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.listOrders();
    const rows = await prisma.paymentOrder.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map(toOrder);
  },
  async createOrder(input: Omit<PaymentOrder, "id" | "orderNo" | "status" | "createdAt">) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.createOrder(input);
    const row = await prisma.paymentOrder.create({
      data: {
        applicationId: input.applicationId,
        amount: input.amount,
        provider: input.provider,
        orderNo: `KS${Date.now()}`,
      },
    });
    return toOrder(row);
  },
  async findOrdersByApplicationId(applicationId: string) {
    const prisma = getPrismaClient();
    if (!prisma) {
      return mockDb.listOrders().filter((item) => item.applicationId === applicationId);
    }

    const rows = await prisma.paymentOrder.findMany({
      where: { applicationId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toOrder);
  },
  async findOrderByOrderNo(orderNo: string) {
    const prisma = getPrismaClient();
    if (!prisma) {
      return mockDb.listOrders().find((item) => item.orderNo === orderNo) ?? null;
    }

    const row = await prisma.paymentOrder.findUnique({ where: { orderNo } });
    return row ? toOrder(row) : null;
  },
  async markOrderPaid(orderNo: string, payload: Record<string, string>) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.markOrderPaid(orderNo, payload);
    const current = await prisma.paymentOrder.findUnique({ where: { orderNo } });
    if (!current) {
      return null;
    }

    if (current.status === "PAID") {
      return toOrder(current);
    }

    const updated = await prisma.paymentOrder.update({
      where: { orderNo },
      data: { status: "PAID", paidAt: new Date(), callbackPayload: payload },
    });
    await prisma.application.update({
      where: { id: updated.applicationId },
      data: { status: "TICKET_READY" },
    });
    const existingTicket = await prisma.admissionTicket.findUnique({ where: { applicationId: updated.applicationId } });
    if (!existingTicket) {
      await prisma.admissionTicket.create({
        data: {
          applicationId: updated.applicationId,
          ticketNo: `${Date.now()}`.slice(-12),
          examTime: new Date("2026-05-18T09:00:00"),
          venue: "呼和浩特职业学院综合楼",
          room: "B201",
          seatNo: "12",
        },
      });
    }
    return toOrder(updated);
  },
  async listTickets() {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.listTickets();
    const rows = await prisma.admissionTicket.findMany({ orderBy: { examTime: "asc" } });
    return rows.map(toTicket);
  },
  async findTicketByApplicationId(applicationId: string) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.findTicketByApplicationId(applicationId);
    const row = await prisma.admissionTicket.findUnique({ where: { applicationId } });
    return row ? toTicket(row) : null;
  },
  async listScores() {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.listScores();
    const rows = await prisma.scoreRecord.findMany({ orderBy: { releasedAt: "desc" } });
    return rows.map(toScore);
  },
  async findScore(criteria: { ticketNo?: string; idCard?: string }) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.findScore(criteria);
    const row = await prisma.scoreRecord.findFirst({
      where: {
        ...(criteria.ticketNo ? { ticketNo: criteria.ticketNo } : {}),
        ...(criteria.idCard ? { idCard: criteria.idCard } : {}),
      },
    });
    return row ? toScore(row) : null;
  },
  async importScore(input: Omit<ScoreRecord, "id" | "releasedAt">) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.importScore(input);
    const row = await prisma.scoreRecord.upsert({
      where: { applicationId: input.applicationId },
      update: {
        ticketNo: input.ticketNo,
        idCard: input.idCard,
        score: input.score,
        ranking: input.ranking,
        published: input.published,
        queryNote: input.queryNote,
        releasedAt: input.published ? new Date() : null,
      },
      create: {
        applicationId: input.applicationId,
        ticketNo: input.ticketNo,
        idCard: input.idCard,
        score: input.score,
        ranking: input.ranking,
        published: input.published,
        queryNote: input.queryNote,
        releasedAt: input.published ? new Date() : null,
      },
    });
    return toScore(row);
  },
  async listApplicationsPage(query: {
    status?: Application["status"];
    keyword?: string;
    page?: number;
    pageSize?: number;
  } = {}) {
    const records = await this.listApplications();
    const filtered = records.filter((item) => {
      const statusMatch = query.status ? item.status === query.status : true;
      const keywordMatch = includesKeyword([item.id, item.major, item.education, item.employer], query.keyword);
      return statusMatch && keywordMatch;
    });
    return paginateItems(filtered, query.page, query.pageSize);
  },
  async listOrdersPage(query: {
    status?: PaymentOrder["status"];
    provider?: PaymentOrder["provider"];
    keyword?: string;
    page?: number;
    pageSize?: number;
  } = {}) {
    const records = await this.listOrders();
    const filtered = records.filter((item) => {
      const statusMatch = query.status ? item.status === query.status : true;
      const providerMatch = query.provider ? item.provider === query.provider : true;
      const keywordMatch = includesKeyword([item.orderNo, item.applicationId, item.provider], query.keyword);
      return statusMatch && providerMatch && keywordMatch;
    });
    return paginateItems(filtered, query.page, query.pageSize);
  },
  async listExamProjectsPage(query: {
    keyword?: string;
    category?: string;
    page?: number;
    pageSize?: number;
  } = {}) {
    const records = await this.listExamProjects();
    const filtered = records.filter((item) => {
      const categoryMatch = query.category ? item.category === query.category : true;
      const keywordMatch = includesKeyword([item.title, item.location, item.slug], query.keyword);
      return categoryMatch && keywordMatch;
    });
    return paginateItems(filtered, query.page, query.pageSize);
  },
  async listNoticesPage(query: {
    category?: string;
    keyword?: string;
    page?: number;
    pageSize?: number;
  } = {}) {
    const records = await this.listNotices();
    const filtered = records.filter((item) => {
      const categoryMatch = query.category ? item.category === query.category : true;
      const keywordMatch = includesKeyword([item.title, item.summary, item.body], query.keyword);
      return categoryMatch && keywordMatch;
    });
    return paginateItems(filtered, query.page, query.pageSize);
  },
  async listScoresPage(query: {
    published?: "true" | "false";
    keyword?: string;
    page?: number;
    pageSize?: number;
  } = {}) {
    const records = await this.listScores();
    const filtered = records.filter((item) => {
      const publishedMatch =
        query.published === undefined ? true : String(item.published) === query.published;
      const keywordMatch = includesKeyword([item.ticketNo, item.idCard, item.applicationId], query.keyword);
      return publishedMatch && keywordMatch;
    });
    return paginateItems(filtered, query.page, query.pageSize);
  },
  async listAdminOperationLogs(limit?: number) {
    const prisma = getPrismaClient();
    const take = limit ? Math.max(1, limit) : undefined;

    if (!prisma) {
      const records = mockDb.listAdminOperationLogs();
      return (take ? records.slice(0, take) : records).map(toAdminOperationLog);
    }

    const rows = await prisma.adminOperationLog.findMany({
      orderBy: { createdAt: "desc" },
      ...(take ? { take } : {}),
    });
    return rows.map(toAdminOperationLog);
  },
  async createAdminOperationLog(input: Omit<AdminOperationLog, "id" | "createdAt">) {
    const prisma = getPrismaClient();
    if (!prisma) {
      return mockDb.createAdminOperationLog(input);
    }

    const row = await prisma.adminOperationLog.create({ data: input });
    return toAdminOperationLog(row);
  },
  demo: {
    adminOperationLogs,
    users,
    examProjects,
    applications,
    paymentOrders,
    tickets,
    scores,
    notices,
  },
};

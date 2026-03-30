import { Prisma } from "@prisma/client";
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
import { db as mockDb } from "@/lib/mock-db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getPrismaClient } from "@/lib/prisma";
import type {
  AdmissionTicket,
  AdminOperationLog,
  Application,
  ExamArea,
  ExamProject,
  ExamRoom,
  ExamVenue,
  JobPosition,
  LoginLog,
  Notice,
  PaginationResult,
  PaymentCallbackLog,
  PaymentOrder,
  ScoreRecord,
  SystemSetting,
  TicketDownloadLog,
  TicketTemplate,
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
  ethnicity?: string | null;
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
    ethnicity: user.ethnicity ?? undefined,
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
  defaultSubject?: string | null;
  ticketTitle?: string | null;
  ticketSubtitle?: string | null;
  ticketTemplateVersion?: string | null;
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
    defaultSubject: exam.defaultSubject ?? undefined,
    ticketTitle: exam.ticketTitle ?? undefined,
    ticketSubtitle: exam.ticketSubtitle ?? undefined,
    ticketTemplateVersion: exam.ticketTemplateVersion ?? undefined,
    admissionNotice: exam.admissionNotice,
  };
}

function toJobPosition(position: {
  id: string;
  examProjectId: string;
  code: string;
  name: string;
  quota: number;
  organization?: string | null;
  examSubject?: string | null;
  majorRequirement?: string | null;
  educationRequirement?: string | null;
  degreeRequirement?: string | null;
  ageRequirement?: string | null;
  genderRequirement?: string | null;
  householdRequirement?: string | null;
  experienceRequirement?: string | null;
  notes?: string | null;
  enabled: boolean;
  createdAt: Date | string;
}): JobPosition {
  return {
    id: position.id,
    examProjectId: position.examProjectId,
    code: position.code,
    name: position.name,
    quota: position.quota,
    organization: position.organization ?? undefined,
    examSubject: position.examSubject ?? undefined,
    majorRequirement: position.majorRequirement ?? undefined,
    educationRequirement: position.educationRequirement ?? undefined,
    degreeRequirement: position.degreeRequirement ?? undefined,
    ageRequirement: position.ageRequirement ?? undefined,
    genderRequirement: position.genderRequirement ?? undefined,
    householdRequirement: position.householdRequirement ?? undefined,
    experienceRequirement: position.experienceRequirement ?? undefined,
    notes: position.notes ?? undefined,
    enabled: position.enabled,
    createdAt: formatDateTime(position.createdAt),
  };
}

function toExamArea(area: {
  id: string;
  code: string;
  name: string;
  enabled: boolean;
  createdAt: Date | string;
}): ExamArea {
  return {
    id: area.id,
    code: area.code,
    name: area.name,
    enabled: area.enabled,
    createdAt: formatDateTime(area.createdAt),
  };
}

function toExamVenue(venue: {
  id: string;
  areaId: string;
  code: string;
  name: string;
  address: string;
  enabled: boolean;
  createdAt: Date | string;
}): ExamVenue {
  return {
    id: venue.id,
    areaId: venue.areaId,
    code: venue.code,
    name: venue.name,
    address: venue.address,
    enabled: venue.enabled,
    createdAt: formatDateTime(venue.createdAt),
  };
}

function toExamRoom(room: {
  id: string;
  venueId: string;
  name: string;
  capacity: number;
  enabled: boolean;
  createdAt: Date | string;
}): ExamRoom {
  return {
    id: room.id,
    venueId: room.venueId,
    name: room.name,
    capacity: room.capacity,
    enabled: room.enabled,
    createdAt: formatDateTime(room.createdAt),
  };
}

function toTicketTemplate(template: {
  id: string;
  name: string;
  title: string;
  subtitle?: string | null;
  noticeItems: Prisma.JsonValue;
  showPhoto: boolean;
  showEthnicity: boolean;
  showJobCode: boolean;
  showExamSubject: boolean;
  isDefault: boolean;
  version: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}): TicketTemplate {
  return {
    id: template.id,
    name: template.name,
    title: template.title,
    subtitle: template.subtitle ?? undefined,
    noticeItems: Array.isArray(template.noticeItems) ? (template.noticeItems as string[]) : [],
    showPhoto: template.showPhoto,
    showEthnicity: template.showEthnicity,
    showJobCode: template.showJobCode,
    showExamSubject: template.showExamSubject,
    isDefault: template.isDefault,
    version: template.version,
    createdAt: formatDateTime(template.createdAt),
    updatedAt: formatDateTime(template.updatedAt),
  };
}

function toSystemSetting(setting: {
  id: string;
  key: string;
  value: Prisma.JsonValue;
  createdAt: Date | string;
  updatedAt: Date | string;
}): SystemSetting {
  return {
    id: setting.id,
    key: setting.key,
    value: (setting.value as Record<string, unknown>) ?? {},
    createdAt: formatDateTime(setting.createdAt),
    updatedAt: formatDateTime(setting.updatedAt),
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
  jobPositionId?: string | null;
  jobCode?: string | null;
  subjectName?: string | null;
  jobSnapshot?: Prisma.JsonValue;
  status: Application["status"];
  major: string;
  education: string;
  employer?: string | null;
  photoUrl?: string | null;
  documents?: Prisma.JsonValue;
  reviewNote?: string | null;
  materialRevision?: number | null;
  locked?: boolean | null;
  submittedAt?: Date | null;
  approvedAt?: Date | null;
  createdAt: Date | string;
}): Application {
  return {
    id: application.id,
    examProjectId: application.examProjectId,
    userId: application.userId,
    jobPositionId: application.jobPositionId ?? undefined,
    jobCode: application.jobCode ?? undefined,
    subjectName: application.subjectName ?? undefined,
    jobSnapshot: (application.jobSnapshot as Application["jobSnapshot"]) ?? undefined,
    status: application.status,
    major: application.major,
    education: application.education,
    employer: application.employer ?? undefined,
    photoUrl: application.photoUrl ?? undefined,
    documents: Array.isArray(application.documents) ? (application.documents as string[]) : [],
    reviewNote: application.reviewNote ?? undefined,
    materialRevision: application.materialRevision ?? 0,
    locked: application.locked ?? false,
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
  providerTradeNo?: string | null;
  reconciliationStatus?: string | null;
  lastQueriedAt?: Date | string | null;
  reconciledAt?: Date | string | null;
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
    providerTradeNo: order.providerTradeNo ?? undefined,
    reconciliationStatus: order.reconciliationStatus ?? undefined,
    lastQueriedAt: order.lastQueriedAt ? formatDateTime(order.lastQueriedAt) : undefined,
    reconciledAt: order.reconciledAt ? formatDateTime(order.reconciledAt) : undefined,
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
  areaName?: string | null;
  venue: string;
  venueAddress?: string | null;
  room: string;
  seatNo: string;
  examSubject?: string | null;
  jobCode?: string | null;
  jobName?: string | null;
  templateId?: string | null;
  schedulingStatus?: string | null;
  templateVersion: string;
  printedAt?: Date | null;
}): AdmissionTicket {
  return {
    id: ticket.id,
    applicationId: ticket.applicationId,
    ticketNo: ticket.ticketNo,
    examTime: formatDateTime(ticket.examTime),
    areaName: ticket.areaName ?? undefined,
    venue: ticket.venue,
    venueAddress: ticket.venueAddress ?? undefined,
    room: ticket.room,
    seatNo: ticket.seatNo,
    examSubject: ticket.examSubject ?? undefined,
    jobCode: ticket.jobCode ?? undefined,
    jobName: ticket.jobName ?? undefined,
    templateId: ticket.templateId ?? undefined,
    schedulingStatus: ticket.schedulingStatus ?? undefined,
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

function toLoginLog(log: {
  id: string;
  userId?: string | null;
  account: string;
  role?: LoginLog["role"] | null;
  success: boolean;
  ip?: string | null;
  userAgent?: string | null;
  createdAt: Date | string;
}): LoginLog {
  return {
    id: log.id,
    userId: log.userId ?? undefined,
    account: log.account,
    role: log.role ?? undefined,
    success: log.success,
    ip: log.ip ?? undefined,
    userAgent: log.userAgent ?? undefined,
    createdAt: formatDateTime(log.createdAt),
  };
}

function toPaymentCallbackLog(log: {
  id: string;
  provider: PaymentCallbackLog["provider"];
  orderNo: string;
  success: boolean;
  message?: string | null;
  payload?: Prisma.JsonValue;
  createdAt: Date | string;
}): PaymentCallbackLog {
  return {
    id: log.id,
    provider: log.provider,
    orderNo: log.orderNo,
    success: log.success,
    message: log.message ?? undefined,
    payload: (log.payload as Record<string, string> | undefined) ?? undefined,
    createdAt: formatDateTime(log.createdAt),
  };
}

function toTicketDownloadLog(log: {
  id: string;
  userId: string;
  applicationId: string;
  ticketId: string;
  disposition: string;
  createdAt: Date | string;
}): TicketDownloadLog {
  return {
    id: log.id,
    userId: log.userId,
    applicationId: log.applicationId,
    ticketId: log.ticketId,
    disposition: log.disposition as TicketDownloadLog["disposition"],
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
  async listJobPositions() {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.listJobPositions();
    const rows = await prisma.jobPosition.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map(toJobPosition);
  },
  async listJobPositionsByExam(examProjectId: string) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.listJobPositions().filter((item) => item.examProjectId === examProjectId);
    const rows = await prisma.jobPosition.findMany({
      where: { examProjectId, enabled: true },
      orderBy: [{ code: "asc" }],
    });
    return rows.map(toJobPosition);
  },
  async findJobPositionById(id: string) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.findJobPositionById(id);
    const row = await prisma.jobPosition.findUnique({ where: { id } });
    return row ? toJobPosition(row) : null;
  },
  async createJobPosition(input: Omit<JobPosition, "id" | "createdAt" | "enabled"> & { enabled?: boolean }) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.createJobPosition(input);
    const row = await prisma.jobPosition.create({
      data: {
        examProjectId: input.examProjectId,
        code: input.code,
        name: input.name,
        quota: input.quota,
        organization: input.organization,
        examSubject: input.examSubject,
        majorRequirement: input.majorRequirement,
        educationRequirement: input.educationRequirement,
        degreeRequirement: input.degreeRequirement,
        ageRequirement: input.ageRequirement,
        genderRequirement: input.genderRequirement,
        householdRequirement: input.householdRequirement,
        experienceRequirement: input.experienceRequirement,
        notes: input.notes,
        enabled: input.enabled ?? true,
      },
    });
    return toJobPosition(row);
  },
  async listExamAreas() {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.listExamAreas();
    const rows = await prisma.examArea.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map(toExamArea);
  },
  async createExamArea(input: Omit<ExamArea, "id" | "createdAt" | "enabled"> & { enabled?: boolean }) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.createExamArea(input);
    const row = await prisma.examArea.create({
      data: {
        code: input.code,
        name: input.name,
        enabled: input.enabled ?? true,
      },
    });
    return toExamArea(row);
  },
  async listExamVenues() {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.listExamVenues();
    const rows = await prisma.examVenue.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map(toExamVenue);
  },
  async createExamVenue(input: Omit<ExamVenue, "id" | "createdAt" | "enabled"> & { enabled?: boolean }) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.createExamVenue(input);
    const row = await prisma.examVenue.create({
      data: {
        areaId: input.areaId,
        code: input.code,
        name: input.name,
        address: input.address,
        enabled: input.enabled ?? true,
      },
    });
    return toExamVenue(row);
  },
  async listExamRooms() {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.listExamRooms();
    const rows = await prisma.examRoom.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map(toExamRoom);
  },
  async createExamRoom(input: Omit<ExamRoom, "id" | "createdAt" | "enabled"> & { enabled?: boolean }) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.createExamRoom(input);
    const row = await prisma.examRoom.create({
      data: {
        venueId: input.venueId,
        name: input.name,
        capacity: input.capacity,
        enabled: input.enabled ?? true,
      },
    });
    return toExamRoom(row);
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
        ethnicity: input.ethnicity,
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
    if (!row || row.disabled || row.blacklisted || !verifyPassword(password, row.passwordHash)) {
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
  async createApplication(
    input: Omit<Application, "id" | "status" | "createdAt" | "submittedAt" | "approvedAt" | "materialRevision" | "locked">,
  ) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.createApplication(input);
    const row = await prisma.application.create({
      data: {
        examProjectId: input.examProjectId,
        userId: input.userId,
        jobPositionId: input.jobPositionId,
        jobCode: input.jobCode,
        subjectName: input.subjectName,
        jobSnapshot: input.jobSnapshot,
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
    input: Omit<
      Application,
      "id" | "userId" | "examProjectId" | "status" | "createdAt" | "submittedAt" | "approvedAt" | "materialRevision" | "locked"
    >,
  ) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.updateApplication(id, input);
    const row = await prisma.application.update({
      where: { id },
      data: {
        jobPositionId: input.jobPositionId,
        jobCode: input.jobCode,
        subjectName: input.subjectName,
        jobSnapshot: input.jobSnapshot,
        major: input.major,
        education: input.education,
        employer: input.employer,
        photoUrl: input.photoUrl,
        documents: input.documents,
        materialRevision: { increment: 1 },
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
      data: {
        status: "PAID",
        paidAt: new Date(),
        callbackPayload: payload,
        providerTradeNo: payload.tradeNo || payload.trade_no || current.providerTradeNo,
        reconciliationStatus: "PAID",
        lastQueriedAt: new Date(),
      },
    });
    await prisma.application.update({
      where: { id: updated.applicationId },
      data: { status: "PAID" },
    });
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
  async listTicketTemplates() {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.listTicketTemplates();
    const rows = await prisma.ticketTemplate.findMany({ orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] });
    return rows.map(toTicketTemplate);
  },
  async findDefaultTicketTemplate() {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.findDefaultTicketTemplate();
    const row =
      (await prisma.ticketTemplate.findFirst({ where: { isDefault: true }, orderBy: { updatedAt: "desc" } })) ??
      (await prisma.ticketTemplate.findFirst({ orderBy: { updatedAt: "desc" } }));
    return row ? toTicketTemplate(row) : null;
  },
  async saveTicketTemplate(input: Omit<TicketTemplate, "id" | "createdAt" | "updatedAt">) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.saveTicketTemplate(input);

    await prisma.ticketTemplate.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    });

    const existing = await prisma.ticketTemplate.findFirst({ where: { version: input.version } });
    const row = existing
      ? await prisma.ticketTemplate.update({
          where: { id: existing.id },
          data: {
            name: input.name,
            title: input.title,
            subtitle: input.subtitle,
            noticeItems: input.noticeItems,
            showPhoto: input.showPhoto,
            showEthnicity: input.showEthnicity,
            showJobCode: input.showJobCode,
            showExamSubject: input.showExamSubject,
            isDefault: input.isDefault,
            version: input.version,
          },
        })
      : await prisma.ticketTemplate.create({
          data: {
            name: input.name,
            title: input.title,
            subtitle: input.subtitle,
            noticeItems: input.noticeItems,
            showPhoto: input.showPhoto,
            showEthnicity: input.showEthnicity,
            showJobCode: input.showJobCode,
            showExamSubject: input.showExamSubject,
            isDefault: input.isDefault,
            version: input.version,
          },
        });

    return toTicketTemplate(row);
  },
  async generateTicketsByExam(input: {
    examProjectId: string;
    areaId?: string;
    regenerate?: boolean;
    adminName?: string;
  }) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.generateTicketsByExam(input);

    const exam = await prisma.examProject.findUnique({ where: { id: input.examProjectId } });
    if (!exam) {
      throw new Error("考试项目不存在");
    }

    const venues = await prisma.examVenue.findMany({
      where: {
        enabled: true,
        ...(input.areaId ? { areaId: input.areaId } : {}),
      },
      include: {
        area: true,
        rooms: {
          where: { enabled: true },
          orderBy: { name: "asc" },
        },
      },
      orderBy: [{ createdAt: "asc" }],
    });

    const roomPool = venues.flatMap((venue) =>
      venue.rooms.map((room) => ({
        room,
        venue,
        area: venue.area,
      })),
    );

    if (!roomPool.length) {
      throw new Error("请先配置可用考点和考场后再执行编排");
    }

    const applicationsToSchedule = await prisma.application.findMany({
      where: {
        examProjectId: input.examProjectId,
        status: { in: ["PAID", "TICKET_READY"] },
      },
      include: {
        user: true,
        jobPosition: true,
        ticket: true,
      },
      orderBy: [{ approvedAt: "asc" }, { createdAt: "asc" }],
    });

    const template =
      (await prisma.ticketTemplate.findFirst({ where: { isDefault: true } })) ??
      (await prisma.ticketTemplate.findFirst({ orderBy: { updatedAt: "desc" } }));

    const results: AdmissionTicket[] = [];
    let runningIndex = 1;

    for (const application of applicationsToSchedule) {
      if (application.ticket && !input.regenerate) {
        results.push(toTicket(application.ticket));
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
      const seatNo = String(seatOffset).padStart(2, "0");
      const ticketNo = `${new Date(exam.ticketStart).getFullYear()}${selected.area.code}${String(runningIndex).padStart(6, "0")}`;
      const examSubject =
        application.subjectName || application.jobPosition?.examSubject || exam.defaultSubject || `${application.major}笔试`;
      const jobName = application.jobSnapshot
        ? ((application.jobSnapshot as { name?: string }).name ?? application.major)
        : application.major;

      const data = {
        ticketNo,
        examTime: new Date(exam.ticketStart),
        areaName: selected.area.name,
        venue: selected.venue.name,
        venueAddress: selected.venue.address,
        room: selected.room.name,
        seatNo,
        examSubject,
        jobCode: application.jobCode ?? application.jobPosition?.code ?? undefined,
        jobName,
        templateId: template?.id,
        templateVersion: template?.version ?? exam.ticketTemplateVersion ?? "v2",
        schedulingStatus: "ASSIGNED",
      };

      const row = application.ticket
        ? await prisma.admissionTicket.update({
            where: { applicationId: application.id },
            data,
          })
        : await prisma.admissionTicket.create({
            data: {
              applicationId: application.id,
              ...data,
            },
          });

      await prisma.application.update({
        where: { id: application.id },
        data: { status: "TICKET_READY" },
      });

      results.push(toTicket(row));
      runningIndex += 1;
    }

    return results;
  },
  async upsertTicketAssignment(input: {
    applicationId: string;
    ticketNo: string;
    examTime: string;
    areaName?: string;
    venue: string;
    venueAddress?: string;
    room: string;
    seatNo: string;
    examSubject?: string;
    jobCode?: string;
    jobName?: string;
    templateId?: string;
    templateVersion?: string;
  }) {
    const prisma = getPrismaClient();
    if (!prisma) {
      const existing = mockDb.findTicketByApplicationId(input.applicationId);
      if (existing) {
        Object.assign(existing, input, { schedulingStatus: "ASSIGNED" });
        return existing;
      }
      return mockDb.generateTicketsByExam({ examProjectId: mockDb.findApplication(input.applicationId)?.examProjectId ?? "", regenerate: true })[0] ?? null;
    }

    const row = await prisma.admissionTicket.upsert({
      where: { applicationId: input.applicationId },
      update: {
        ticketNo: input.ticketNo,
        examTime: parseDate(input.examTime),
        areaName: input.areaName,
        venue: input.venue,
        venueAddress: input.venueAddress,
        room: input.room,
        seatNo: input.seatNo,
        examSubject: input.examSubject,
        jobCode: input.jobCode,
        jobName: input.jobName,
        templateId: input.templateId,
        templateVersion: input.templateVersion ?? "v2",
        schedulingStatus: "ASSIGNED",
      },
      create: {
        applicationId: input.applicationId,
        ticketNo: input.ticketNo,
        examTime: parseDate(input.examTime),
        areaName: input.areaName,
        venue: input.venue,
        venueAddress: input.venueAddress,
        room: input.room,
        seatNo: input.seatNo,
        examSubject: input.examSubject,
        jobCode: input.jobCode,
        jobName: input.jobName,
        templateId: input.templateId,
        templateVersion: input.templateVersion ?? "v2",
        schedulingStatus: "ASSIGNED",
      },
    });

    await prisma.application.update({
      where: { id: input.applicationId },
      data: { status: "TICKET_READY" },
    });

    return toTicket(row);
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
  async listJobPositionsPage(query: {
    examProjectId?: string;
    keyword?: string;
    page?: number;
    pageSize?: number;
  } = {}) {
    const records = await this.listJobPositions();
    const filtered = records.filter((item) => {
      const examMatch = query.examProjectId ? item.examProjectId === query.examProjectId : true;
      const keywordMatch = includesKeyword([item.code, item.name, item.organization, item.examSubject], query.keyword);
      return examMatch && keywordMatch;
    });
    return paginateItems(filtered, query.page, query.pageSize);
  },
  async listUsersPage(query: {
    role?: User["role"];
    keyword?: string;
    page?: number;
    pageSize?: number;
  } = {}) {
    const records = await this.listUsers();
    const filtered = records.filter((item) => {
      const roleMatch = query.role ? item.role === query.role : true;
      const keywordMatch = includesKeyword([item.name, item.phone, item.idCard, item.email], query.keyword);
      return roleMatch && keywordMatch;
    });
    return paginateItems(filtered, query.page, query.pageSize);
  },
  async listLoginLogs(limit?: number) {
    const prisma = getPrismaClient();
    const take = limit ? Math.max(1, limit) : undefined;
    if (!prisma) {
      const records = mockDb.listLoginLogs();
      return (take ? records.slice(0, take) : records).map(toLoginLog);
    }
    const rows = await prisma.loginLog.findMany({ orderBy: { createdAt: "desc" }, ...(take ? { take } : {}) });
    return rows.map(toLoginLog);
  },
  async createLoginLog(input: Omit<LoginLog, "id" | "createdAt">) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.createLoginLog(input);
    const row = await prisma.loginLog.create({ data: input });
    return toLoginLog(row);
  },
  async listPaymentCallbackLogs(limit?: number) {
    const prisma = getPrismaClient();
    const take = limit ? Math.max(1, limit) : undefined;
    if (!prisma) {
      const records = mockDb.listPaymentCallbackLogs();
      return (take ? records.slice(0, take) : records).map(toPaymentCallbackLog);
    }
    const rows = await prisma.paymentCallbackLog.findMany({ orderBy: { createdAt: "desc" }, ...(take ? { take } : {}) });
    return rows.map(toPaymentCallbackLog);
  },
  async createPaymentCallbackLog(input: Omit<PaymentCallbackLog, "id" | "createdAt">) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.createPaymentCallbackLog(input);
    const row = await prisma.paymentCallbackLog.create({ data: input });
    return toPaymentCallbackLog(row);
  },
  async listTicketDownloadLogs(limit?: number) {
    const prisma = getPrismaClient();
    const take = limit ? Math.max(1, limit) : undefined;
    if (!prisma) {
      const records = mockDb.listTicketDownloadLogs();
      return (take ? records.slice(0, take) : records).map(toTicketDownloadLog);
    }
    const rows = await prisma.ticketDownloadLog.findMany({ orderBy: { createdAt: "desc" }, ...(take ? { take } : {}) });
    return rows.map(toTicketDownloadLog);
  },
  async createTicketDownloadLog(input: Omit<TicketDownloadLog, "id" | "createdAt">) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.createTicketDownloadLog(input);
    const row = await prisma.ticketDownloadLog.create({ data: input });
    return toTicketDownloadLog(row);
  },
  async listSystemSettings() {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.listSystemSettings();
    const rows = await prisma.systemSetting.findMany({ orderBy: { createdAt: "asc" } });
    return rows.map(toSystemSetting);
  },
  async findSystemSetting(key: string) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.findSystemSetting(key);
    const row = await prisma.systemSetting.findUnique({ where: { key } });
    return row ? toSystemSetting(row) : null;
  },
  async upsertSystemSetting(key: string, value: Record<string, unknown>) {
    const prisma = getPrismaClient();
    if (!prisma) return mockDb.upsertSystemSetting(key, value);
    const row = await prisma.systemSetting.upsert({
      where: { key },
      update: { value: value as Prisma.InputJsonValue },
      create: { key, value: value as Prisma.InputJsonValue },
    });
    return toSystemSetting(row);
  },
  async getReportSummary() {
    const [usersPage, jobsPage, applicationsPage, ordersPage, ticketsList, scoresList, areasList] = await Promise.all([
      this.listUsersPage({ pageSize: 500 }),
      this.listJobPositionsPage({ pageSize: 500 }),
      this.listApplicationsPage({ pageSize: 500 }),
      this.listOrdersPage({ pageSize: 500 }),
      this.listTickets(),
      this.listScores(),
      this.listExamAreas(),
    ]);

    const approvedApplications = applicationsPage.items.filter((item) => item.status === "APPROVED").length;
    const paidOrders = ordersPage.items.filter((item) => item.status === "PAID").length;

    return {
      userCount: usersPage.total,
      jobCount: jobsPage.total,
      applicationCount: applicationsPage.total,
      approvedApplications,
      paidOrders,
      ticketCount: ticketsList.length,
      publishedScores: scoresList.filter((item) => item.published).length,
      areaCount: areasList.length,
      paymentRate: applicationsPage.total ? `${((paidOrders / applicationsPage.total) * 100).toFixed(1)}%` : "0%",
    };
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
    jobPositions,
    examAreas,
    examVenues,
    examRooms,
    applications,
    paymentOrders,
    ticketTemplates,
    tickets,
    scores,
    notices,
    loginLogs,
    paymentCallbackLogs,
    ticketDownloadLogs,
    systemSettings,
  },
};

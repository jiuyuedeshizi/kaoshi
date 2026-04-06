export type UserRole =
  | "CANDIDATE"
  | "ADMIN"
  | "REVIEWER"
  | "SCHEDULER"
  | "SCORE_MANAGER"
  | "FINANCE"
  | "CONTENT_MANAGER";
export type AdminPermission =
  | "VIEW_DASHBOARD"
  | "MANAGE_EXAMS"
  | "MANAGE_JOBS"
  | "MANAGE_LOCATIONS"
  | "MANAGE_SCHEDULING"
  | "MANAGE_TICKETS"
  | "REVIEW_APPLICATIONS"
  | "VIEW_ORDERS"
  | "MANAGE_SCORES"
  | "MANAGE_NOTICES"
  | "MANAGE_USERS"
  | "VIEW_REPORTS"
  | "VIEW_LOGS"
  | "MANAGE_SETTINGS"
  | "MANAGE_PERMISSIONS";

export type ApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "PAID"
  | "TICKET_READY"
  | "FINISHED";

export type PaymentProvider = "MOCK" | "WECHAT" | "ALIPAY";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "CLOSED";

export interface Notice {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  pinned: boolean;
  publishedAt: string;
}

export interface ExamProject {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  category: string;
  location: string;
  description: string;
  logoUrl?: string;
  contactPhone?: string;
  registrationStart: string;
  registrationEnd: string;
  reviewEnd: string;
  paymentEnd: string;
  ticketStart: string;
  scoreReleaseAt: string;
  fee: number;
  published: boolean;
  defaultSubject?: string;
  ticketTitle?: string;
  ticketSubtitle?: string;
  ticketTemplateVersion?: string;
  admissionNotice: string;
}

export interface JobPosition {
  id: string;
  examProjectId: string;
  code: string;
  name: string;
  quota: number;
  organization?: string;
  examSubject?: string;
  majorRequirement?: string;
  educationRequirement?: string;
  degreeRequirement?: string;
  ageRequirement?: string;
  genderRequirement?: string;
  householdRequirement?: string;
  experienceRequirement?: string;
  notes?: string;
  enabled: boolean;
  createdAt: string;
}

export interface ExamArea {
  id: string;
  code: string;
  name: string;
  enabled: boolean;
  createdAt: string;
}

export interface ExamVenue {
  id: string;
  areaId: string;
  code: string;
  name: string;
  address: string;
  enabled: boolean;
  createdAt: string;
}

export interface ExamRoom {
  id: string;
  venueId: string;
  name: string;
  capacity: number;
  enabled: boolean;
  createdAt: string;
}

export interface TicketTemplate {
  id: string;
  name: string;
  title: string;
  subtitle?: string;
  noticeItems: string[];
  showPhoto: boolean;
  showEthnicity: boolean;
  showJobCode: boolean;
  showExamSubject: boolean;
  isDefault: boolean;
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  role: UserRole;
  name: string;
  phone: string;
  idCard: string;
  password: string;
  gender?: string;
  ethnicity?: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  disabled?: boolean;
  blacklisted?: boolean;
}

export interface AdminSession {
  id: string;
  userId: string;
  role: Exclude<UserRole, "CANDIDATE">;
  expiresAt: string;
  createdAt: string;
}

export interface CandidateSession {
  userId: string;
  role: "CANDIDATE";
}

export interface Application {
  id: string;
  examProjectId: string;
  userId: string;
  jobPositionId?: string;
  jobCode?: string;
  subjectName?: string;
  jobSnapshot?: {
    id: string;
    code: string;
    name: string;
    subjectName?: string;
  };
  status: ApplicationStatus;
  major: string;
  education: string;
  employer?: string;
  photoUrl?: string;
  documents: string[];
  reviewNote?: string;
  materialRevision?: number;
  locked?: boolean;
  submittedAt?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface PaymentOrder {
  id: string;
  orderNo: string;
  applicationId: string;
  amount: number;
  provider: PaymentProvider;
  status: PaymentStatus;
  providerTradeNo?: string;
  reconciliationStatus?: string;
  lastQueriedAt?: string;
  reconciledAt?: string;
  callbackPayload?: Record<string, string>;
  createdAt: string;
  paidAt?: string;
}

export interface AdmissionTicket {
  id: string;
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
  schedulingStatus?: string;
  templateVersion: string;
  printedAt?: string;
}

export interface ScoreRecord {
  id: string;
  applicationId: string;
  ticketNo: string;
  idCard: string;
  score: number;
  ranking?: number;
  published: boolean;
  queryNote: string;
  releasedAt?: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  hint: string;
}

export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminOperationLog {
  id: string;
  adminUserId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string;
  detail: string;
  createdAt: string;
}

export interface LoginLog {
  id: string;
  userId?: string;
  account: string;
  role?: UserRole;
  success: boolean;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

export interface PaymentCallbackLog {
  id: string;
  provider: PaymentProvider;
  orderNo: string;
  success: boolean;
  message?: string;
  payload?: Record<string, string>;
  createdAt: string;
}

export interface TicketDownloadLog {
  id: string;
  userId: string;
  applicationId: string;
  ticketId: string;
  disposition: "INLINE" | "ATTACHMENT";
  createdAt: string;
}

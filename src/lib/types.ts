export type UserRole = "CANDIDATE" | "ADMIN" | "REVIEWER";
export type AdminPermission =
  | "VIEW_DASHBOARD"
  | "MANAGE_EXAMS"
  | "REVIEW_APPLICATIONS"
  | "VIEW_ORDERS"
  | "MANAGE_SCORES"
  | "MANAGE_NOTICES";

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
  category: string;
  location: string;
  description: string;
  registrationStart: string;
  registrationEnd: string;
  reviewEnd: string;
  paymentEnd: string;
  ticketStart: string;
  scoreReleaseAt: string;
  fee: number;
  published: boolean;
  admissionNotice: string;
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
  status: ApplicationStatus;
  major: string;
  education: string;
  employer?: string;
  photoUrl?: string;
  documents: string[];
  reviewNote?: string;
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
  callbackPayload?: Record<string, string>;
  createdAt: string;
  paidAt?: string;
}

export interface AdmissionTicket {
  id: string;
  applicationId: string;
  ticketNo: string;
  examTime: string;
  venue: string;
  room: string;
  seatNo: string;
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

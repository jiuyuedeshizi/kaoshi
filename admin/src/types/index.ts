export interface User {
  id: number
  username: string
  name: string
  role: string
  disabled: boolean
}

export interface Exam {
  id: number
  slug: string
  title: string
  subtitle?: string
  category_id: number
  category?: ExamCategory
  contact_phone?: string
  description?: string
  registration_start: string
  registration_end: string
  review_end?: string
  payment_end?: string
  ticket_start?: string
  score_release_at?: string
  fee: number
  published: boolean
  created_at: string
}

export interface ExamCategory {
  id: number
  code: string
  name: string
}

export interface Application {
  id: number
  user_id: number
  user?: User
  exam_project_id: number
  exam_project?: Exam
  job_position_id?: number
  job_position?: JobPosition
  job_code?: string
  status: ApplicationStatus
  major: string
  education: string
  employer?: string
  photo_url?: string
  review_note?: string
  submitted_at?: string
  approved_at?: string
  created_at: string
}

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAID'
  | 'TICKET_READY'
  | 'FINISHED'

export interface JobPosition {
  id: number
  exam_project_id: number
  code: string
  name: string
  quota: number
  organization?: string
  exam_subject?: string
  major_requirement?: string
  education_requirement?: string
  enabled: boolean
}

export interface ExamArea {
  id: number
  exam_project_id: number
  code: string
  name: string
  enabled: boolean
}

export interface ExamVenue {
  id: number
  area_id: number
  area?: ExamArea
  code: string
  name: string
  address: string
  enabled: boolean
}

export interface ExamRoom {
  id: number
  venue_id: number
  name: string
  capacity: number
  enabled: boolean
}

export interface Notice {
  id: number
  exam_project_id: number
  exam_project?: Exam
  title: string
  summary?: string
  body: string
  category: NoticeCategory
  pinned: boolean
  published_at: string
  created_at: string
}

export type NoticeCategory = 'RECRUITMENT' | 'PUBLICITY' | 'NOTICE'

export interface Order {
  id: number
  order_no: string
  application_id: number
  application?: Application
  amount: number
  provider: PaymentProvider
  status: PaymentStatus
  provider_trade_no?: string
  paid_at?: string
  created_at: string
}

export type PaymentProvider = 'MOCK' | 'ALIPAY' | 'WECHAT'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CLOSED'

export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

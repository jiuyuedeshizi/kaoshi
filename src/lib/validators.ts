import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "请输入真实姓名"),
  phone: z.string().regex(/^1\d{10}$/, "请输入正确的手机号"),
  idCard: z.string().min(15, "请输入正确的身份证号"),
  password: z.string().min(6, "密码至少 6 位"),
  gender: z.string().min(1, "请选择性别").optional(),
  ethnicity: z.string().min(1, "请输入民族").optional(),
});

export const loginSchema = z.object({
  account: z.string().min(1, "请输入手机号或身份证号"),
  password: z.string().min(6, "请输入密码"),
});

export const applicationSchema = z.object({
  examProjectId: z.string().min(1),
  jobPositionId: z.string().min(1, "请选择岗位"),
  major: z.string().min(2),
  jobCode: z.string().min(1, "岗位代码缺失"),
  subjectName: z.string().min(2, "考试科目缺失"),
  education: z.string().min(2),
  employer: z.string().optional(),
  photoUrl: z.string().min(1).optional(),
  documents: z.array(z.string()).min(1, "至少上传一项材料"),
});

export const createOrderSchema = z.object({
  applicationId: z.string().min(1),
  provider: z.enum(["MOCK", "WECHAT", "ALIPAY"]),
});

export const scoreQuerySchema = z.object({
  ticketNo: z.string().min(1).optional(),
  idCard: z.string().min(1).optional(),
}).refine((data) => Boolean(data.ticketNo || data.idCard), {
  message: "请至少输入准考证号或身份证号",
  path: ["ticketNo"],
});

export const reviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  reviewNote: z.string().min(2),
});

export const examSchema = z.object({
  slug: z.string().min(2),
  title: z.string().min(2),
  category: z.string().min(2),
  location: z.string().min(2),
  description: z.string().min(10),
  fee: z.number().nonnegative(),
  registrationStart: z.string(),
  registrationEnd: z.string(),
  reviewEnd: z.string(),
  paymentEnd: z.string(),
  ticketStart: z.string(),
  scoreReleaseAt: z.string(),
  defaultSubject: z.string().optional(),
  ticketTitle: z.string().optional(),
  ticketSubtitle: z.string().optional(),
  ticketTemplateVersion: z.string().optional(),
  admissionNotice: z.string().min(10),
});

export const jobSchema = z.object({
  examProjectId: z.string().min(1),
  code: z.string().min(2),
  name: z.string().min(2),
  quota: z.number().int().positive(),
  organization: z.string().optional(),
  examSubject: z.string().optional(),
  majorRequirement: z.string().optional(),
  educationRequirement: z.string().optional(),
  degreeRequirement: z.string().optional(),
  ageRequirement: z.string().optional(),
  genderRequirement: z.string().optional(),
  householdRequirement: z.string().optional(),
  experienceRequirement: z.string().optional(),
  notes: z.string().optional(),
  enabled: z.boolean().optional(),
});

export const examAreaSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  enabled: z.boolean().optional(),
});

export const examVenueSchema = z.object({
  areaId: z.string().min(1),
  code: z.string().min(2),
  name: z.string().min(2),
  address: z.string().min(4),
  enabled: z.boolean().optional(),
});

export const examRoomSchema = z.object({
  venueId: z.string().min(1),
  name: z.string().min(1),
  capacity: z.number().int().positive(),
  enabled: z.boolean().optional(),
});

export const schedulingSchema = z.object({
  examProjectId: z.string().min(1),
  areaId: z.string().optional(),
  regenerate: z.boolean().optional(),
});

export const ticketTemplateSchema = z.object({
  name: z.string().min(2),
  title: z.string().min(4),
  subtitle: z.string().optional(),
  noticeItems: z.array(z.string().min(2)).min(1),
  showPhoto: z.boolean().default(true),
  showEthnicity: z.boolean().default(true),
  showJobCode: z.boolean().default(true),
  showExamSubject: z.boolean().default(true),
  isDefault: z.boolean().default(true),
  version: z.string().min(1),
});

export const systemSettingSchema = z.object({
  key: z.string().min(1),
  value: z.record(z.string(), z.unknown()),
});

export const noticeSchema = z.object({
  title: z.string().min(2),
  summary: z.string().min(5),
  body: z.string().min(10),
  category: z.string().min(2),
  pinned: z.boolean().default(false),
});

export const scoreImportSchema = z.object({
  applicationId: z.string().min(1),
  ticketNo: z.string().min(1),
  idCard: z.string().min(1),
  score: z.number(),
  ranking: z.number().int().positive().optional(),
  published: z.boolean().default(false),
  queryNote: z.string().min(2),
});

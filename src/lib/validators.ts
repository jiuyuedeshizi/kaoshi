import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "请输入真实姓名"),
  phone: z.string().regex(/^1\d{10}$/, "请输入正确的手机号"),
  idCard: z.string().min(15, "请输入正确的身份证号"),
  password: z.string().min(6, "密码至少 6 位"),
});

export const loginSchema = z.object({
  account: z.string().min(1, "请输入手机号或身份证号"),
  password: z.string().min(6, "请输入密码"),
});

export const applicationSchema = z.object({
  examProjectId: z.string().min(1),
  major: z.string().min(2),
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
  admissionNotice: z.string().min(10),
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

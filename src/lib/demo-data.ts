import type {
  AdmissionTicket,
  AdminOperationLog,
  Application,
  DashboardMetric,
  ExamProject,
  Notice,
  PaymentOrder,
  ScoreRecord,
  User,
} from "@/lib/types";

export const notices: Notice[] = [
  {
    id: "notice-1",
    title: "2026 年上半年事业单位公开招聘笔试报名公告",
    summary: "请考生于 2026-04-01 至 2026-04-12 完成注册、信息填报与提交。",
    body: "本次考试实行网上报名、资格初审、网上缴费的方式进行，请仔细阅读报考须知。",
    category: "报名公告",
    pinned: true,
    publishedAt: "2026-03-25",
  },
  {
    id: "notice-2",
    title: "准考证打印开放时间通知",
    summary: "准考证打印时间为 2026-05-08 09:00 至 2026-05-12 18:00。",
    body: "缴费成功且审核通过的考生可登录个人中心打印准考证。",
    category: "准考证",
    pinned: false,
    publishedAt: "2026-03-26",
  },
  {
    id: "notice-3",
    title: "笔试成绩查询与复核说明",
    summary: "成绩查询系统将于 2026-05-28 10:00 开放。",
    body: "如对分数有疑问，可在成绩发布后 2 个工作日内申请复核。",
    category: "成绩查询",
    pinned: false,
    publishedAt: "2026-03-27",
  },
];

export const examProjects: ExamProject[] = [
  {
    id: "exam-1",
    slug: "2026-shiyezhaopin",
    title: "2026 年上半年事业单位公开招聘笔试",
    category: "事业单位",
    location: "呼和浩特考区",
    description:
      "面向综合管理、教育、卫生等岗位组织统一笔试，报名成功后按审核结果和缴费状态进入后续环节。",
    registrationStart: "2026-03-20 09:00",
    registrationEnd: "2026-04-12 17:00",
    reviewEnd: "2026-04-14 18:00",
    paymentEnd: "2026-04-16 18:00",
    ticketStart: "2026-03-26 09:00",
    scoreReleaseAt: "2026-03-27 10:00",
    fee: 95,
    published: true,
    admissionNotice:
      "报考人员应如实填写学历、专业、工作经历等信息，并确保上传材料清晰可辨。",
  },
  {
    id: "exam-2",
    slug: "2026-jiaoshi-zhaopin",
    title: "2026 年教师招聘统一考试",
    category: "教师招聘",
    location: "包头考区",
    description:
      "统一组织教育类岗位考试，包含岗位报名、资格审查、缴费、打印准考证和成绩查询。",
    registrationStart: "2026-03-26 09:00",
    registrationEnd: "2026-04-20 17:00",
    reviewEnd: "2026-04-22 18:00",
    paymentEnd: "2026-04-24 18:00",
    ticketStart: "2026-05-15 09:00",
    scoreReleaseAt: "2026-06-06 10:00",
    fee: 120,
    published: true,
    admissionNotice:
      "报考教师岗位的考生请按要求上传教师资格、普通话等级等相关证明材料。",
  },
];

export const users: User[] = [
  {
    id: "user-1",
    role: "CANDIDATE",
    name: "张晓明",
    phone: "13800000001",
    idCard: "150101199506121234",
    password: "123456",
    gender: "男",
    email: "zhang@example.com",
    address: "呼和浩特市赛罕区大学东路 18 号",
    emergencyContact: "张先生 13900000000",
  },
  {
    id: "admin-1",
    role: "ADMIN",
    name: "系统管理员",
    phone: "13800000099",
    idCard: "150101198901011234",
    password: "admin123",
    gender: "女",
    email: "admin@example.com",
  },
  {
    id: "reviewer-1",
    role: "REVIEWER",
    name: "审核专员",
    phone: "13800000088",
    idCard: "150101199003031234",
    password: "review123",
    gender: "男",
    email: "reviewer@example.com",
  },
];

export const applications: Application[] = [
  {
    id: "app-1",
    examProjectId: "exam-1",
    userId: "user-1",
    status: "TICKET_READY",
    major: "行政管理",
    education: "本科",
    employer: "青城人力服务有限公司",
    photoUrl: "/globe.svg",
    documents: ["身份证正反面", "毕业证书", "学位证书"],
    reviewNote: "资料审核通过。",
    submittedAt: "2026-04-08 10:20",
    approvedAt: "2026-04-10 09:30",
    createdAt: "2026-04-07 19:30",
  },
  {
    id: "app-2",
    examProjectId: "exam-2",
    userId: "user-1",
    status: "APPROVED",
    major: "教育学",
    education: "硕士研究生",
    employer: "包头市实验学校",
    documents: ["身份证正反面", "毕业证书", "教师资格证"],
    reviewNote: "审核通过，请尽快缴费。",
    submittedAt: "2026-04-12 11:00",
    approvedAt: "2026-04-13 09:10",
    createdAt: "2026-04-12 10:20",
  },
];

export const paymentOrders: PaymentOrder[] = [
  {
    id: "order-1",
    orderNo: "KS202604080001",
    applicationId: "app-1",
    amount: 95,
    provider: "MOCK",
    status: "PAID",
    callbackPayload: { tradeNo: "MOCK20260408001", channel: "mock" },
    createdAt: "2026-04-10 10:00",
    paidAt: "2026-04-10 10:01",
  },
];

export const tickets: AdmissionTicket[] = [
  {
    id: "ticket-1",
    applicationId: "app-1",
    ticketNo: "202605080001",
    examTime: "2026-05-10 09:00",
    venue: "呼和浩特职业学院综合楼",
    room: "A302",
    seatNo: "08",
    templateVersion: "v1",
  },
];

export const scores: ScoreRecord[] = [
  {
    id: "score-1",
    applicationId: "app-1",
    ticketNo: "202605080001",
    idCard: "150101199506121234",
    score: 84.5,
    ranking: 16,
    published: true,
    queryNote: "成绩仅供招聘环节使用，请以公示名单为准。",
    releasedAt: "2026-03-27 10:00",
  },
];

export const adminOperationLogs: AdminOperationLog[] = [
  {
    id: "log-1",
    adminUserId: "admin-1",
    adminName: "系统管理员",
    action: "CREATE_NOTICE",
    targetType: "NOTICE",
    targetId: "notice-3",
    detail: "发布《笔试成绩查询与复核说明》公告。",
    createdAt: "2026-03-27 10:12",
  },
  {
    id: "log-2",
    adminUserId: "reviewer-1",
    adminName: "审核专员",
    action: "REVIEW_APPLICATION",
    targetType: "APPLICATION",
    targetId: "app-2",
    detail: "审核通过报名 app-2，并提示考生尽快缴费。",
    createdAt: "2026-03-27 14:36",
  },
];

export const frontMetrics: DashboardMetric[] = [
  { label: "本月开放考试", value: "12", hint: "覆盖事业单位、教师、卫生系统等考试项目" },
  { label: "累计服务考生", value: "68,420", hint: "支持报名、缴费、打印、查询一站式办理" },
  { label: "最快审核时效", value: "2h", hint: "后台支持批量审核与材料缺失反馈" },
];

export const adminMetrics: DashboardMetric[] = [
  { label: "报名总量", value: "4,862", hint: "较昨日新增 312 人" },
  { label: "待审核", value: "128", hint: "建议在今日 18:00 前完成首轮审核" },
  { label: "已缴费", value: "3,905", hint: "缴费转化率 82.1%" },
  { label: "已发布成绩", value: "1,640", hint: "本周新增 2 个考试项目完成发布" },
];

export const faqItems = [
  {
    question: "身份证号已注册怎么办？",
    answer:
      "请使用原手机号登录；如手机号已停用，可在工作时间联系平台客服进行身份核验后找回。",
  },
  {
    question: "审核未通过后是否可以重新提交？",
    answer:
      "可以。在报名截止前，系统会根据驳回原因开放重新编辑入口，修改后再次提交即可。",
  },
  {
    question: "缴费成功后能否修改报考信息？",
    answer:
      "缴费成功即视为报名确认完成，一般不支持修改核心报考信息，请在缴费前认真核对。",
  },
];

export const guideSteps = [
  "实名注册并完善考生基本资料",
  "选择考试项目，填写岗位与个人信息",
  "上传照片和证明材料，提交资格审核",
  "审核通过后在规定时间内完成网上缴费",
  "开放后下载打印准考证并按时参加考试",
  "成绩发布后使用证件号或准考证号查询成绩",
];

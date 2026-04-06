import type {
  AdmissionTicket,
  AdminOperationLog,
  Application,
  ExamArea,
  DashboardMetric,
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
    subtitle: "内蒙古自治区人力资源和社会保障厅",
    category: "事业单位",
    location: "呼和浩特考区",
    description:
      "面向综合管理、教育、卫生等岗位组织统一笔试，报名成功后按审核结果和缴费状态进入后续环节。",
    logoUrl: "/images/exam-shiye-logo.png",
    contactPhone: "0471-1234567",
    registrationStart: "2026-03-20 09:00",
    registrationEnd: "2026-04-12 17:00",
    reviewEnd: "2026-04-14 18:00",
    paymentEnd: "2026-04-16 18:00",
    ticketStart: "2026-03-26 09:00",
    scoreReleaseAt: "2026-03-27 10:00",
    fee: 95,
    published: true,
    defaultSubject: "职业能力倾向测验",
    ticketTitle: "2026 年上半年事业单位公开招聘笔试",
    ticketSubtitle: "内蒙古自治区统一考试准考证",
    ticketTemplateVersion: "v2",
    admissionNotice:
      "报考人员应如实填写学历、专业、工作经历等信息，并确保上传材料清晰可辨。",
  },
  {
    id: "exam-2",
    slug: "2026-jiaoshi-zhaopin",
    title: "2026 年教师招聘统一考试",
    subtitle: "内蒙古自治区教育厅",
    category: "教师招聘",
    location: "包头考区",
    description:
      "统一组织教育类岗位考试，包含岗位报名、资格审查、缴费、打印准考证和成绩查询。",
    logoUrl: "/images/exam-jiaoshi-logo.png",
    contactPhone: "0472-7654321",
    registrationStart: "2026-03-26 09:00",
    registrationEnd: "2026-04-20 17:00",
    reviewEnd: "2026-04-22 18:00",
    paymentEnd: "2026-04-24 18:00",
    ticketStart: "2026-05-15 09:00",
    scoreReleaseAt: "2026-06-06 10:00",
    fee: 120,
    published: true,
    defaultSubject: "教育综合能力测试",
    ticketTitle: "2026 年教师招聘统一考试",
    ticketSubtitle: "教师类岗位笔试准考证",
    ticketTemplateVersion: "v2",
    admissionNotice:
      "报考教师岗位的考生请按要求上传教师资格、普通话等级等相关证明材料。",
  },
];

export const jobPositions: JobPosition[] = [
  {
    id: "job-1",
    examProjectId: "exam-1",
    code: "XZGL-001",
    name: "综合管理岗",
    quota: 12,
    organization: "呼和浩特市某直属单位",
    examSubject: "职业能力倾向测验（综合管理类）",
    majorRequirement: "行政管理、公共事业管理相关专业",
    educationRequirement: "本科及以上",
    ageRequirement: "35 周岁以下",
    notes: "需熟悉公文写作和综合协调工作。",
    enabled: true,
    createdAt: "2026-03-20 09:00",
  },
  {
    id: "job-2",
    examProjectId: "exam-2",
    code: "JY-008",
    name: "教育学教师岗",
    quota: 8,
    organization: "包头市直属学校",
    examSubject: "教育综合能力测试",
    majorRequirement: "教育学相关专业",
    educationRequirement: "硕士研究生及以上",
    ageRequirement: "40 周岁以下",
    notes: "需具备教师资格证。",
    enabled: true,
    createdAt: "2026-03-26 09:00",
  },
];

export const examAreas: ExamArea[] = [
  { id: "area-1", code: "HHHT", name: "呼和浩特考区", enabled: true, createdAt: "2026-03-20 09:00" },
  { id: "area-2", code: "BT", name: "包头考区", enabled: true, createdAt: "2026-03-26 09:00" },
];

export const examVenues: ExamVenue[] = [
  {
    id: "venue-1",
    areaId: "area-1",
    code: "HHHTZYXY",
    name: "呼和浩特职业学院综合楼",
    address: "呼和浩特市赛罕区大学东街 188 号",
    enabled: true,
    createdAt: "2026-03-20 09:00",
  },
  {
    id: "venue-2",
    areaId: "area-2",
    code: "BTSYXX",
    name: "包头市实验学校教学楼",
    address: "包头市青山区建设路 66 号",
    enabled: true,
    createdAt: "2026-03-26 09:00",
  },
];

export const examRooms: ExamRoom[] = [
  { id: "room-1", venueId: "venue-1", name: "A302", capacity: 30, enabled: true, createdAt: "2026-03-20 09:00" },
  { id: "room-2", venueId: "venue-1", name: "A303", capacity: 30, enabled: true, createdAt: "2026-03-20 09:00" },
  { id: "room-3", venueId: "venue-2", name: "B201", capacity: 28, enabled: true, createdAt: "2026-03-26 09:00" },
];

export const ticketTemplates: TicketTemplate[] = [
  {
    id: "template-1",
    name: "默认事业单位准考证模板",
    title: "内蒙古自治区 2026 年面向社会公开招聘事业单位工作人员分类考试笔试",
    subtitle: "准考证",
    noticeItems: [
      "1.请在考试前一天熟悉考点地址和交通路线。",
      "2.必须带齐准考证、本人有效期内的居民身份证或临时身份证原件，方可进入考场。进入考场时要服从工作人员的安排，认真核对考点、考场和座位号，在指定座位参加考试。",
      "3.监考人员将在考前20分钟宣读考场规则及相关规定，建议考生提前到达考场。",
      "4.考试开始30分钟后，不得入场;考试期间，全程不得离场。",
      "5.考生应携带黑色钢笔或签字笔、2B铅笔、橡皮参加考试。参加综合应用能力(C类)考试的考生，可携带无计算、存储或通讯功能的普通直尺。除规定可携带的文具以外，严禁将各种电子通信、计算、存储或其他设备带至座位。已带入考场的须按要求关闭闹铃、切断电源并放在指定位置，否则将按违纪进行处理。",
      "6.此次考试两个笔试科目连续进行，中间不间断。答题前应仔细阅读答题须知，使用规定的作答工具在规定的区域内作答。",
      "7.不得要求监考人员解释试题，如遇试卷分发错误、页码序号不对、字迹模糊或答题卡有折皱、污点等问题，应举手询问。",
      "8.不得将试卷、答题卡、草稿纸等带出考场，不得损毁试卷、答题卡，不得对试题内容进行抄录、复制、传播，否则将按违纪进行处理。",
      "9.在考试开始信号发出前不得答题，在考试结束信号发出后不得继续答题，否则将按违纪进行处理。",
      "10.必须遵守考场规则，报考人员有义务妥善保护好自己的考试试卷和答题信息不被他人抄袭。若有答卷雷同，将给予考试成绩无效处理。",
      "11.若有违纪违规行为，将按《事业单位公开招聘违纪违规行为处理规定》《刑法修正案（九）》等规定进行处理。",
    ],
    showPhoto: true,
    showEthnicity: true,
    showJobCode: true,
    showExamSubject: true,
    isDefault: true,
    version: "v2",
    createdAt: "2026-03-20 09:00",
    updatedAt: "2026-03-20 09:00",
  },
];

export const systemSettings: SystemSetting[] = [
  {
    id: "setting-1",
    key: "platform",
    value: {
      siteName: "邻泰人事考试服务平台",
      servicePhone: "0471-1234567",
      supportPhone: "0471-7654321",
      uploadMaxMb: 8,
    },
    createdAt: "2026-03-20 09:00",
    updatedAt: "2026-03-20 09:00",
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
    ethnicity: "蒙古族",
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
    ethnicity: "汉族",
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
    ethnicity: "汉族",
    email: "reviewer@example.com",
  },
  {
    id: "scheduler-1",
    role: "SCHEDULER",
    name: "排考管理员",
    phone: "13800000077",
    idCard: "150101199102021234",
    password: "schedule123",
    gender: "男",
    ethnicity: "汉族",
    email: "scheduler@example.com",
  },
];

export const applications: Application[] = [
  {
    id: "app-1",
    examProjectId: "exam-1",
    userId: "user-1",
    jobPositionId: "job-1",
    jobCode: "XZGL-001",
    subjectName: "职业能力倾向测验（综合管理类）",
    jobSnapshot: {
      id: "job-1",
      code: "XZGL-001",
      name: "综合管理岗",
      subjectName: "职业能力倾向测验（综合管理类）",
    },
    status: "TICKET_READY",
    major: "综合管理岗",
    education: "本科",
    employer: "青城人力服务有限公司",
    photoUrl: "/globe.svg",
    documents: ["身份证正反面", "毕业证书", "学位证书"],
    reviewNote: "资料审核通过。",
    materialRevision: 1,
    locked: true,
    submittedAt: "2026-04-08 10:20",
    approvedAt: "2026-04-10 09:30",
    createdAt: "2026-04-07 19:30",
  },
  {
    id: "app-2",
    examProjectId: "exam-2",
    userId: "user-1",
    jobPositionId: "job-2",
    jobCode: "JY-008",
    subjectName: "教育综合能力测试",
    jobSnapshot: {
      id: "job-2",
      code: "JY-008",
      name: "教育学教师岗",
      subjectName: "教育综合能力测试",
    },
    status: "APPROVED",
    major: "教育学教师岗",
    education: "硕士研究生",
    employer: "包头市实验学校",
    documents: ["身份证正反面", "毕业证书", "教师资格证"],
    reviewNote: "审核通过，请尽快缴费。",
    materialRevision: 1,
    locked: false,
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
    providerTradeNo: "MOCK20260408001",
    reconciliationStatus: "RECONCILED",
    lastQueriedAt: "2026-04-10 10:01",
    reconciledAt: "2026-04-10 10:02",
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
    areaName: "呼和浩特考区",
    venue: "呼和浩特职业学院综合楼",
    venueAddress: "呼和浩特市赛罕区大学东街 188 号",
    room: "A302",
    seatNo: "08",
    examSubject: "职业能力倾向测验（综合管理类）",
    jobCode: "XZGL-001",
    jobName: "综合管理岗",
    templateId: "template-1",
    schedulingStatus: "ASSIGNED",
    templateVersion: "v2",
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

export const loginLogs: LoginLog[] = [
  {
    id: "login-log-1",
    userId: "admin-1",
    account: "13800000099",
    role: "ADMIN",
    success: true,
    ip: "127.0.0.1",
    userAgent: "seed",
    createdAt: "2026-03-29 10:12",
  },
];

export const paymentCallbackLogs: PaymentCallbackLog[] = [
  {
    id: "callback-log-1",
    provider: "MOCK",
    orderNo: "KS202604080001",
    success: true,
    message: "模拟支付回调成功",
    payload: { tradeNo: "MOCK20260408001" },
    createdAt: "2026-04-10 10:01",
  },
];

export const ticketDownloadLogs: TicketDownloadLog[] = [
  {
    id: "download-log-1",
    userId: "user-1",
    applicationId: "app-1",
    ticketId: "ticket-1",
    disposition: "ATTACHMENT",
    createdAt: "2026-05-08 09:10",
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

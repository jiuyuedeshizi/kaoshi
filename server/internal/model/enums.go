package model

// UserRole 用户角色
type UserRole string

const (
	RoleCandidate    UserRole = "CANDIDATE"
	RoleAdmin       UserRole = "ADMIN"
	RoleReviewer    UserRole = "REVIEWER"
	RoleScheduler   UserRole = "SCHEDULER"
	RoleScoreManager UserRole = "SCORE_MANAGER"
	RoleFinance     UserRole = "FINANCE"
	RoleContentMgr  UserRole = "CONTENT_MANAGER"
)

// ApplicationStatus 报名状态
type ApplicationStatus string

const (
	AppStatusDraft      ApplicationStatus = "DRAFT"
	AppStatusSubmitted  ApplicationStatus = "SUBMITTED"
	AppStatusApproved   ApplicationStatus = "APPROVED"
	AppStatusRejected   ApplicationStatus = "REJECTED"
	AppStatusPaid      ApplicationStatus = "PAID"
	AppStatusTicketReady ApplicationStatus = "TICKET_READY"
	AppStatusFinished   ApplicationStatus = "FINISHED"
)

// PaymentProvider 支付渠道
type PaymentProvider string

const (
	PaymentMock   PaymentProvider = "MOCK"
	PaymentAlipay PaymentProvider = "ALIPAY"
	PaymentWechat PaymentProvider = "WECHAT"
)

// PaymentStatus 支付状态
type PaymentStatus string

const (
	PaymentPending PaymentStatus = "PENDING"
	PaymentPaid    PaymentStatus = "PAID"
	PaymentFailed  PaymentStatus = "FAILED"
	PaymentClosed  PaymentStatus = "CLOSED"
)

// ReviewStatus 审核状态
type ReviewStatus string

const (
	ReviewPending  ReviewStatus = "PENDING"
	ReviewApproved ReviewStatus = "APPROVED"
	ReviewRejected ReviewStatus = "REJECTED"
	ReviewRevision ReviewStatus = "REVISION"
)

// VerificationType 实名认证方式
type VerificationType string

const (
	VerifyIDCardTwoFactor VerificationType = "ID_CARD_TWO_FACTOR"
	VerifyFaceVerify      VerificationType = "FACE_VERIFY"
)

// LoginType 登录方式
type LoginType string

const (
	LoginAccount LoginType = "ACCOUNT"
	LoginSMS     LoginType = "SMS"
	LoginWechat  LoginType = "WECHAT"
)
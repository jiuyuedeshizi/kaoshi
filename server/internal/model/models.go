package model

import (
	"time"

	"github.com/shopspring/decimal"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// ExamCategory 考试分类（如：卫生系统、教育系统、综合）
type ExamCategory struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Code      string    `gorm:"uniqueIndex;size:50;not null" json:"code"`
	Name      string    `gorm:"size:100;not null" json:"name"`
	Icon      string    `gorm:"size:255" json:"icon"`
	SortOrder int       `gorm:"default:0" json:"sort_order"`
	Enabled   bool      `gorm:"default:true" json:"enabled"`
	CreatedAt time.Time `json:"created_at"`
}

// ExamProject 考试项目
type ExamProject struct {
	ID                 uint             `gorm:"primaryKey" json:"id"`
	CategoryID         uint             `gorm:"index" json:"category_id"`
	Category           ExamCategory     `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Slug               string           `gorm:"uniqueIndex;size:100;not null" json:"slug"`
	Title              string           `gorm:"size:255;not null" json:"title"`
	Subtitle           string           `gorm:"size:255" json:"subtitle"`
	LogoURL            string           `gorm:"size:500" json:"logo_url"`
	BannerURL          string           `gorm:"size:500" json:"banner_url"`
	ContactPhone       string           `gorm:"size:20" json:"contact_phone"`
	Description        string           `gorm:"type:text" json:"description"`
	NoticeText         string           `gorm:"type:text" json:"notice_text"`
	RegistrationStart  time.Time        `gorm:"not null" json:"registration_start"`
	RegistrationEnd    time.Time        `gorm:"not null" json:"registration_end"`
	ReviewEnd          time.Time        `json:"review_end"`
	PaymentEnd         time.Time        `json:"payment_end"`
	TicketStart        time.Time        `json:"ticket_start"`
	ScoreReleaseAt     time.Time        `json:"score_release_at"`
	Fee                decimal.Decimal  `gorm:"type:decimal(10,2);default:0" json:"fee"`
	IDVerificationType  VerificationType `gorm:"size:50" json:"id_verification_type"`
	AllowMultiApply    bool             `gorm:"default:false" json:"allow_multi_apply"`
	Published          bool             `gorm:"default:false" json:"published"`
	CreatedAt          time.Time        `json:"created_at"`
	UpdatedAt          time.Time        `json:"updated_at"`

	// 关联
	Notices   []ExamNotice  `gorm:"foreignKey:ExamProjectID" json:"notices,omitempty"`
	Jobs      []JobPosition `gorm:"foreignKey:ExamProjectID" json:"jobs,omitempty"`
	Config    *ExamConfig   `gorm:"foreignKey:ExamProjectID" json:"config,omitempty"`
	ExamAreas []ExamArea    `gorm:"foreignKey:ExamProjectID" json:"exam_areas,omitempty"`
}

// NoticeCategory 公告分类
type NoticeCategory string

const (
	NoticeCategoryRecruitment NoticeCategory = "RECRUITMENT" // 招聘公告
	NoticeCategoryPublicity   NoticeCategory = "PUBLICITY"   // 公示
	NoticeCategoryNotice      NoticeCategory = "NOTICE"       // 通知
)

// ExamNotice 考试公告
type ExamNotice struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	ExamProjectID uint          `gorm:"index;not null" json:"exam_project_id"`
	ExamProject  ExamProject    `gorm:"foreignKey:ExamProjectID" json:"exam_project,omitempty"`
	Title        string         `gorm:"size:255;not null" json:"title"`
	Summary      string         `gorm:"size:500" json:"summary"`
	Body         string         `gorm:"type:text;not null" json:"body"`
	Category     NoticeCategory `gorm:"size:50;not null" json:"category"`
	Pinned       bool           `gorm:"default:false" json:"pinned"`
	PublishedAt  time.Time      `json:"published_at"`
	CreatedAt    time.Time      `json:"created_at"`
}

// ExamConfig 报名配置
type ExamConfig struct {
	ID                  uint           `gorm:"primaryKey" json:"id"`
	ExamProjectID       uint           `gorm:"uniqueIndex;not null" json:"exam_project_id"`
	RequireIDVerify     bool           `gorm:"default:true" json:"require_id_verify"`
	RequirePhoneVerify  bool           `gorm:"default:true" json:"require_phone_verify"`
	RequirePhoto        bool           `gorm:"default:true" json:"require_photo"`
	RequireDocuments    bool           `gorm:"default:false" json:"require_documents"`
	CustomFields        datatypes.JSON `gorm:"type:json" json:"custom_fields"`
	PaymentAfterApprove bool           `gorm:"default:true" json:"payment_after_approve"`
	CreatedAt           time.Time      `json:"created_at"`
	UpdatedAt           time.Time      `json:"updated_at"`
}

// JobPosition 职位
type JobPosition struct {
	ID                   uint           `gorm:"primaryKey" json:"id"`
	ExamProjectID        uint           `gorm:"index;not null" json:"exam_project_id"`
	ExamProject          ExamProject    `gorm:"foreignKey:ExamProjectID" json:"exam_project,omitempty"`
	Code                 string         `gorm:"size:50;not null" json:"code"`
	Name                 string         `gorm:"size:100;not null" json:"name"`
	Quota                int            `gorm:"default:1" json:"quota"`
	Organization         string         `gorm:"size:255" json:"organization"`
	ExamSubject          string         `gorm:"size:100" json:"exam_subject"`
	MajorRequirement     string         `gorm:"size:255" json:"major_requirement"`
	EducationRequirement string         `gorm:"size:100" json:"education_requirement"`
	DegreeRequirement    string         `gorm:"size:50" json:"degree_requirement"`
	AgeRequirement       string         `gorm:"size:100" json:"age_requirement"`
	GenderRequirement    string         `gorm:"size:20" json:"gender_requirement"`
	HouseholdRequirement string         `gorm:"size:50" json:"household_requirement"`
	ExperienceRequirement string        `gorm:"size:255" json:"experience_requirement"`
	Notes                string         `gorm:"type:text" json:"notes"`
	Enabled              bool           `gorm:"default:true" json:"enabled"`
	CreatedAt           time.Time      `json:"created_at"`
	UpdatedAt           time.Time      `json:"updated_at"`
}

// User 考生用户
type User struct {
	ID               string                 `gorm:"primaryKey" json:"id"`
	ExamProjectID    string                 `gorm:"index" json:"exam_project_id"`
	ExamProject      ExamProject            `gorm:"foreignKey:ExamProjectID" json:"exam_project,omitempty"`
	Role             UserRole               `gorm:"size:50;not null;default:'CANDIDATE'" json:"role"`
	IDCard           string                 `gorm:"uniqueIndex;size:18;not null" json:"id_card"`
	Phone            string                 `gorm:"uniqueIndex;size:11;not null" json:"phone"`
	PasswordHash     string                 `gorm:"size:255;not null" json:"-"`
	Name             string                 `gorm:"size:50;not null" json:"name"`
	Gender           string                 `gorm:"size:10" json:"gender"`
	Ethnicity        string                 `gorm:"size:20" json:"ethnicity"`
	Email            string                 `gorm:"size:100" json:"email"`
	Address          string                 `gorm:"size:255" json:"address"`
	EmergencyContact string                 `gorm:"size:100" json:"emergency_contact"`
	Disabled         bool                   `gorm:"default:false" json:"disabled"`
	Blacklisted      bool                   `gorm:"default:false" json:"blacklisted"`
	CreatedAt        time.Time              `json:"created_at"`
	UpdatedAt        time.Time              `json:"updated_at"`

	// 关联
	Applications          []Application              `gorm:"foreignKey:UserID" json:"applications,omitempty"`
	IdentityVerifications []IdentityVerification     `gorm:"foreignKey:UserID" json:"identity_verifications,omitempty"`
}

// IdentityVerification 实名认证记录
type IdentityVerification struct {
	ID               uint             `gorm:"primaryKey" json:"id"`
	UserID           uint             `gorm:"index;not null" json:"user_id"`
	User             User             `gorm:"foreignKey:UserID" json:"user,omitempty"`
	IDCard           string           `gorm:"size:18;not null" json:"id_card"`
	Name             string           `gorm:"size:50;not null" json:"name"`
	VerificationType VerificationType `gorm:"size:50;not null" json:"verification_type"`
	Status           ReviewStatus     `gorm:"size:50;not null" json:"status"`
	VerifiedAt       *time.Time       `json:"verified_at"`
	FailReason       string           `gorm:"size:255" json:"fail_reason"`
	CreatedAt        time.Time        `json:"created_at"`
}

// Application 报名
type Application struct {
	ID              uint                 `gorm:"primaryKey" json:"id"`
	UserID          uint                 `gorm:"index;not null" json:"user_id"`
	User            User                 `gorm:"foreignKey:UserID" json:"user,omitempty"`
	ExamProjectID   uint                 `gorm:"index;not null" json:"exam_project_id"`
	ExamProject     ExamProject          `gorm:"foreignKey:ExamProjectID" json:"exam_project,omitempty"`
	JobPositionID   *uint                `gorm:"index" json:"job_position_id"`
	JobPosition     *JobPosition         `gorm:"foreignKey:JobPositionID" json:"job_position,omitempty"`
	JobCode         string               `gorm:"size:50" json:"job_code"`
	JobSnapshot     datatypes.JSON       `gorm:"type:json" json:"job_snapshot"`
	Status          ApplicationStatus    `gorm:"size:50;default:'DRAFT'" json:"status"`
	Major           string               `gorm:"size:100" json:"major"`
	Education       string               `gorm:"size:50" json:"education"`
	Employer        string               `gorm:"size:255" json:"employer"`
	PhotoURL        string               `gorm:"size:500" json:"photo_url"`
	Documents       datatypes.JSON       `gorm:"type:json" json:"documents"`
	ReviewNote      string               `gorm:"type:text" json:"review_note"`
	MaterialRevision int                 `gorm:"default:0" json:"material_revision"`
	Locked          bool                 `gorm:"default:false" json:"locked"`
	SubmittedAt     time.Time            `json:"submitted_at"`
	ApprovedAt      time.Time            `json:"approved_at"`
	CreatedAt       time.Time            `json:"created_at"`
	UpdatedAt       time.Time            `json:"updated_at"`

	// 关联
	Documents2  []ApplicationDocument `gorm:"foreignKey:ApplicationID" json:"documents2,omitempty"`
	ReviewTasks []ReviewTask          `gorm:"foreignKey:ApplicationID" json:"review_tasks,omitempty"`
	Orders      []PaymentOrder        `gorm:"foreignKey:ApplicationID" json:"orders,omitempty"`
	Ticket      *AdmissionTicket      `gorm:"foreignKey:ApplicationID" json:"ticket,omitempty"`
	Score       *ScoreRecord          `gorm:"foreignKey:ApplicationID" json:"score,omitempty"`
}

// ApplicationDocument 报名材料
type ApplicationDocument struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	ApplicationID uint      `gorm:"index;not null" json:"application_id"`
	Name          string    `gorm:"size:100;not null" json:"name"`
	FileURL       string    `gorm:"size:500;not null" json:"file_url"`
	FileType      string    `gorm:"size:50" json:"file_type"`
	FileSize      int64     `json:"file_size"`
	UploadedAt    time.Time `json:"uploaded_at"`
}

// ReviewTask 审核任务
type ReviewTask struct {
	ID            uint         `gorm:"primaryKey" json:"id"`
	ApplicationID uint         `gorm:"index;not null" json:"application_id"`
	ReviewerID    *uint        `gorm:"index" json:"reviewer_id"`
	Reviewer      *AdminUser   `gorm:"foreignKey:ReviewerID" json:"reviewer,omitempty"`
	ReviewLevel   int          `gorm:"default:1" json:"review_level"`
	Status        ReviewStatus `gorm:"size:50;default:'PENDING'" json:"status"`
	AssignedAt    time.Time    `json:"assigned_at"`
	CompletedAt   *time.Time   `json:"completed_at"`
}

// ReviewLog 审核日志
type ReviewLog struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	ApplicationID uint      `gorm:"index;not null" json:"application_id"`
	ReviewerID    uint      `gorm:"index;not null" json:"reviewer_id"`
	Reviewer      AdminUser `gorm:"foreignKey:ReviewerID" json:"reviewer,omitempty"`
	Action        string    `gorm:"size:50;not null" json:"action"` // approve, reject, revise
	Comment       string    `gorm:"type:text" json:"comment"`
	CreatedAt     time.Time `json:"created_at"`
}

// ExamArea 考点
type ExamArea struct {
	ID            uint       `gorm:"primaryKey" json:"id"`
	ExamProjectID uint      `gorm:"index;not null" json:"exam_project_id"`
	Code          string    `gorm:"uniqueIndex;size:50;not null" json:"code"`
	Name          string    `gorm:"size:100;not null" json:"name"`
	Enabled       bool      `gorm:"default:true" json:"enabled"`
	CreatedAt     time.Time `json:"created_at"`

	// 关联
	Venues []ExamVenue `gorm:"foreignKey:AreaID" json:"venues,omitempty"`
}

// ExamVenue 考场（学校/单位）
type ExamVenue struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	AreaID    uint      `gorm:"index;not null" json:"area_id"`
	Area      ExamArea  `gorm:"foreignKey:AreaID" json:"area,omitempty"`
	Code      string    `gorm:"uniqueIndex;size:50;not null" json:"code"`
	Name      string    `gorm:"size:100;not null" json:"name"`
	Address   string    `gorm:"size:255" json:"address"`
	Enabled   bool      `gorm:"default:true" json:"enabled"`
	CreatedAt time.Time `json:"created_at"`

	// 关联
	Rooms []ExamRoom `gorm:"foreignKey:VenueID" json:"rooms,omitempty"`
}

// ExamRoom 考场（教室）
type ExamRoom struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	VenueID   uint      `gorm:"index;not null" json:"venue_id"`
	Venue     ExamVenue `gorm:"foreignKey:VenueID" json:"venue,omitempty"`
	Name      string    `gorm:"size:100;not null" json:"name"`
	Capacity  int       `gorm:"not null" json:"capacity"`
	Enabled   bool      `gorm:"default:true" json:"enabled"`
	CreatedAt time.Time `json:"created_at"`
}

// SeatAssignment 座位分配
type SeatAssignment struct {
	ID            uint         `gorm:"primaryKey" json:"id"`
	ExamProjectID uint         `gorm:"index;not null" json:"exam_project_id"`
	ApplicationID uint         `gorm:"index;not null" json:"application_id"`
	Application   Application  `gorm:"foreignKey:ApplicationID" json:"application,omitempty"`
	RoomID        uint         `gorm:"index;not null" json:"room_id"`
	Room          ExamRoom     `gorm:"foreignKey:RoomID" json:"room,omitempty"`
	SeatNo        string       `gorm:"size:10;not null" json:"seat_no"`
	ExamDate      time.Time    `json:"exam_date"`
	ExamTime      string       `gorm:"size:50" json:"exam_time"`
	CreatedAt     time.Time    `json:"created_at"`
}

// TicketTemplate 准考证模板
type TicketTemplate struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	ExamProjectID   uint           `gorm:"index;not null" json:"exam_project_id"`
	ExamProject     ExamProject    `gorm:"foreignKey:ExamProjectID" json:"exam_project,omitempty"`
	Name            string         `gorm:"size:100;not null" json:"name"`
	Title           string         `gorm:"size:255" json:"title"`
	Subtitle        string         `gorm:"size:255" json:"subtitle"`
	NoticeItems     datatypes.JSON `gorm:"type:json" json:"notice_items"`
	ShowPhoto       bool           `gorm:"default:true" json:"show_photo"`
	ShowEthnicity   bool           `gorm:"default:true" json:"show_ethnicity"`
	ShowJobCode     bool           `gorm:"default:true" json:"show_job_code"`
	ShowExamSubject bool           `gorm:"default:true" json:"show_exam_subject"`
	IsDefault       bool           `gorm:"default:false" json:"is_default"`
	Version         string         `gorm:"size:20;default:'v1'" json:"version"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
}

// AdmissionTicket 准考证
type AdmissionTicket struct {
	ID            uint            `gorm:"primaryKey" json:"id"`
	ApplicationID uint            `gorm:"uniqueIndex;not null" json:"application_id"`
	Application   Application     `gorm:"foreignKey:ApplicationID" json:"application,omitempty"`
	TicketNo      string          `gorm:"uniqueIndex;size:50;not null" json:"ticket_no"`
	ExamTime      time.Time       `json:"exam_time"`
	AreaName      string          `gorm:"size:100" json:"area_name"`
	Venue         string          `gorm:"size:255" json:"venue"`
	VenueAddress  string          `gorm:"size:255" json:"venue_address"`
	Room          string          `gorm:"size:100" json:"room"`
	SeatNo        string          `gorm:"size:10" json:"seat_no"`
	JobCode       string          `gorm:"size:50" json:"job_code"`
	JobName       string          `gorm:"size:100" json:"job_name"`
	ExamSubject   string          `gorm:"size:100" json:"exam_subject"`
	TemplateID    *uint           `json:"template_id"`
	Template      *TicketTemplate `gorm:"foreignKey:TemplateID" json:"template,omitempty"`
	PrintedAt     *time.Time      `json:"printed_at"`
	CreatedAt     time.Time       `json:"created_at"`
}

// ScoreRecord 成绩
type ScoreRecord struct {
	ID            uint            `gorm:"primaryKey" json:"id"`
	ApplicationID uint            `gorm:"uniqueIndex;not null" json:"application_id"`
	Application   Application     `gorm:"foreignKey:ApplicationID" json:"application,omitempty"`
	TicketNo      string          `gorm:"index;size:50" json:"ticket_no"`
	IDCard        string          `gorm:"index;size:18" json:"id_card"`
	TotalScore    decimal.Decimal `gorm:"type:decimal(5,2)" json:"total_score"`
	Published     bool            `gorm:"default:false" json:"published"`
	ReleasedAt    *time.Time      `json:"released_at"`
	CreatedAt     time.Time       `json:"created_at"`

	// 关联
	Subjects []ScoreSubject `gorm:"foreignKey:ScoreRecordID" json:"subjects,omitempty"`
}

// ScoreSubject 成绩科目
type ScoreSubject struct {
	ID            uint    `gorm:"primaryKey" json:"id"`
	ScoreRecordID uint    `gorm:"index;not null" json:"score_record_id"`
	SubjectName   string  `gorm:"size:100;not null" json:"subject_name"`
	Score         decimal.Decimal `gorm:"type:decimal(5,2)" json:"score"`
	FullScore     decimal.Decimal `gorm:"type:decimal(5,2)" json:"full_score"`
	Ranking       *int    `json:"ranking"`
}

// AdminUser 管理员用户
type AdminUser struct {
	ID           string         `gorm:"primaryKey" json:"id"`
	Username     string         `gorm:"uniqueIndex;size:50;not null" json:"username"`
	PasswordHash string         `gorm:"size:255;not null" json:"-"`
	Name         string         `gorm:"size:50;not null" json:"name"`
	Role         UserRole       `gorm:"size:50;not null" json:"role"`
	Permissions  datatypes.JSON `gorm:"type:json" json:"permissions"`
	Disabled     bool           `gorm:"default:false" json:"disabled"`
	LastLoginAt  *time.Time     `json:"last_login_at"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
}

// AdminRole 管理员角色
type AdminRole struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Code        string         `gorm:"uniqueIndex;size:50;not null" json:"code"`
	Name        string         `gorm:"size:100;not null" json:"name"`
	Permissions datatypes.JSON `gorm:"type:json" json:"permissions"`
	Description string         `gorm:"size:255" json:"description"`
	CreatedAt   time.Time      `json:"created_at"`
}

// PaymentOrder 支付订单
type PaymentOrder struct {
	ID                   uint             `gorm:"primaryKey" json:"id"`
	OrderNo              string           `gorm:"uniqueIndex;size:50;not null" json:"order_no"`
	ApplicationID        uint             `gorm:"index;not null" json:"application_id"`
	Application          Application      `gorm:"foreignKey:ApplicationID" json:"application,omitempty"`
	Amount               decimal.Decimal  `gorm:"type:decimal(10,2);not null" json:"amount"`
	Provider             PaymentProvider  `gorm:"size:50;not null" json:"provider"`
	Status               PaymentStatus    `gorm:"size:50;default:'PENDING'" json:"status"`
	ProviderTradeNo      string           `gorm:"size:100" json:"provider_trade_no"`
	ReconciliationStatus string           `gorm:"size:50" json:"reconciliation_status"`
	PaidAt               *time.Time       `json:"paid_at"`
	CreatedAt            time.Time        `json:"created_at"`
	UpdatedAt            time.Time        `json:"updated_at"`
}

// PaymentRefund 退款记录
type PaymentRefund struct {
	ID          uint        `gorm:"primaryKey" json:"id"`
	OrderID     uint        `gorm:"index;not null" json:"order_id"`
	Order       PaymentOrder `gorm:"foreignKey:OrderID" json:"order,omitempty"`
	RefundNo    string      `gorm:"uniqueIndex;size:50;not null" json:"refund_no"`
	Amount      decimal.Decimal `gorm:"type:decimal(10,2);not null" json:"amount"`
	Reason      string      `gorm:"type:text" json:"reason"`
	Status      string      `gorm:"size:50;default:'PENDING'" json:"status"`
	ProcessedAt *time.Time  `json:"processed_at"`
	CreatedAt   time.Time   `json:"created_at"`
}

// LoginLog 登录日志
type LoginLog struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    *uint     `gorm:"index" json:"user_id"`
	UserType  string    `gorm:"size:20" json:"user_type"` // candidate, admin
	Account   string    `gorm:"size:50" json:"account"`
	IP        string    `gorm:"size:50" json:"ip"`
	UserAgent string    `gorm:"size:500" json:"user_agent"`
	Success   bool      `gorm:"default:false" json:"success"`
	FailReason string   `gorm:"size:255" json:"fail_reason"`
	CreatedAt time.Time `json:"created_at"`
}

// OperationLog 操作日志
type OperationLog struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	AdminUserID uint     `gorm:"index;not null" json:"admin_user_id"`
	AdminUser  AdminUser `gorm:"foreignKey:AdminUserID" json:"admin_user,omitempty"`
	Action     string    `gorm:"size:100;not null" json:"action"`
	TargetType string    `gorm:"size:50" json:"target_type"`
	TargetID   string    `gorm:"size:50" json:"target_id"`
	Detail     string    `gorm:"type:text" json:"detail"`
	IP         string    `gorm:"size:50" json:"ip"`
	CreatedAt  time.Time `json:"created_at"`
}

func (ar *ExamRoom) BeforeCreate(tx *gorm.DB) error {
	if ar.VenueID != 0 && ar.Name != "" {
		var count int64
		tx.Model(&ExamRoom{}).Where("venue_id = ? AND name = ?", ar.VenueID, ar.Name).Count(&count)
		if count > 0 {
			return gorm.ErrDuplicatedKey
		}
	}
	return nil
}


-- 考试系统初始数据库结构
-- Created: 2026-04-06

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 考试分类
CREATE TABLE exam_categories (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(255),
    sort_order INT DEFAULT 0,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 考试项目
CREATE TABLE exam_projects (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES exam_categories(id),
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    logo_url VARCHAR(500),
    banner_url VARCHAR(500),
    contact_phone VARCHAR(20),
    description TEXT,
    notice_text TEXT,
    registration_start TIMESTAMP NOT NULL,
    registration_end TIMESTAMP NOT NULL,
    review_end TIMESTAMP,
    payment_end TIMESTAMP,
    ticket_start TIMESTAMP,
    score_release_at TIMESTAMP,
    fee DECIMAL(10,2) DEFAULT 0,
    id_verification_type VARCHAR(50),
    allow_multi_apply BOOLEAN DEFAULT FALSE,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 考试公告
CREATE TABLE exam_notices (
    id SERIAL PRIMARY KEY,
    exam_project_id INT REFERENCES exam_projects(id) NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary VARCHAR(500),
    body TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    pinned BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 报名配置
CREATE TABLE exam_configs (
    id SERIAL PRIMARY KEY,
    exam_project_id INT UNIQUE REFERENCES exam_projects(id) NOT NULL,
    require_id_verify BOOLEAN DEFAULT TRUE,
    require_phone_verify BOOLEAN DEFAULT TRUE,
    require_photo BOOLEAN DEFAULT TRUE,
    require_documents BOOLEAN DEFAULT FALSE,
    custom_fields JSONB,
    payment_after_approve BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 职位
CREATE TABLE job_positions (
    id SERIAL PRIMARY KEY,
    exam_project_id INT REFERENCES exam_projects(id) NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    quota INT DEFAULT 1,
    organization VARCHAR(255),
    exam_subject VARCHAR(100),
    major_requirement VARCHAR(255),
    education_requirement VARCHAR(100),
    degree_requirement VARCHAR(50),
    age_requirement VARCHAR(100),
    gender_requirement VARCHAR(20),
    household_requirement VARCHAR(50),
    experience_requirement VARCHAR(255),
    notes TEXT,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(exam_project_id, code)
);

-- 考生用户
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    exam_project_id INT REFERENCES exam_projects(id),
    id_card VARCHAR(18) UNIQUE NOT NULL,
    phone VARCHAR(11) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    gender VARCHAR(10),
    ethnicity VARCHAR(20),
    email VARCHAR(100),
    address VARCHAR(255),
    emergency_contact VARCHAR(100),
    disabled BOOLEAN DEFAULT FALSE,
    blacklisted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 实名认证记录
CREATE TABLE identity_verifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) NOT NULL,
    id_card VARCHAR(18) NOT NULL,
    name VARCHAR(50) NOT NULL,
    verification_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    verified_at TIMESTAMP,
    fail_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 报名
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) NOT NULL,
    exam_project_id INT REFERENCES exam_projects(id) NOT NULL,
    job_position_id INT REFERENCES job_positions(id),
    job_code VARCHAR(50),
    job_snapshot JSONB,
    status VARCHAR(50) DEFAULT 'DRAFT',
    major VARCHAR(100),
    education VARCHAR(50),
    employer VARCHAR(255),
    photo_url VARCHAR(500),
    documents JSONB,
    review_note TEXT,
    material_revision INT DEFAULT 0,
    locked BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, exam_project_id)
);

-- 报名材料
CREATE TABLE application_documents (
    id SERIAL PRIMARY KEY,
    application_id INT REFERENCES applications(id) NOT NULL,
    name VARCHAR(100) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size BIGINT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 审核任务
CREATE TABLE review_tasks (
    id SERIAL PRIMARY KEY,
    application_id INT REFERENCES applications(id) NOT NULL,
    reviewer_id INT,
    review_level INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'PENDING',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- 审核日志
CREATE TABLE review_logs (
    id SERIAL PRIMARY KEY,
    application_id INT REFERENCES applications(id) NOT NULL,
    reviewer_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 考点
CREATE TABLE exam_areas (
    id SERIAL PRIMARY KEY,
    exam_project_id INT REFERENCES exam_projects(id) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 考场（学校/单位）
CREATE TABLE exam_venues (
    id SERIAL PRIMARY KEY,
    area_id INT REFERENCES exam_areas(id) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 考场（教室）
CREATE TABLE exam_rooms (
    id SERIAL PRIMARY KEY,
    venue_id INT REFERENCES exam_venues(id) NOT NULL,
    name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(venue_id, name)
);

-- 座位分配
CREATE TABLE seat_assignments (
    id SERIAL PRIMARY KEY,
    exam_project_id INT REFERENCES exam_projects(id) NOT NULL,
    application_id INT REFERENCES applications(id) NOT NULL,
    room_id INT REFERENCES exam_rooms(id) NOT NULL,
    seat_no VARCHAR(10) NOT NULL,
    exam_date TIMESTAMP,
    exam_time VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 准考证模板
CREATE TABLE ticket_templates (
    id SERIAL PRIMARY KEY,
    exam_project_id INT REFERENCES exam_projects(id) NOT NULL,
    name VARCHAR(100) NOT NULL,
    title VARCHAR(255),
    subtitle VARCHAR(255),
    notice_items JSONB,
    show_photo BOOLEAN DEFAULT TRUE,
    show_ethnicity BOOLEAN DEFAULT TRUE,
    show_job_code BOOLEAN DEFAULT TRUE,
    show_exam_subject BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    version VARCHAR(20) DEFAULT 'v1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 准考证
CREATE TABLE admission_tickets (
    id SERIAL PRIMARY KEY,
    application_id INT UNIQUE REFERENCES applications(id) NOT NULL,
    ticket_no VARCHAR(50) UNIQUE NOT NULL,
    exam_time TIMESTAMP,
    area_name VARCHAR(100),
    venue VARCHAR(255),
    venue_address VARCHAR(255),
    room VARCHAR(100),
    seat_no VARCHAR(10),
    job_code VARCHAR(50),
    job_name VARCHAR(100),
    exam_subject VARCHAR(100),
    template_id INT REFERENCES ticket_templates(id),
    printed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 成绩
CREATE TABLE score_records (
    id SERIAL PRIMARY KEY,
    application_id INT UNIQUE REFERENCES applications(id) NOT NULL,
    ticket_no VARCHAR(50),
    id_card VARCHAR(18),
    total_score DECIMAL(5,2),
    published BOOLEAN DEFAULT FALSE,
    released_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 成绩科目
CREATE TABLE score_subjects (
    id SERIAL PRIMARY KEY,
    score_record_id INT REFERENCES score_records(id) NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    score DECIMAL(5,2),
    full_score DECIMAL(5,2),
    ranking INT
);

-- 管理员用户
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    role VARCHAR(50) NOT NULL,
    permissions JSONB,
    disabled BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 管理员角色
CREATE TABLE admin_roles (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    permissions JSONB,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 支付订单
CREATE TABLE payment_orders (
    id SERIAL PRIMARY KEY,
    order_no VARCHAR(50) UNIQUE NOT NULL,
    application_id INT REFERENCES applications(id) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    provider_trade_no VARCHAR(100),
    reconciliation_status VARCHAR(50),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 退款记录
CREATE TABLE payment_refunds (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES payment_orders(id) NOT NULL,
    refund_no VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 登录日志
CREATE TABLE login_logs (
    id SERIAL PRIMARY KEY,
    user_id INT,
    user_type VARCHAR(20),
    account VARCHAR(50),
    ip VARCHAR(50),
    user_agent VARCHAR(500),
    success BOOLEAN DEFAULT FALSE,
    fail_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 操作日志
CREATE TABLE operation_logs (
    id SERIAL PRIMARY KEY,
    admin_user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id VARCHAR(50),
    detail TEXT,
    ip VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_exam_projects_category ON exam_projects(category_id);
CREATE INDEX idx_exam_projects_slug ON exam_projects(slug);
CREATE INDEX idx_exam_notices_exam_project ON exam_notices(exam_project_id);
CREATE INDEX idx_job_positions_exam_project ON job_positions(exam_project_id);
CREATE INDEX idx_users_exam_project ON users(exam_project_id);
CREATE INDEX idx_users_id_card ON users(id_card);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_applications_exam_project ON applications(exam_project_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_review_tasks_application ON review_tasks(application_id);
CREATE INDEX idx_review_tasks_reviewer ON review_tasks(reviewer_id);
CREATE INDEX idx_seat_assignments_exam_project ON seat_assignments(exam_project_id);
CREATE INDEX idx_seat_assignments_application ON seat_assignments(application_id);
CREATE INDEX idx_score_records_ticket_no ON score_records(ticket_no);
CREATE INDEX idx_score_records_id_card ON score_records(id_card);
CREATE INDEX idx_payment_orders_order_no ON payment_orders(order_no);
CREATE INDEX idx_payment_orders_application ON payment_orders(application_id);
CREATE INDEX idx_payment_orders_status ON payment_orders(status);
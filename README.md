# 考试系统 (Kaoshi)

多考点考试报名与管理平台。

## 技术栈

- **前端**：Next.js 14 + TypeScript + TailwindCSS
- **管理后台**：React + Vite + shadcn/ui
- **后端**：Go + Gin + GORM
- **数据库**：PostgreSQL + Prisma

## 本地开发

### 1. 启动前端

```bash
npm run dev
```

访问 http://localhost:3000

### 2. 启动后端 API

```bash
cd server
go build -o server ./cmd/server/
DATABASE_URL="postgres://postgres:postgres@localhost:5432/kaoshi?sslmode=disable" ./server
```

API 运行在 http://localhost:8080

### 3. 数据库迁移

```bash
cd prisma
npx prisma db push
npx prisma db seed
```

## 测试账号

### 考生账号

| 身份证号 | 密码 | 姓名 |
|---------|------|------|
| 150101199506121234 | 123456 | 张晓明 |
| 150101199001011234 | 123456 | 李某某 |
| 150101199201021234 | 123456 | 王五 |

### 管理员账号

| 用户名 | 密码 | 角色 | 姓名 |
|--------|------|------|------|
| admin | admin123 | 管理员 | 系统管理员 |
| reviewer-1 | review123 | 审核员 | 审核专员 |

> 管理员账号也可以使用 ID（如 admin-1）、手机号（13800000099）或身份证号登录

### API 登录示例

```bash
# 考生登录
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"id_card":"150101199506121234","password":"123456"}'

# 响应
{"code":0,"message":"success","data":{"token":"...","user":{"id":"user-1","name":"张晓明"}}}
```

## 项目结构

```
├── src/                    # Next.js 前端源码
│   ├── app/               # App Router 页面
│   ├── components/        # React 组件
│   └── lib/               # 工具函数
├── server/                # Go 后端源码
│   ├── cmd/server/        # 程序入口
│   └── internal/          # 内部包
│       ├── api/           # HTTP 接口
│       ├── model/         # 数据模型
│       ├── repository/    # 数据访问层
│       └── service/       # 业务逻辑
├── prisma/                # 数据库 schema 和 seed
└── admin/                 # 管理后台前端
```

## 功能模块

- 公告发布
- 实名注册
- 考生缴费
- 信息填报
- 资格审核
- 考场编排
- 准考证打印
- 成绩查询

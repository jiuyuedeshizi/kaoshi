package api

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"exam-server/internal/api/handler"
	"exam-server/internal/api/handler/admin"
	"exam-server/internal/api/middleware"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	// 中间件
	r.Use(middleware.CORS())
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	// 健康检查
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "time": time.Now()})
	})

	// API v1
	v1 := r.Group("/api/v1")
	{
		// 公开接口
		authGroup := v1.Group("/auth")
		authGroup.Use(middleware.RateLimit())
		{
			authGroup.POST("/login", handler.Login)
			authGroup.POST("/admin/login", handler.AdminLogin)
			authGroup.POST("/sms/send", handler.SendSMSCode)
			authGroup.POST("/sms/login", handler.SMSLogin)
			authGroup.POST("/register", handler.Register)
		}

		// 考试相关（公开）
		examsGroup := v1.Group("/exams")
		{
			examsGroup.GET("", handler.ListExams)
			examsGroup.GET("/:id", handler.GetExam)
			examsGroup.GET("/:id/notices", handler.ListExamNotices)
		}

		// 成绩查询（公开）
		v1.POST("/scores/query", handler.QueryScore)
	}

	// 需要认证的接口
	candidateGroup := v1.Group("")
	candidateGroup.Use(middleware.JWTAuth())
	{
		// 考生端
		candidateGroup.POST("/applications", handler.CreateApplication)
		candidateGroup.GET("/applications/:id", handler.GetApplication)
		candidateGroup.PUT("/applications/:id", handler.UpdateApplication)
		candidateGroup.POST("/applications/:id/submit", handler.SubmitApplication)

		// 支付
		candidateGroup.POST("/payments/orders", handler.CreateOrder)
		candidateGroup.GET("/payments/:orderNo/pay", handler.GetPayQR)

		// 准考证
		candidateGroup.GET("/tickets/:id/pdf", handler.GetTicketPDF)
	}

	// 管理端接口
	adminGroup := v1.Group("/admin")
	adminGroup.Use(middleware.JWTAuth())
	adminGroup.Use(middleware.RequireRole("ADMIN"))
	{
		// 考试管理
		adminGroup.GET("/exams", admin.ListExams)
		adminGroup.POST("/exams", admin.CreateExam)
		adminGroup.GET("/exams/:id", admin.GetExam)
		adminGroup.PUT("/exams/:id", admin.UpdateExam)
		adminGroup.DELETE("/exams/:id", admin.DeleteExam)

		// 职位管理
		adminGroup.GET("/jobs", admin.ListJobs)
		adminGroup.POST("/jobs", admin.CreateJob)
		adminGroup.PUT("/jobs/:id", admin.UpdateJob)
		adminGroup.DELETE("/jobs/:id", admin.DeleteJob)

		// 报名审核
		adminGroup.GET("/applications", admin.ListApplications)
		adminGroup.GET("/applications/:id", admin.GetApplication)
		adminGroup.POST("/applications/:id/review", admin.ReviewApplication)

		// 考点管理
		adminGroup.GET("/areas", admin.ListAreas)
		adminGroup.POST("/areas", admin.CreateArea)
		adminGroup.PUT("/areas/:id", admin.UpdateArea)

		// 考场管理
		adminGroup.GET("/venues", admin.ListVenues)
		adminGroup.POST("/venues", admin.CreateVenue)
		adminGroup.GET("/venues/:id/rooms", admin.ListRooms)
		adminGroup.POST("/venues/:id/rooms", admin.CreateRoom)

		// 座位编排
		adminGroup.POST("/scheduling/assign", admin.AssignSeats)
		adminGroup.GET("/scheduling/preview", admin.PreviewScheduling)

		// 准考证
		adminGroup.POST("/tickets/generate", admin.GenerateTickets)
		adminGroup.GET("/tickets", admin.ListTickets)

		// 成绩管理
		adminGroup.POST("/scores/import", admin.ImportScores)
		adminGroup.POST("/scores/publish", admin.PublishScores)

		// 公告管理
		adminGroup.GET("/notices", admin.ListNotices)
		adminGroup.POST("/notices", admin.CreateNotice)
		adminGroup.PUT("/notices/:id", admin.UpdateNotice)
		adminGroup.DELETE("/notices/:id", admin.DeleteNotice)

		// 用户管理
		adminGroup.GET("/users", admin.ListUsers)
		adminGroup.GET("/users/:id", admin.GetUser)

		// 订单管理
		adminGroup.GET("/orders", admin.ListOrders)
		adminGroup.GET("/orders/:id", admin.GetOrder)

		// 系统设置
		adminGroup.GET("/settings", admin.GetSettings)
		adminGroup.PUT("/settings", admin.UpdateSettings)
	}

	return r
}

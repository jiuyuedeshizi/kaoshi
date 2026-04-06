package handler

import (
	"strconv"

	"github.com/gin-gonic/gin"

	"exam-server/internal/pkg/response"
	"exam-server/internal/service"
)

type ExamHandler struct {
	examService *service.ExamService
}

func NewExamHandler() *ExamHandler {
	return &ExamHandler{
		examService: service.NewExamService(),
	}
}

func ListExams(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var categoryID *uint
	if catStr := c.Query("category_id"); catStr != "" {
		if id, err := strconv.ParseUint(catStr, 10, 32); err == nil {
			cid := uint(id)
			categoryID = &cid
		}
	}

	examService := service.NewExamService()
	exams, total, err := examService.ListExams(page, pageSize, categoryID)
	if err != nil {
		response.ServerError(c, err.Error())
		return
	}

	response.Page(c, response.PageResult{
		Items:      exams,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: (total + int64(pageSize) - 1) / int64(pageSize),
	})
}

func GetExam(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "无效的考试ID")
		return
	}

	examService := service.NewExamService()
	exam, err := examService.GetExam(uint(id))
	if err != nil {
		response.NotFound(c, "考试不存在")
		return
	}

	response.Success(c, exam)
}

func ListExamNotices(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "无效的考试ID")
		return
	}

	examService := service.NewExamService()
	notices, err := examService.ListNotices(uint(id))
	if err != nil {
		response.ServerError(c, err.Error())
		return
	}

	response.Success(c, notices)
}

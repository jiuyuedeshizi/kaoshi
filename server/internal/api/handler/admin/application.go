package admin

import (
	"strconv"

	"github.com/gin-gonic/gin"

	"exam-server/internal/pkg/response"
	"exam-server/internal/repository"
	"exam-server/internal/service"
)

func ListApplications(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	var examID *uint
	var status *string

	if eidStr := c.Query("exam_id"); eidStr != "" {
		if eid, err := strconv.ParseUint(eidStr, 10, 32); err == nil {
			e := uint(eid)
			examID = &e
		}
	}
	if s := c.Query("status"); s != "" {
		status = &s
	}

	repo := &repository.ApplicationRepository{}
	apps, total, _ := repo.List(page, pageSize, examID, status)

	response.Page(c, response.PageResult{
		Items:      apps,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: (total + int64(pageSize) - 1) / int64(pageSize),
	})
}

func GetApplication(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	appService := service.NewApplicationService()
	app, err := appService.GetApplication(uint(id))
	if err != nil {
		response.NotFound(c, "报名不存在")
		return
	}
	response.Success(c, app)
}

func ReviewApplication(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	reviewerID := c.GetUint("user_id")

	var req struct {
		Action  string `json:"action"`
		Comment string `json:"comment"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	appService := service.NewApplicationService()
	if err := appService.ReviewApplication(uint(id), reviewerID, req.Action, req.Comment); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, gin.H{"message": "审核完成"})
}

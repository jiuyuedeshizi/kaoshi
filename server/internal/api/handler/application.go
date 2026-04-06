package handler

import (
	"strconv"

	"github.com/gin-gonic/gin"

	"exam-server/internal/model"
	"exam-server/internal/pkg/response"
	"exam-server/internal/service"
)

type ApplicationHandler struct {
	appService *service.ApplicationService
}

func NewApplicationHandler() *ApplicationHandler {
	return &ApplicationHandler{
		appService: service.NewApplicationService(),
	}
}

func CreateApplication(c *gin.Context) {
	userID := c.GetUint("user_id")

	var data model.Application
	if err := c.ShouldBindJSON(&data); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	appService := service.NewApplicationService()
	examID := data.ExamProjectID
	app, err := appService.CreateApplication(userID, examID, &data)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Created(c, app)
}

func GetApplication(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "无效的报名ID")
		return
	}

	appService := service.NewApplicationService()
	app, err := appService.GetApplication(uint(id))
	if err != nil {
		response.NotFound(c, "报名不存在")
		return
	}

	response.Success(c, app)
}

func UpdateApplication(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "无效的报名ID")
		return
	}

	var data model.Application
	if err := c.ShouldBindJSON(&data); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	appService := service.NewApplicationService()
	app, err := appService.UpdateApplication(uint(id), userID, &data)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, app)
}

func SubmitApplication(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "无效的报名ID")
		return
	}

	appService := service.NewApplicationService()
	if err := appService.SubmitApplication(uint(id), userID); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, gin.H{"message": "提交成功"})
}

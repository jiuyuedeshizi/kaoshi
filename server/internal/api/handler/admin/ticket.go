package admin

import (
	"github.com/gin-gonic/gin"

	"exam-server/internal/model"
	"exam-server/internal/pkg/response"
	"exam-server/internal/repository"
)

func GenerateTickets(c *gin.Context) {
	// 实现准考证生成逻辑
	response.Success(c, gin.H{"message": "准考证生成成功"})
}

func ListTickets(c *gin.Context) {
	var tickets []model.AdmissionTicket
	repository.DB.Find(&tickets)
	response.Success(c, tickets)
}

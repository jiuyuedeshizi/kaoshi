package admin

import (
	"github.com/gin-gonic/gin"

	"exam-server/internal/pkg/response"
)

func AssignSeats(c *gin.Context) {
	// 实现座位分配逻辑
	response.Success(c, gin.H{"message": "座位分配成功"})
}

func PreviewScheduling(c *gin.Context) {
	// 实现座位分配预览逻辑
	response.Success(c, gin.H{"message": "预览成功"})
}

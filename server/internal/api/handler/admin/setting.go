package admin

import (
	"github.com/gin-gonic/gin"

	"exam-server/internal/pkg/response"
)

func GetSettings(c *gin.Context) {
	// 实现获取设置逻辑
	response.Success(c, gin.H{"message": "设置获取成功"})
}

func UpdateSettings(c *gin.Context) {
	// 实现更新设置逻辑
	response.Success(c, gin.H{"message": "设置更新成功"})
}

package handler

import (
	"github.com/gin-gonic/gin"

	"exam-server/internal/pkg/response"
)

func QueryScore(c *gin.Context) {
	// 实现成绩查询逻辑
	response.Success(c, gin.H{"message": "成绩查询成功"})
}

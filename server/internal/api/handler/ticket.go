package handler

import (
	"github.com/gin-gonic/gin"

	"exam-server/internal/pkg/response"
)

func GetTicketPDF(c *gin.Context) {
	ticketID := c.Param("id")
	// 实现获取准考证PDF逻辑
	response.Success(c, gin.H{
		"ticket_id": ticketID,
		"pdf_url":   "",
	})
}

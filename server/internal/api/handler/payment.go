package handler

import (
	"github.com/gin-gonic/gin"

	"exam-server/internal/pkg/response"
)

func CreateOrder(c *gin.Context) {
	// 实现创建订单逻辑
	response.Success(c, gin.H{"message": "订单创建成功"})
}

func GetPayQR(c *gin.Context) {
	orderNo := c.Param("orderNo")
	// 实现获取支付二维码逻辑
	response.Success(c, gin.H{
		"order_no":  orderNo,
		"qr_code":   "",
		"pay_url":   "",
	})
}

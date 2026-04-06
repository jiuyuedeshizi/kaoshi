package admin

import (
	"strconv"

	"github.com/gin-gonic/gin"

	"exam-server/internal/model"
	"exam-server/internal/pkg/response"
	"exam-server/internal/repository"
)

func ListOrders(c *gin.Context) {
	var orders []model.PaymentOrder
	repository.DB.Find(&orders)
	response.Success(c, orders)
}

func GetOrder(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	var order model.PaymentOrder
	if err := repository.DB.First(&order, id).Error; err != nil {
		response.NotFound(c, "订单不存在")
		return
	}
	response.Success(c, order)
}

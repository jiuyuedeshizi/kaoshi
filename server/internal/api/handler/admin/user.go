package admin

import (
	"strconv"

	"github.com/gin-gonic/gin"

	"exam-server/internal/pkg/response"
	"exam-server/internal/repository"
)

func ListUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	repo := &repository.UserRepository{}
	users, total, _ := repo.List(page, pageSize)

	response.Page(c, response.PageResult{
		Items:      users,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: (total + int64(pageSize) - 1) / int64(pageSize),
	})
}

func GetUser(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	repo := &repository.UserRepository{}
	user, err := repo.FindByID(uint(id))
	if err != nil {
		response.NotFound(c, "用户不存在")
		return
	}
	response.Success(c, user)
}

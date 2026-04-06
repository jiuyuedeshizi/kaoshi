package admin

import (
	"strconv"

	"github.com/gin-gonic/gin"

	"exam-server/internal/model"
	"exam-server/internal/pkg/response"
	"exam-server/internal/repository"
)

func ListNotices(c *gin.Context) {
	var notices []model.ExamNotice
	repository.DB.Find(&notices)
	response.Success(c, notices)
}

func CreateNotice(c *gin.Context) {
	var notice model.ExamNotice
	if err := c.ShouldBindJSON(&notice); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}
	if err := repository.DB.Create(&notice).Error; err != nil {
		response.ServerError(c, err.Error())
		return
	}
	response.Created(c, notice)
}

func UpdateNotice(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	var notice model.ExamNotice
	if err := c.ShouldBindJSON(&notice); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}
	notice.ID = uint(id)
	if err := repository.DB.Save(&notice).Error; err != nil {
		response.ServerError(c, err.Error())
		return
	}
	response.Success(c, notice)
}

func DeleteNotice(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	if err := repository.DB.Delete(&model.ExamNotice{}, id).Error; err != nil {
		response.ServerError(c, err.Error())
		return
	}
	response.Success(c, gin.H{"message": "删除成功"})
}

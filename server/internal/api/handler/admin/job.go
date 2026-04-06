package admin

import (
	"strconv"

	"github.com/gin-gonic/gin"

	"exam-server/internal/model"
	"exam-server/internal/pkg/response"
	"exam-server/internal/repository"
)

func ListJobs(c *gin.Context) {
	var jobs []model.JobPosition
	repository.DB.Find(&jobs)
	response.Success(c, jobs)
}

func CreateJob(c *gin.Context) {
	var job model.JobPosition
	if err := c.ShouldBindJSON(&job); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}
	if err := repository.DB.Create(&job).Error; err != nil {
		response.ServerError(c, err.Error())
		return
	}
	response.Created(c, job)
}

func UpdateJob(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	var job model.JobPosition
	if err := c.ShouldBindJSON(&job); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}
	job.ID = uint(id)
	if err := repository.DB.Save(&job).Error; err != nil {
		response.ServerError(c, err.Error())
		return
	}
	response.Success(c, job)
}

func DeleteJob(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	if err := repository.DB.Delete(&model.JobPosition{}, id).Error; err != nil {
		response.ServerError(c, err.Error())
		return
	}
	response.Success(c, gin.H{"message": "删除成功"})
}

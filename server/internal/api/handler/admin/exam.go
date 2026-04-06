package admin

import (
	"strconv"

	"github.com/gin-gonic/gin"

	"exam-server/internal/model"
	"exam-server/internal/pkg/response"
	"exam-server/internal/repository"
)

func ListExams(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	repo := &repository.ExamRepository{}
	exams, total, _ := repo.List(page, pageSize, nil)

	response.Page(c, response.PageResult{
		Items:      exams,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: (total + int64(pageSize) - 1) / int64(pageSize),
	})
}

func CreateExam(c *gin.Context) {
	var exam model.ExamProject
	if err := c.ShouldBindJSON(&exam); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	repo := &repository.ExamRepository{}
	if err := repo.Create(&exam); err != nil {
		response.ServerError(c, err.Error())
		return
	}

	response.Created(c, exam)
}

func GetExam(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	repo := &repository.ExamRepository{}
	exam, err := repo.FindByID(uint(id))
	if err != nil {
		response.NotFound(c, "考试不存在")
		return
	}
	response.Success(c, exam)
}

func UpdateExam(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	var exam model.ExamProject
	if err := c.ShouldBindJSON(&exam); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}
	exam.ID = uint(id)

	repo := &repository.ExamRepository{}
	if err := repo.Update(&exam); err != nil {
		response.ServerError(c, err.Error())
		return
	}
	response.Success(c, exam)
}

func DeleteExam(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	repo := &repository.ExamRepository{}
	if err := repo.Delete(uint(id)); err != nil {
		response.ServerError(c, err.Error())
		return
	}
	response.Success(c, gin.H{"message": "删除成功"})
}

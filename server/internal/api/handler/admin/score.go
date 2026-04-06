package admin

import (
	"encoding/csv"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"

	"exam-server/internal/model"
	"exam-server/internal/pkg/response"
	"exam-server/internal/repository"
)

func ImportScores(c *gin.Context) {
	file, _, err := c.Request.FormFile("file")
	if err != nil {
		response.BadRequest(c, "请上传文件")
		return
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		response.ServerError(c, err.Error())
		return
	}

	var imported int
	for i, row := range records {
		if i == 0 {
			continue // 跳过表头
		}
		if len(row) < 3 {
			continue
		}

		ticketNo := row[0]
		idCard := row[1]
		score, _ := strconv.ParseFloat(row[2], 64)

		var record model.ScoreRecord
		repository.DB.Where("ticket_no = ?", ticketNo).First(&record)

		record.TicketNo = ticketNo
		record.IDCard = idCard
		record.TotalScore = decimal.NewFromFloat(score).Round(2)

		if record.ID == 0 {
			repository.DB.Create(&record)
		} else {
			repository.DB.Save(&record)
		}
		imported++
	}

	response.Success(c, gin.H{"imported": imported})
}

func PublishScores(c *gin.Context) {
	var req struct {
		ExamID uint `json:"exam_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	// 发布成绩
	result := repository.DB.Model(&model.ScoreRecord{}).
		Where("application_id IN (?)",
			repository.DB.Model(&model.Application{}).
				Select("id").
				Where("exam_project_id = ?", req.ExamID)).
		Update("published", true)

	response.Success(c, gin.H{"published": result.RowsAffected})
}

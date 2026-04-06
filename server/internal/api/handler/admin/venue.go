package admin

import (
	"github.com/gin-gonic/gin"

	"exam-server/internal/model"
	"exam-server/internal/pkg/response"
	"exam-server/internal/repository"
)

func ListAreas(c *gin.Context) {
	var areas []model.ExamArea
	repository.DB.Find(&areas)
	response.Success(c, areas)
}

func CreateArea(c *gin.Context) {
	var area model.ExamArea
	if err := c.ShouldBindJSON(&area); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}
	if err := repository.DB.Create(&area).Error; err != nil {
		response.ServerError(c, err.Error())
		return
	}
	response.Created(c, area)
}

func UpdateArea(c *gin.Context) {
	var area model.ExamArea
	if err := c.ShouldBindJSON(&area); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}
	if err := repository.DB.Save(&area).Error; err != nil {
		response.ServerError(c, err.Error())
		return
	}
	response.Success(c, area)
}

func ListVenues(c *gin.Context) {
	var venues []model.ExamVenue
	repository.DB.Preload("Area").Find(&venues)
	response.Success(c, venues)
}

func CreateVenue(c *gin.Context) {
	var venue model.ExamVenue
	if err := c.ShouldBindJSON(&venue); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}
	if err := repository.DB.Create(&venue).Error; err != nil {
		response.ServerError(c, err.Error())
		return
	}
	response.Created(c, venue)
}

func ListRooms(c *gin.Context) {
	venueID := c.Param("id")
	var rooms []model.ExamRoom
	repository.DB.Where("venue_id = ?", venueID).Find(&rooms)
	response.Success(c, rooms)
}

func CreateRoom(c *gin.Context) {
	var room model.ExamRoom
	if err := c.ShouldBindJSON(&room); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}
	if err := repository.DB.Create(&room).Error; err != nil {
		response.ServerError(c, err.Error())
		return
	}
	response.Created(c, room)
}

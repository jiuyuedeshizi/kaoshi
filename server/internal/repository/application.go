package repository

import (
	"exam-server/internal/model"
)

type ApplicationRepository struct{}

func (r *ApplicationRepository) FindByID(id uint) (*model.Application, error) {
	var app model.Application
	result := DB.Preload("User").Preload("JobPosition").
		Preload("ExamProject").First(&app, id)
	return &app, result.Error
}

func (r *ApplicationRepository) FindByUserAndExam(userID, examID uint) (*model.Application, error) {
	var app model.Application
	result := DB.Where("user_id = ? AND exam_project_id = ?", userID, examID).
		First(&app)
	return &app, result.Error
}

func (r *ApplicationRepository) List(page, pageSize int, examID *uint, status *string) ([]model.Application, int64, error) {
	var apps []model.Application
	var total int64

	query := DB.Model(&model.Application{})
	if examID != nil {
		query = query.Where("exam_project_id = ?", *examID)
	}
	if status != nil {
		query = query.Where("status = ?", *status)
	}
	query.Count(&total)

	offset := (page - 1) * pageSize
	result := query.Offset(offset).Limit(pageSize).
		Order("created_at DESC").
		Preload("User").
		Preload("JobPosition").
		Find(&apps)

	return apps, total, result.Error
}

func (r *ApplicationRepository) Create(app *model.Application) error {
	return DB.Create(app).Error
}

func (r *ApplicationRepository) Update(app *model.Application) error {
	return DB.Save(app).Error
}

func (r *ApplicationRepository) UpdateStatus(id uint, status model.ApplicationStatus) error {
	return DB.Model(&model.Application{}).Where("id = ?", id).
		Update("status", status).Error
}

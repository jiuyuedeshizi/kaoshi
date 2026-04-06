package repository

import (
	"exam-server/internal/model"
)

type ExamRepository struct{}

func (r *ExamRepository) List(page, pageSize int, categoryID *uint) ([]model.ExamProject, int64, error) {
	var exams []model.ExamProject
	var total int64

	query := DB.Model(&model.ExamProject{})
	if categoryID != nil {
		query = query.Where("category_id = ?", *categoryID)
	}
	query.Count(&total)

	offset := (page - 1) * pageSize
	result := query.Offset(offset).Limit(pageSize).
		Order("created_at DESC").
		Preload("Category").
		Find(&exams)

	return exams, total, result.Error
}

func (r *ExamRepository) FindByID(id uint) (*model.ExamProject, error) {
	var exam model.ExamProject
	result := DB.Preload("Category").Preload("Config").First(&exam, id)
	return &exam, result.Error
}

func (r *ExamRepository) FindBySlug(slug string) (*model.ExamProject, error) {
	var exam model.ExamProject
	result := DB.Where("slug = ?", slug).Preload("Category").First(&exam)
	return &exam, result.Error
}

func (r *ExamRepository) Create(exam *model.ExamProject) error {
	return DB.Create(exam).Error
}

func (r *ExamRepository) Update(exam *model.ExamProject) error {
	return DB.Save(exam).Error
}

func (r *ExamRepository) Delete(id uint) error {
	return DB.Delete(&model.ExamProject{}, id).Error
}

func (r *ExamRepository) ListNotices(examID uint) ([]model.ExamNotice, error) {
	var notices []model.ExamNotice
	result := DB.Where("exam_project_id = ?", examID).
		Order("pinned DESC, published_at DESC").
		Find(&notices)
	return notices, result.Error
}

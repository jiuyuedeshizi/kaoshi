package service

import (
	"exam-server/internal/model"
	"exam-server/internal/repository"
)

type ExamService struct {
	examRepo *repository.ExamRepository
}

func NewExamService() *ExamService {
	return &ExamService{
		examRepo: &repository.ExamRepository{},
	}
}

func (s *ExamService) ListExams(page, pageSize int, categoryID *uint) ([]model.ExamProject, int64, error) {
	return s.examRepo.List(page, pageSize, categoryID)
}

func (s *ExamService) GetExam(id uint) (*model.ExamProject, error) {
	return s.examRepo.FindByID(id)
}

func (s *ExamService) GetExamBySlug(slug string) (*model.ExamProject, error) {
	return s.examRepo.FindBySlug(slug)
}

func (s *ExamService) CreateExam(exam *model.ExamProject) error {
	if exam.Slug == "" {
		exam.Slug = generateSlug(exam.Title)
	}
	return s.examRepo.Create(exam)
}

func (s *ExamService) UpdateExam(exam *model.ExamProject) error {
	return s.examRepo.Update(exam)
}

func (s *ExamService) DeleteExam(id uint) error {
	return s.examRepo.Delete(id)
}

func (s *ExamService) ListNotices(examID uint) ([]model.ExamNotice, error) {
	return s.examRepo.ListNotices(examID)
}

func generateSlug(title string) string {
	// 简单实现，可根据需要改进
	return title
}

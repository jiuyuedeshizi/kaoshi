package service

import (
	"errors"
	"time"

	"exam-server/internal/model"
	"exam-server/internal/repository"
)

type ApplicationService struct {
	appRepo *repository.ApplicationRepository
	examRepo *repository.ExamRepository
}

func NewApplicationService() *ApplicationService {
	return &ApplicationService{
		appRepo: &repository.ApplicationRepository{},
		examRepo: &repository.ExamRepository{},
	}
}

func (s *ApplicationService) CreateApplication(userID, examID uint, data *model.Application) (*model.Application, error) {
	// 检查是否已有报名
	existing, _ := s.appRepo.FindByUserAndExam(userID, examID)
	if existing != nil {
		return nil, errors.New("您已提交过报名")
	}

	// 检查考试是否在报名时间内
	exam, err := s.examRepo.FindByID(examID)
	if err != nil {
		return nil, errors.New("考试不存在")
	}

	now := time.Now()
	if now.Before(exam.RegistrationStart) {
		return nil, errors.New("报名尚未开始")
	}
	if now.After(exam.RegistrationEnd) {
		return nil, errors.New("报名已结束")
	}

	data.UserID = userID
	data.ExamProjectID = examID
	data.Status = model.AppStatusDraft

	if err := s.appRepo.Create(data); err != nil {
		return nil, err
	}

	return s.appRepo.FindByID(data.ID)
}

func (s *ApplicationService) GetApplication(id uint) (*model.Application, error) {
	return s.appRepo.FindByID(id)
}

func (s *ApplicationService) UpdateApplication(id uint, userID uint, data *model.Application) (*model.Application, error) {
	app, err := s.appRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("报名不存在")
	}

	if app.UserID != userID {
		return nil, errors.New("无权修改此报名")
	}

	if app.Status != model.AppStatusDraft {
		return nil, errors.New("当前状态不允许修改")
	}

	app.Major = data.Major
	app.Education = data.Education
	app.Employer = data.Employer
	app.PhotoURL = data.PhotoURL

	if err := s.appRepo.Update(app); err != nil {
		return nil, err
	}

	return app, nil
}

func (s *ApplicationService) SubmitApplication(id uint, userID uint) error {
	app, err := s.appRepo.FindByID(id)
	if err != nil {
		return errors.New("报名不存在")
	}

	if app.UserID != userID {
		return errors.New("无权操作此报名")
	}

	if app.Status != model.AppStatusDraft {
		return errors.New("当前状态不允许提交")
	}

	app.Status = model.AppStatusSubmitted
	app.SubmittedAt = time.Now()

	return s.appRepo.Update(app)
}

func (s *ApplicationService) ReviewApplication(id uint, reviewerID uint, action string, comment string) error {
	app, err := s.appRepo.FindByID(id)
	if err != nil {
		return errors.New("报名不存在")
	}

	var newStatus model.ApplicationStatus
	switch action {
	case "approve":
		newStatus = model.AppStatusApproved
	case "reject":
		newStatus = model.AppStatusRejected
	case "revise":
		newStatus = model.AppStatusDraft
		app.Locked = false
	default:
		return errors.New("无效的审核操作")
	}

	app.Status = newStatus
	app.ReviewNote = comment

	if err := s.appRepo.Update(app); err != nil {
		return err
	}

	// 记录审核日志
	log := &model.ReviewLog{
		ApplicationID: id,
		ReviewerID:    reviewerID,
		Action:        action,
		Comment:       comment,
	}
	return repository.DB.Create(log).Error
}

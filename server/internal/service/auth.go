package service

import (
	"errors"
	"time"

	"golang.org/x/crypto/bcrypt"

	"exam-server/internal/model"
	"exam-server/internal/pkg/jwt"
	"exam-server/internal/repository"
)

type AuthService struct {
	userRepo *repository.UserRepository
}

func NewAuthService() *AuthService {
	return &AuthService{
		userRepo: &repository.UserRepository{},
	}
}

func (s *AuthService) Login(idCard, password string) (string, *model.User, error) {
	user, err := s.userRepo.FindByIDCard(idCard)
	if err != nil {
		return "", nil, errors.New("用户不存在")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return "", nil, errors.New("密码错误")
	}

	if user.Disabled {
		return "", nil, errors.New("账号已被禁用")
	}

	token, err := jwt.GenerateCandidateToken(user.ID)
	return token, user, err
}

func (s *AuthService) Register(idCard, phone, password, name string) (*model.User, error) {
	// 检查是否已注册
	if _, err := s.userRepo.FindByIDCard(idCard); err == nil {
		return nil, errors.New("该身份证号已注册")
	}

	if _, err := s.userRepo.FindByPhone(phone); err == nil {
		return nil, errors.New("该手机号已注册")
	}

	// 加密密码
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &model.User{
		IDCard:       idCard,
		Phone:        phone,
		PasswordHash: string(hash),
		Name:         name,
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *AuthService) AdminLogin(username, password string) (string, *model.AdminUser, error) {
	var admin model.AdminUser
	if err := repository.DB.Where("username = ?", username).First(&admin).Error; err != nil {
		return "", nil, errors.New("用户名或密码错误")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(password)); err != nil {
		return "", nil, errors.New("用户名或密码错误")
	}

	if admin.Disabled {
		return "", nil, errors.New("账号已被禁用")
	}

	token, err := jwt.GenerateAdminToken(admin.ID, string(admin.Role))
	return token, &admin, err
}

func (s *AuthService) AdminRegister(username, password, name string, role model.UserRole) (*model.AdminUser, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	admin := &model.AdminUser{
		Username:     username,
		PasswordHash: string(hash),
		Name:         name,
		Role:         role,
	}

	if err := repository.DB.Create(admin).Error; err != nil {
		return nil, err
	}

	return admin, nil
}

func (s *AuthService) UpdateLastLogin(adminID uint) {
	now := time.Now()
	repository.DB.Model(&model.AdminUser{}).Where("id = ?", adminID).
		Update("last_login_at", now)
}

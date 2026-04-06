package service

import (
	"errors"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"

	"exam-server/internal/model"
	"exam-server/internal/pkg/jwt"
	"exam-server/internal/repository"
)

const bcryptCost = bcrypt.DefaultCost

type AuthService struct {
	userRepo *repository.UserRepository
}

func NewAuthService() *AuthService {
	return &AuthService{
		userRepo: &repository.UserRepository{},
	}
}

// hashPassword hashes a password using bcrypt
func hashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcryptCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

// verifyPassword verifies a password against a stored bcrypt hash
func verifyPassword(password, storedValue string) bool {
	return bcrypt.CompareHashAndPassword([]byte(storedValue), []byte(password)) == nil
}

func (s *AuthService) Login(idCard, password string) (string, *model.User, error) {
	user, err := s.userRepo.FindByIDCard(idCard)
	if err != nil {
		return "", nil, errors.New("用户不存在")
	}

	if !verifyPassword(password, user.PasswordHash) {
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

	// 加密密码 - 使用 bcrypt
	hash, err := hashPassword(password)
	if err != nil {
		return nil, err
	}

	user := &model.User{
		IDCard:       idCard,
		Phone:        phone,
		PasswordHash: hash,
		Name:         name,
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *AuthService) AdminLogin(username, password string) (string, *model.AdminUser, error) {
	var user model.User
	var err error

	// Special case: "admin" or "Admin" maps to the first admin user
	if strings.EqualFold(username, "admin") {
		err = repository.DB.Table("\"User\"").Where("\"role\" = ?", "ADMIN").First(&user).Error
	} else {
		// Admin can login with id, phone, idCard
		err = repository.DB.Table("\"User\"").Where("\"id\" = ? OR \"phone\" = ? OR \"idCard\" = ?", username, username, username).First(&user).Error
	}

	if err != nil {
		return "", nil, errors.New("用户名或密码错误")
	}

	// Check if user is admin
	if user.Role != model.UserRole("ADMIN") {
		return "", nil, errors.New("用户名或密码错误")
	}

	if !verifyPassword(password, user.PasswordHash) {
		return "", nil, errors.New("用户名或密码错误")
	}

	if user.Disabled {
		return "", nil, errors.New("账号已被禁用")
	}

	token, err := jwt.GenerateAdminToken(user.ID, string(user.Role))
	return token, &model.AdminUser{
		ID:           user.ID,
		Username:     user.Phone, // Use phone as username
		Name:         user.Name,
		Role:         user.Role,
		PasswordHash: user.PasswordHash,
		Disabled:     user.Disabled,
	}, err
}

func (s *AuthService) AdminRegister(username, password, name string, role model.UserRole) (*model.AdminUser, error) {
	hash, err := hashPassword(password)
	if err != nil {
		return nil, err
	}

	admin := &model.AdminUser{
		Username:     username,
		PasswordHash: hash,
		Name:         name,
		Role:         role,
	}

	if err := repository.DB.Create(admin).Error; err != nil {
		return nil, err
	}

	return admin, nil
}

func (s *AuthService) UpdateLastLogin(adminID string) {
	now := time.Now()
	repository.DB.Model(&model.AdminUser{}).Where("\"id\" = ?", adminID).
		Update("last_login_at", now)
}

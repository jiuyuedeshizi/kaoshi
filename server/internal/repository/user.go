package repository

import (
	"exam-server/internal/model"
)

type UserRepository struct{}

func (r *UserRepository) FindByID(id uint) (*model.User, error) {
	var user model.User
	result := DB.First(&user, id)
	return &user, result.Error
}

func (r *UserRepository) FindByIDCard(idCard string) (*model.User, error) {
	var user model.User
	result := DB.Where("id_card = ?", idCard).First(&user)
	return &user, result.Error
}

func (r *UserRepository) FindByPhone(phone string) (*model.User, error) {
	var user model.User
	result := DB.Where("phone = ?", phone).First(&user)
	return &user, result.Error
}

func (r *UserRepository) Create(user *model.User) error {
	return DB.Create(user).Error
}

func (r *UserRepository) Update(user *model.User) error {
	return DB.Save(user).Error
}

func (r *UserRepository) List(page, pageSize int) ([]model.User, int64, error) {
	var users []model.User
	var total int64

	DB.Model(&model.User{}).Count(&total)
	offset := (page - 1) * pageSize
	result := DB.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&users)

	return users, total, result.Error
}

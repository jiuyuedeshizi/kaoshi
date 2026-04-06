package repository

import (
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"exam-server/internal/config"
	"exam-server/internal/model"
)

var DB *gorm.DB

func Init(cfg *config.Config) error {
	var err error

	gormConfig := &gorm.Config{}
	if os.Getenv("GIN_MODE") == "release" {
		gormConfig.Logger = logger.Default.LogMode(logger.Silent)
	} else {
		gormConfig.Logger = logger.Default.LogMode(logger.Info)
	}

	DB, err = gorm.Open(postgres.Open(cfg.DatabaseURL), gormConfig)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("failed to get sql.DB: %w", err)
	}

	// 连接池配置
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	log.Println("Database connected successfully")
	return nil
}

func AutoMigrate() error {
	// 启用 UUID 扩展
	DB.Exec("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"")

	// 自动迁移
	err := DB.AutoMigrate(
		&model.ExamCategory{},
		&model.ExamProject{},
		&model.ExamNotice{},
		&model.ExamConfig{},
		&model.JobPosition{},
		&model.User{},
		&model.IdentityVerification{},
		&model.Application{},
		&model.ApplicationDocument{},
		&model.ReviewTask{},
		&model.ReviewLog{},
		&model.ExamArea{},
		&model.ExamVenue{},
		&model.ExamRoom{},
		&model.SeatAssignment{},
		&model.TicketTemplate{},
		&model.AdmissionTicket{},
		&model.ScoreRecord{},
		&model.ScoreSubject{},
		&model.AdminUser{},
		&model.AdminRole{},
		&model.PaymentOrder{},
		&model.PaymentRefund{},
		&model.LoginLog{},
		&model.OperationLog{},
	)
	if err != nil {
		return fmt.Errorf("failed to auto migrate: %w", err)
	}

	log.Println("Database migration completed")
	return nil
}

func Close() error {
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
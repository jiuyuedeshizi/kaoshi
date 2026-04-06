package main

import (
	"log"
	"os"

	"exam-server/internal/config"
	"exam-server/internal/repository"
)

func main() {
	// 加载配置
	cfg := config.Load()

	// 初始化数据库
	if err := repository.Init(cfg); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer repository.Close()

	// 执行迁移
	if os.Getenv("AUTO_MIGRATE") == "true" {
		if err := repository.AutoMigrate(); err != nil {
			log.Fatalf("Failed to migrate database: %v", err)
		}
	}

	log.Println("Server initialized successfully")
}
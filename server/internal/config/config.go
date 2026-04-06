package config

import (
	"log"
	"os"
)

type Config struct {
	ServerPort  string
	DatabaseURL string
	RedisURL    string
	JWTSecret   string
}

func Load() *Config {
	return &Config{
		ServerPort:  getEnv("SERVER_PORT", "8080"),
		DatabaseURL: getEnv("DATABASE_URL", "postgres://localhost:5432/exam?sslmode=disable"),
		RedisURL:    getEnv("REDIS_URL", "redis://localhost:6379"),
		JWTSecret:   getEnv("JWT_SECRET", ""),
	}
}

func getEnv(key, defaultValue string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return defaultValue
}

// Validate checks required configuration and should be called after Load
// In production (when running on a server), JWTSecret must be set
func (c *Config) Validate(isProduction bool) error {
	if isProduction && c.JWTSecret == "" {
		log.Fatal("JWT_SECRET environment variable must be set in production")
	}
	if c.JWTSecret == "" {
		log.Printf("WARNING: JWT_SECRET is not set. Using insecure default is not recommended for production.")
	}
	return nil
}
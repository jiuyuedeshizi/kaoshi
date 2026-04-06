package jwt

import (
	"time"

	"github.com/golang-jwt/jwt/v5"

	"exam-server/internal/config"
)

type Claims struct {
	UserID   uint   `json:"user_id"`
	UserType string `json:"user_type"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

func GenerateToken(userID uint, userType, role string, expiresIn time.Duration) (string, error) {
	cfg := config.Load()

	claims := Claims{
		UserID:   userID,
		UserType: userType,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiresIn)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(cfg.JWTSecret))
}

func GenerateCandidateToken(userID uint) (string, error) {
	return GenerateToken(userID, "candidate", "CANDIDATE", 7*24*time.Hour)
}

func GenerateAdminToken(userID uint, role string) (string, error) {
	return GenerateToken(userID, "admin", role, 24*time.Hour)
}

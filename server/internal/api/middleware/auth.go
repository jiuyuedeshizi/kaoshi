package middleware

import (
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	"exam-server/internal/config"
	jwtpkg "exam-server/internal/pkg/jwt"
	"exam-server/internal/pkg/response"
)

func JWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Unauthorized(c, "missing token")
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			response.Unauthorized(c, "invalid token format")
			c.Abort()
			return
		}

		tokenString := parts[1]
		cfg := config.Load()

		token, err := jwt.ParseWithClaims(tokenString, &jwtpkg.Claims{}, func(token *jwt.Token) (interface{}, error) {
			return []byte(cfg.JWTSecret), nil
		})

		if err != nil || !token.Valid {
			response.Unauthorized(c, "invalid token")
			c.Abort()
			return
		}

		claims, ok := token.Claims.(*jwtpkg.Claims)
		if !ok {
			response.Unauthorized(c, "invalid token claims")
			c.Abort()
			return
		}

		// 检查过期
		if claims.ExpiresAt != nil && claims.ExpiresAt.Time.Before(time.Now()) {
			response.Unauthorized(c, "token expired")
			c.Abort()
			return
		}

		// 存入上下文
		c.Set("user_id", claims.UserID)
		c.Set("user_type", claims.UserType)
		c.Set("role", claims.Role)

		c.Next()
	}
}

func RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("role")
		if !exists {
			response.Forbidden(c, "role not found")
			c.Abort()
			return
		}

		// 使用显式类型断言进行类型安全的角色比较
		userRoleStr, ok := userRole.(string)
		if !ok {
			response.Forbidden(c, "invalid role type")
			c.Abort()
			return
		}

		for _, role := range roles {
			if userRoleStr == role {
				c.Next()
				return
			}
		}

		response.Forbidden(c, "insufficient permissions")
		c.Abort()
	}
}

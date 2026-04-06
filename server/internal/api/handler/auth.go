package handler

import (
	"github.com/gin-gonic/gin"

	"exam-server/internal/pkg/response"
	"exam-server/internal/service"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler() *AuthHandler {
	return &AuthHandler{
		authService: service.NewAuthService(),
	}
}

type LoginRequest struct {
	IDCard   string `json:"id_card"`
	Password string `json:"password"`
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	authService := service.NewAuthService()
	token, user, err := authService.Login(req.IDCard, req.Password)
	if err != nil {
		response.Unauthorized(c, err.Error())
		return
	}

	response.Success(c, gin.H{
		"token": token,
		"user": gin.H{
			"id":       user.ID,
			"name":     user.Name,
			"id_card":  user.IDCard,
			"phone":    user.Phone,
		},
	})
}

type RegisterRequest struct {
	IDCard   string `json:"id_card"`
	Phone    string `json:"phone"`
	Password string `json:"password"`
	Name     string `json:"name"`
}

func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	// 验证必填字段
	if req.IDCard == "" {
		response.BadRequest(c, "身份证号不能为空")
		return
	}
	if req.Phone == "" {
		response.BadRequest(c, "手机号不能为空")
		return
	}
	if req.Password == "" {
		response.BadRequest(c, "密码不能为空")
		return
	}
	if req.Name == "" {
		response.BadRequest(c, "姓名不能为空")
		return
	}

	authService := service.NewAuthService()
	user, err := authService.Register(req.IDCard, req.Phone, req.Password, req.Name)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Created(c, gin.H{
		"id":       user.ID,
		"name":     user.Name,
		"id_card":  user.IDCard,
		"phone":    user.Phone,
	})
}

func SendSMSCode(c *gin.Context) {
	// 实现短信发送逻辑
	response.Success(c, gin.H{"message": "验证码已发送"})
}

func SMSLogin(c *gin.Context) {
	// 实现短信登录逻辑
	response.Success(c, gin.H{"token": "", "user": nil})
}

type AdminLoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func AdminLogin(c *gin.Context) {
	var req AdminLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	authService := service.NewAuthService()
	token, admin, err := authService.AdminLogin(req.Username, req.Password)
	if err != nil {
		response.Unauthorized(c, err.Error())
		return
	}

	response.Success(c, gin.H{
		"token": token,
		"user": gin.H{
			"id":   admin.ID,
			"name": admin.Name,
			"role": admin.Role,
		},
	})
}

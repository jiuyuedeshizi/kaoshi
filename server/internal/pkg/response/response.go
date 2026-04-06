package response

import (
	"github.com/gin-gonic/gin"
)

type Response struct {
	Code int         `json:"code"`
	Msg  string      `json:"message"`
	Data interface{} `json:"data,omitempty"`
}

type PageResult struct {
	Items      interface{} `json:"items"`
	Total      int64       `json:"total"`
	Page       int         `json:"page"`
	PageSize   int         `json:"page_size"`
	TotalPages int64       `json:"total_pages"`
}

func Success(c *gin.Context, data interface{}) {
	c.JSON(200, Response{
		Code: 0,
		Msg:  "success",
		Data: data,
	})
}

func Created(c *gin.Context, data interface{}) {
	c.JSON(201, Response{
		Code: 0,
		Msg:  "created",
		Data: data,
	})
}

func Page(c *gin.Context, result PageResult) {
	Success(c, result)
}

func Error(c *gin.Context, code int, msg string) {
	c.JSON(code, Response{
		Code: code,
		Msg:  msg,
	})
}

func BadRequest(c *gin.Context, msg string) {
	Error(c, 400, msg)
}

func Unauthorized(c *gin.Context, msg string) {
	Error(c, 401, msg)
}

func Forbidden(c *gin.Context, msg string) {
	Error(c, 403, msg)
}

func NotFound(c *gin.Context, msg string) {
	Error(c, 404, msg)
}

func ServerError(c *gin.Context, msg string) {
	Error(c, 500, msg)
}

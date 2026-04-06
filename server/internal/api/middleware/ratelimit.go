package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type rateLimiter struct {
	visits map[string][]time.Time
	mu     sync.RWMutex
	limit  int
	window time.Duration
}

var limiter = &rateLimiter{
	visits: make(map[string][]time.Time),
	limit:  100,
	window: time.Minute,
}

func init() {
	go limiter.cleanupExpired()
}

func (rl *rateLimiter) cleanupExpired() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		rl.mu.Lock()
		now := time.Now()
		cutoff := now.Add(-rl.window)
		for ip, visits := range rl.visits {
			var valid []time.Time
			for _, v := range visits {
				if v.After(cutoff) {
					valid = append(valid, v)
				}
			}
			if len(valid) == 0 {
				delete(rl.visits, ip)
			} else {
				rl.visits[ip] = valid
			}
		}
		rl.mu.Unlock()
	}
}

func RateLimit() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		limiter.mu.Lock()
		defer limiter.mu.Unlock()

		now := time.Now()
		visits := limiter.visits[ip]

		// 清理过期记录
		cutoff := now.Add(-limiter.window)
		var valid []time.Time
		for _, v := range visits {
			if v.After(cutoff) {
				valid = append(valid, v)
			}
		}

		if len(valid) >= limiter.limit {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"code":    429,
				"message": "请求过于频繁，请稍后再试",
			})
			c.Abort()
			return
		}

		limiter.visits[ip] = append(valid, now)
		c.Next()
	}
}

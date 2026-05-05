package config

import (
	"os"
	"strconv"
)

type Config struct {
	RedisURL          string
	DatabaseURL       string
	ProblemServiceURL string
	InternalAPIKey    string
	NumWorkers        int
	SandboxDir        string
	IsolateBin        string
}

func Load() *Config {
	numWorkers, _ := strconv.Atoi(getEnv("NUM_WORKERS", "0"))
	return &Config{
		RedisURL:          getEnv("REDIS_URL", "redis://localhost:6379"),
		DatabaseURL:       getEnv("DATABASE_URL", ""),
		ProblemServiceURL: getEnv("PROBLEM_SERVICE_URL", "http://localhost:4003"),
		InternalAPIKey:    getEnv("INTERNAL_API_KEY", "dev-internal-key"),
		NumWorkers:        numWorkers,
		SandboxDir:        getEnv("SANDBOX_DIR", "/tmp/judge"),
		IsolateBin:        getEnv("ISOLATE_BIN", "/usr/local/bin/isolate"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

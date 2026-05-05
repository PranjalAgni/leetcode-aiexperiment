package main

import (
	"context"
	"os"
	"os/signal"
	"runtime"
	"syscall"

	"github.com/algoarena/judge-service/internal/config"
	"github.com/algoarena/judge-service/internal/worker"
	"go.uber.org/zap"
)

func main() {
	logger, _ := zap.NewProduction()
	defer logger.Sync() //nolint:errcheck

	cfg := config.Load()

	numWorkers := cfg.NumWorkers
	if numWorkers == 0 {
		numWorkers = runtime.NumCPU() * 2
	}

	logger.Info("Starting judge service",
		zap.Int("workers", numWorkers),
		zap.String("redis_url", cfg.RedisURL),
	)

	pool := worker.NewPool(cfg, logger, numWorkers)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go pool.Start(ctx)

	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)
	<-sig

	logger.Info("Shutting down gracefully...")
	cancel()
	pool.Wait()
}

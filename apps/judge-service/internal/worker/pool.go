package worker

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"

	"github.com/algoarena/judge-service/internal/config"
	"github.com/algoarena/judge-service/internal/judge"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

type JobData struct {
	SubmissionID string `json:"submissionId"`
	UserID       string `json:"userId"`
	ProblemID    string `json:"problemId"`
	ContestID    string `json:"contestId"`
	Language     string `json:"language"`
	Code         string `json:"code"`
	TimeLimitMs  int    `json:"timeLimitMs"`
	MemLimitMb   int    `json:"memoryLimitMb"`
}

type Pool struct {
	cfg        *config.Config
	judge      *judge.Judge
	rdb        *redis.Client
	numWorkers int
	logger     *zap.Logger
	wg         sync.WaitGroup
}

func NewPool(cfg *config.Config, logger *zap.Logger, numWorkers int) *Pool {
	opt, _ := redis.ParseURL(cfg.RedisURL)
	rdb := redis.NewClient(opt)

	return &Pool{
		cfg:        cfg,
		judge:      judge.New(cfg, logger),
		rdb:        rdb,
		numWorkers: numWorkers,
		logger:     logger,
	}
}

func (p *Pool) Start(ctx context.Context) {
	for i := 0; i < p.numWorkers; i++ {
		p.wg.Add(1)
		go p.worker(ctx)
	}
	p.wg.Wait()
}

func (p *Pool) Wait() {
	p.wg.Wait()
}

func (p *Pool) worker(ctx context.Context) {
	defer p.wg.Done()
	for {
		select {
		case <-ctx.Done():
			return
		default:
		}

		// BullMQ stores jobs in Redis sorted set / list format
		// Pull from the "bull:judge:wait" list (BullMQ format)
		result, err := p.rdb.BLPop(ctx, 0, "bull:judge:wait").Result()
		if err != nil {
			if ctx.Err() != nil {
				return
			}
			p.logger.Error("Failed to dequeue job", zap.Error(err))
			continue
		}

		if len(result) < 2 {
			continue
		}

		jobID := result[1]
		p.processJob(ctx, jobID)
	}
}

func (p *Pool) processJob(ctx context.Context, jobID string) {
	// Fetch job data from Redis hash
	jobKey := fmt.Sprintf("bull:judge:%s", jobID)
	data, err := p.rdb.HGet(ctx, jobKey, "data").Result()
	if err != nil {
		p.logger.Error("Failed to fetch job data", zap.String("jobID", jobID), zap.Error(err))
		return
	}

	var job JobData
	if err := json.Unmarshal([]byte(data), &job); err != nil {
		p.logger.Error("Failed to parse job data", zap.String("jobID", jobID), zap.Error(err))
		return
	}

	p.logger.Info("Processing submission",
		zap.String("submissionId", job.SubmissionID),
		zap.String("language", job.Language),
	)

	// Fetch test cases from problem service
	testCases, err := p.fetchTestCases(ctx, job.ProblemID)
	if err != nil {
		p.logger.Error("Failed to fetch test cases", zap.Error(err))
		p.publishResult(ctx, job.SubmissionID, &judge.JudgeResult{Verdict: judge.SystemError})
		return
	}

	result := p.judge.Run(judge.JudgeRequest{
		SubmissionID: job.SubmissionID,
		Language:     job.Language,
		Code:         job.Code,
		TestCases:    testCases,
		TimeLimitMs:  job.TimeLimitMs,
		MemLimitMb:   job.MemLimitMb,
	})

	p.publishResult(ctx, job.SubmissionID, result)

	p.logger.Info("Submission judged",
		zap.String("submissionId", job.SubmissionID),
		zap.String("verdict", string(result.Verdict)),
		zap.Int("runtimeMs", result.RuntimeMs),
	)
}

func (p *Pool) fetchTestCases(ctx context.Context, problemID string) ([]judge.TestCase, error) {
	// Call problem service internal API
	url := fmt.Sprintf("%s/problems/by-id/%s/test-cases", p.cfg.ProblemServiceURL, problemID)

	type TestCaseResponse struct {
		TestCases []struct {
			Input          string `json:"input"`
			ExpectedOutput string `json:"expectedOutput"`
		} `json:"testCases"`
	}

	// Use net/http directly (no external deps)
	resp, err := httpGetWithKey(ctx, url, p.cfg.InternalAPIKey)
	if err != nil {
		return nil, err
	}

	var response TestCaseResponse
	if err := json.Unmarshal(resp, &response); err != nil {
		return nil, err
	}

	testCases := make([]judge.TestCase, len(response.TestCases))
	for i, tc := range response.TestCases {
		testCases[i] = judge.TestCase{
			Input:          tc.Input,
			ExpectedOutput: tc.ExpectedOutput,
		}
	}
	return testCases, nil
}

type resultPayload struct {
	SubmissionID    string                `json:"submissionId"`
	Verdict         string                `json:"verdict"`
	RuntimeMs       int                   `json:"runtimeMs"`
	MemoryMb        int                   `json:"memoryMb"`
	TestCasesPassed int                   `json:"testCasesPassed"`
	TotalTestCases  int                   `json:"totalTestCases"`
	ErrorMessage    string                `json:"errorMessage"`
	FailingTestCase *judge.FailingTestCase `json:"failingTestCase"`
}

func (p *Pool) publishResult(ctx context.Context, submissionID string, result *judge.JudgeResult) {
	payload := resultPayload{
		SubmissionID:    submissionID,
		Verdict:         string(result.Verdict),
		RuntimeMs:       result.RuntimeMs,
		MemoryMb:        result.MemoryMb,
		TestCasesPassed: result.TestCasesPassed,
		TotalTestCases:  result.TotalTestCases,
		ErrorMessage:    result.ErrorMessage,
		FailingTestCase: result.FailingTestCase,
	}

	data, _ := json.Marshal(payload)
	channel := fmt.Sprintf("submission:result:%s", submissionID)
	p.rdb.Publish(ctx, channel, string(data)) //nolint:errcheck
}

package judge

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"sync/atomic"

	"github.com/algoarena/judge-service/internal/config"
	"github.com/algoarena/judge-service/internal/languages"
	"github.com/algoarena/judge-service/internal/sandbox"
	"go.uber.org/zap"
)

type Verdict string

const (
	Accepted            Verdict = "accepted"
	WrongAnswer         Verdict = "wrong_answer"
	TimeLimitExceeded   Verdict = "time_limit_exceeded"
	MemoryLimitExceeded Verdict = "memory_limit_exceeded"
	RuntimeError        Verdict = "runtime_error"
	CompileError        Verdict = "compile_error"
	SystemError         Verdict = "system_error"
)

type TestCase struct {
	Input          string
	ExpectedOutput string
}

type JudgeRequest struct {
	SubmissionID string
	Language     string
	Code         string
	TestCases    []TestCase
	TimeLimitMs  int
	MemLimitMb   int
}

type FailingTestCase struct {
	Input          string `json:"input"`
	ExpectedOutput string `json:"expectedOutput"`
	ActualOutput   string `json:"actualOutput"`
}

type JudgeResult struct {
	Verdict         Verdict
	RuntimeMs       int
	MemoryMb        int
	TestCasesPassed int
	TotalTestCases  int
	ErrorMessage    string
	FailingTestCase *FailingTestCase
}

var boxCounter atomic.Int32

type Judge struct {
	cfg     *config.Config
	isolate *sandbox.Isolate
	logger  *zap.Logger
}

func New(cfg *config.Config, logger *zap.Logger) *Judge {
	return &Judge{
		cfg:     cfg,
		isolate: sandbox.New(cfg.IsolateBin),
		logger:  logger,
	}
}

func (j *Judge) Run(req JudgeRequest) *JudgeResult {
	lang, err := languages.Get(req.Language)
	if err != nil {
		return &JudgeResult{Verdict: SystemError, ErrorMessage: err.Error()}
	}

	workDir := filepath.Join(j.cfg.SandboxDir, req.SubmissionID)
	if err := os.MkdirAll(workDir, 0700); err != nil {
		return &JudgeResult{Verdict: SystemError, ErrorMessage: "failed to create work dir"}
	}
	defer os.RemoveAll(workDir)

	sourceFile := filepath.Join(workDir, "solution."+lang.FileExt)
	if err := os.WriteFile(sourceFile, []byte(req.Code), 0600); err != nil {
		return &JudgeResult{Verdict: SystemError, ErrorMessage: "failed to write source"}
	}

	binaryFile := filepath.Join(workDir, "solution")
	if lang.CompileCmd != nil {
		compileCmd := resolveCmd(lang.CompileCmd, sourceFile, binaryFile)
		out, compileErr := runCompile(compileCmd, workDir)
		if compileErr != nil {
			return &JudgeResult{Verdict: CompileError, ErrorMessage: out}
		}
	}

	runCmd := resolveCmd(lang.RunCmd, sourceFile, binaryFile)
	effectiveTimeLimitMs := int(float64(req.TimeLimitMs) * lang.TimeFactor)
	memLimitKB := req.MemLimitMb * 1024

	type tcResult struct {
		idx    int
		passed bool
		result *sandbox.RunResult
	}

	results := make([]tcResult, len(req.TestCases))
	var firstFailure *tcResult
	var mu sync.Mutex
	var wg sync.WaitGroup
	sem := make(chan struct{}, 4)

	for i, tc := range req.TestCases {
		wg.Add(1)
		go func(idx int, testCase TestCase) {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()

			boxID := int(boxCounter.Add(1)) % 1000
			_, initErr := j.isolate.Init(boxID)
			if initErr != nil {
				mu.Lock()
				results[idx] = tcResult{idx: idx, passed: false}
				mu.Unlock()
				return
			}
			defer j.isolate.Cleanup(boxID)

			runResult, runErr := j.isolate.Run(sandbox.RunRequest{
				BoxID:       boxID,
				Command:     runCmd,
				Stdin:       testCase.Input,
				TimeLimitMs: effectiveTimeLimitMs,
				MemLimitKB:  memLimitKB,
			})

			if runErr != nil {
				mu.Lock()
				results[idx] = tcResult{idx: idx, passed: false, result: runResult}
				mu.Unlock()
				return
			}

			passed := normalizeOutput(runResult.Stdout) == normalizeOutput(testCase.ExpectedOutput)
			mu.Lock()
			results[idx] = tcResult{idx: idx, passed: passed, result: runResult}
			if !passed && firstFailure == nil {
				f := results[idx]
				firstFailure = &f
			}
			mu.Unlock()
		}(i, tc)
	}
	wg.Wait()

	passed := 0
	maxRuntime := 0
	maxMemory := 0

	for _, r := range results {
		if r.passed {
			passed++
		}
		if r.result != nil {
			if r.result.RuntimeMs > maxRuntime {
				maxRuntime = r.result.RuntimeMs
			}
			if r.result.MemoryKB/1024 > maxMemory {
				maxMemory = r.result.MemoryKB / 1024
			}
		}
	}

	if firstFailure != nil && firstFailure.result != nil {
		r := firstFailure.result
		verdict := determineVerdict(r)
		tc := req.TestCases[firstFailure.idx]
		return &JudgeResult{
			Verdict:         verdict,
			RuntimeMs:       maxRuntime,
			MemoryMb:        maxMemory,
			TestCasesPassed: passed,
			TotalTestCases:  len(req.TestCases),
			ErrorMessage:    r.Stderr,
			FailingTestCase: &FailingTestCase{
				Input:          tc.Input,
				ExpectedOutput: tc.ExpectedOutput,
				ActualOutput:   r.Stdout,
			},
		}
	}

	return &JudgeResult{
		Verdict:         Accepted,
		RuntimeMs:       maxRuntime,
		MemoryMb:        maxMemory,
		TestCasesPassed: passed,
		TotalTestCases:  len(req.TestCases),
	}
}

func determineVerdict(r *sandbox.RunResult) Verdict {
	switch r.Status {
	case "TO":
		return TimeLimitExceeded
	case "ML":
		return MemoryLimitExceeded
	case "RE", "SG":
		return RuntimeError
	}
	if r.ExitCode != 0 {
		return RuntimeError
	}
	return WrongAnswer
}

func normalizeOutput(s string) string {
	return strings.TrimRight(s, "\n\r ")
}

func resolveCmd(template []string, sourceFile, binaryFile string) []string {
	result := make([]string, len(template))
	for i, part := range template {
		part = strings.ReplaceAll(part, languages.SOURCE_FILE, sourceFile)
		part = strings.ReplaceAll(part, languages.BINARY_FILE, binaryFile)
		result[i] = part
	}
	return result
}

// runCompile uses exec.Command (execFile-style, no shell) for security.
func runCompile(cmd []string, workDir string) (string, error) {
	if len(cmd) == 0 {
		return "", fmt.Errorf("empty compile command")
	}
	c := exec.Command(cmd[0], cmd[1:]...) //nolint:gosec — cmd comes from our own registry, never user input
	c.Dir = workDir
	out, err := c.CombinedOutput()
	return string(out), err
}

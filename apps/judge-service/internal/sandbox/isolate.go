package sandbox

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

type RunRequest struct {
	BoxID       int
	SourceFile  string
	Command     []string
	Stdin       string
	TimeLimitMs int
	MemLimitKB  int
}

type RunResult struct {
	Stdout    string
	Stderr    string
	ExitCode  int
	RuntimeMs int
	MemoryKB  int
	Killed    bool // TLE or MLE caused kill
	Status    string // isolate meta status field
}

type Isolate struct {
	BinPath string
}

func New(binPath string) *Isolate {
	return &Isolate{BinPath: binPath}
}

// Init initializes a sandbox box. Must be called before Run.
func (iso *Isolate) Init(boxID int) (string, error) {
	out, err := execCommand(iso.BinPath, "--box-id="+strconv.Itoa(boxID), "--init")
	if err != nil {
		return "", fmt.Errorf("isolate init: %w, output: %s", err, out)
	}
	return strings.TrimSpace(out), nil
}

// Cleanup removes the sandbox box. Must be called after Run.
func (iso *Isolate) Cleanup(boxID int) {
	execCommand(iso.BinPath, "--box-id="+strconv.Itoa(boxID), "--cleanup") //nolint:errcheck
}

// Run executes a command inside the isolate sandbox.
func (iso *Isolate) Run(req RunRequest) (*RunResult, error) {
	metaFile := filepath.Join(os.TempDir(), fmt.Sprintf("meta_%d_%d.txt", req.BoxID, time.Now().UnixNano()))
	defer os.Remove(metaFile)

	wallTimeMs := req.TimeLimitMs * 2
	if wallTimeMs < 10000 {
		wallTimeMs = 10000
	}

	args := []string{
		fmt.Sprintf("--box-id=%d", req.BoxID),
		fmt.Sprintf("--time=%.3f", float64(req.TimeLimitMs)/1000.0),
		fmt.Sprintf("--wall-time=%.3f", float64(wallTimeMs)/1000.0),
		fmt.Sprintf("--mem=%d", req.MemLimitKB),
		"--fsize=65536",
		"--processes=1",
		fmt.Sprintf("--meta=%s", metaFile),
		"--stdin=/dev/stdin",
		"--stdout=/dev/stdout",
		"--stderr=/dev/stderr",
		"--run",
		"--",
	}
	args = append(args, req.Command...)

	cmd := exec.Command(iso.BinPath, args...)
	cmd.Stdin = strings.NewReader(req.Stdin)

	var stdout, stderr strings.Builder
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	runErr := cmd.Run()
	exitCode := 0
	if runErr != nil {
		if exitErr, ok := runErr.(*exec.ExitError); ok {
			exitCode = exitErr.ExitCode()
		}
	}

	meta := parseMeta(metaFile)

	result := &RunResult{
		Stdout:    stdout.String(),
		Stderr:    stderr.String(),
		ExitCode:  exitCode,
		RuntimeMs: int(parseMetaFloat(meta, "time") * 1000),
		MemoryKB:  parseMetaInt(meta, "max-rss"),
		Status:    meta["status"],
		Killed:    meta["status"] == "TO" || meta["status"] == "ML",
	}

	return result, nil
}

func parseMeta(path string) map[string]string {
	data, err := os.ReadFile(path)
	if err != nil {
		return map[string]string{}
	}
	meta := map[string]string{}
	for _, line := range strings.Split(string(data), "\n") {
		parts := strings.SplitN(line, ":", 2)
		if len(parts) == 2 {
			meta[strings.TrimSpace(parts[0])] = strings.TrimSpace(parts[1])
		}
	}
	return meta
}

func parseMetaFloat(meta map[string]string, key string) float64 {
	v, _ := strconv.ParseFloat(meta[key], 64)
	return v
}

func parseMetaInt(meta map[string]string, key string) int {
	v, _ := strconv.Atoi(meta[key])
	return v
}

func execCommand(name string, args ...string) (string, error) {
	cmd := exec.Command(name, args...)
	out, err := cmd.CombinedOutput()
	return string(out), err
}

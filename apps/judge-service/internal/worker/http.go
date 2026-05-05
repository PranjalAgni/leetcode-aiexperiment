package worker

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"time"
)

var httpClient = &http.Client{Timeout: 10 * time.Second}

func httpGetWithKey(ctx context.Context, url, apiKey string) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("x-internal-key", apiKey)

	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("problem service returned %d", resp.StatusCode)
	}

	return io.ReadAll(io.LimitReader(resp.Body, 10*1024*1024)) // max 10MB
}

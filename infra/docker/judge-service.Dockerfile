FROM golang:1.23-bookworm AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/judge-service ./cmd/judge

# ─── Runtime stage ─────────────────────────────────────────────────────────────

FROM debian:bookworm-slim

# Install isolate dependencies and language runtimes
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcap-dev \
    git \
    make \
    gcc \
    # Language runtimes
    python3 \
    python3-pip \
    nodejs \
    npm \
    openjdk-21-jdk \
    g++ \
    golang-go \
    # Rust is installed via rustup
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install TypeScript
RUN npm install -g typescript ts-node

# Build and install isolate from source
RUN git clone https://github.com/ioi/isolate.git /tmp/isolate && \
    cd /tmp/isolate && \
    make install && \
    rm -rf /tmp/isolate

# Create sandbox directory
RUN mkdir -p /tmp/judge

COPY --from=builder /bin/judge-service /usr/local/bin/judge-service

CMD ["judge-service"]

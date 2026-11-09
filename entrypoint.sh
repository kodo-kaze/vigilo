#!/bin/bash
set -e

echo "=========================================================="
echo " VIGILO — ALL-IN-ONE CROWD INTELLIGENCE CONTAINER"
echo "=========================================================="
echo " Starting Python AI Engine (FastAPI on port 8000)..."
echo " Starting Next.js Web UI (Port 3000)..."
echo " Ingest Source: ${CROWD_STREAM_SOURCE:-0}"
echo "=========================================================="

# Graceful termination handler for container stops (SIGTERM / SIGINT)
cleanup() {
    echo "[Vigilo Container] Received stop signal, shutting down services..."
    if [ -n "$PYTHON_PID" ]; then
        kill -TERM "$PYTHON_PID" 2>/dev/null || true
    fi
    if [ -n "$NODE_PID" ]; then
        kill -TERM "$NODE_PID" 2>/dev/null || true
    fi
    wait "$PYTHON_PID" "$NODE_PID" 2>/dev/null || true
    exit 0
}
trap cleanup SIGTERM SIGINT

# 1. Start Python FastAPI AI Stream Server in background
cd /app/backend
python main.py \
    --host 0.0.0.0 \
    --port 8000 \
    --source "${CROWD_STREAM_SOURCE:-0}" &
PYTHON_PID=$!

# 2. Start Next.js Standalone Server in background
cd /app
node server.js &
NODE_PID=$!

echo "[Vigilo Container] Both services are running."
echo " - Next.js UI & Unified API: http://localhost:3000"
echo " - Direct FastAPI Backend  : http://localhost:8000"

# Monitor both child processes. If either terminates, shut down cleanly
wait -n "$PYTHON_PID" "$NODE_PID"

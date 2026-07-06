#!/bin/bash
# =====================
# Start Python AI Service
# =====================
echo "================================="
echo "  Starting Python AI Service"
echo "================================="

# Defaults
export PORT=${PORT:-8000}
export HOST=${HOST:-0.0.0.0}

echo "Port: $PORT"
echo "Host: $HOST"

cd ai-service
uvicorn app:app --host $HOST --port $PORT --workers 1
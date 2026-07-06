#!/bin/bash
# =====================
# Start Node.js API Service
# =====================
echo "================================="
echo "  Starting Node.js API Service"
echo "================================="

# Load .env if exists
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Defaults
export PORT=${PORT:-3000}
export HOST=${HOST:-0.0.0.0}
export NODE_ENV=${NODE_ENV:-production}

echo "Port: $PORT"
echo "Host: $HOST"
echo "Mode: $NODE_ENV"

node src/server.js
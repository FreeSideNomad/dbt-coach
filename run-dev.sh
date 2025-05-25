#!/bin/bash
# Run both backend and frontend in debug/dev mode from the root directory
set -e

# Start backend in background using .venv
(
  cd backend
  if [ -d ".venv" ]; then
    source .venv/bin/activate
  fi
  ./run-backend.sh &
)

# Start frontend in foreground
cd frontend
npx ng serve --host 0.0.0.0 --proxy-config proxy.conf.json


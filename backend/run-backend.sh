#!/bin/bash
# Run this script to set up a Python virtual environment and start the FastAPI backend
set -e

VENV_DIR=".venv"
REQ_FILE="requirements.txt"
APP_MODULE="app.main:app"

# Create virtual environment if it doesn't exist
if [ ! -d "$VENV_DIR" ]; then
  echo "Creating virtual environment..."
  python3 -m venv "$VENV_DIR"
fi

# Activate virtual environment
source "$VENV_DIR/bin/activate"

# Upgrade pip
pip install --upgrade pip

# Install requirements if needed
pip install -r "$REQ_FILE"

# Run FastAPI backend with uvicorn
exec uvicorn "$APP_MODULE" --reload

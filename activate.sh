#!/bin/bash

# Colors for better readability
GREEN="\033[0;32m"
BLUE="\033[0;34m"
NC="\033[0m" # No Color

# Stop script on errors
set -e

# Define ports
FRONTEND_PORT=3000
BACKEND_PORT=5000

echo -e "${GREEN}===== Setting up and running the application =====${NC}"

# Load nvm (try different common locations)
if [ -f "$HOME/.nvm/nvm.sh" ]; then
    source "$HOME/.nvm/nvm.sh"
elif [ -f "$NVM_DIR/nvm.sh" ]; then
    source "$NVM_DIR/nvm.sh"
elif [ -f "/usr/local/opt/nvm/nvm.sh" ]; then
    source "/usr/local/opt/nvm/nvm.sh"
else
    echo "Error: Cannot find nvm. Please make sure nvm is installed."
    exit 1
fi

# Frontend setup
echo -e "${BLUE}===== Setting up frontend =====${NC}"
cd "$(dirname "$0")/frontend"
echo "Using Node.js version 20..."
nvm use 20
echo "Installing frontend dependencies..."
npm install --legacy-peer-deps

# Start frontend in background
echo "Starting frontend server on port $FRONTEND_PORT..."
npm run dev -- --port $FRONTEND_PORT &
FRONTEND_PID=$!

# Backend setup
echo -e "${BLUE}\n===== Setting up backend =====${NC}"
cd "$(dirname "$0")/backend"
echo "Installing backend dependencies..."
pip install -r requirements.txt

# Start backend
echo "Starting backend server on port $BACKEND_PORT..."
python test.py

# This will only execute if the backend server exits
kill $FRONTEND_PID
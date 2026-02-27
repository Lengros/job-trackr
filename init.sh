#!/usr/bin/env bash
set -e

echo "========================================"
echo "  JobTrackr - Development Setup"
echo "========================================"
echo ""

# Check Node.js is available
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "ERROR: Node.js 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install
echo ""

# Start development server
echo "Starting development server..."
echo ""
echo "========================================"
echo "  App running at: http://localhost:5173"
echo "========================================"
echo ""
echo "  - Mobile-first prototype for field service workers"
echo "  - Open in browser (375px viewport recommended)"
echo "  - Press Ctrl+C to stop the server"
echo ""

npm run dev

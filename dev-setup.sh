#!/bin/bash

# Multimodal Content Generator - Development Setup Script
# This script sets up the complete development environment

echo "🚀 Setting up Multimodal Content Generator..."

# Copy environment variables if .env doesn't exist
if [ ! -f .env ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "✅ Environment file created. Please update with your API keys."
else
    echo "✅ Environment file already exists."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if both servers can run
echo "🔧 Checking server configurations..."

# Test if the React app builds
echo "🏗️  Testing React build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ React app builds successfully"
else
    echo "❌ React app build failed"
    exit 1
fi

# Start both servers
echo "🌐 Starting development servers..."
echo "📡 Mock API Server will run on http://localhost:3001"
echo "⚛️  React App will run on http://localhost:8081"

# Function to clean up background processes
cleanup() {
    echo "🛑 Stopping servers..."
    pkill -f "node server.js" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    echo "✅ Cleanup complete"
}

# Set up signal handlers
trap cleanup EXIT INT TERM

# Start mock API server in background
echo "Starting mock API server..."
node server.js &
API_PID=$!

# Wait a moment for API server to start
sleep 2

# Check if API server is running
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Mock API server is running"
else
    echo "❌ Mock API server failed to start"
    exit 1
fi

# Start React development server
echo "Starting React development server..."
npm run dev

# The script will continue running until interrupted
wait

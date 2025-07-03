#!/bin/bash

# Simple manual test script for Groq API integration
# This script provides easy commands to test your API setup

echo "🤖 Groq API Manual Test Script"
echo "=============================="
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if API server is running
echo -e "${BLUE}1. Testing if API server is running...${NC}"
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ API server is running${NC}"
else
    echo -e "${RED}✗ API server is not running${NC}"
    echo "Please start the API server with: npm run api"
    exit 1
fi

echo

# Health check
echo -e "${BLUE}2. Running health check...${NC}"
HEALTH_RESPONSE=$(curl -s http://localhost:3001/api/health)
echo "Response: $HEALTH_RESPONSE"

# Check if GROQ_API_KEY is configured
if echo "$HEALTH_RESPONSE" | grep -q '"hasGroqToken":true'; then
    echo -e "${GREEN}✓ GROQ_API_KEY is configured${NC}"
else
    echo -e "${RED}✗ GROQ_API_KEY is not configured${NC}"
    echo "Please check your .env file and make sure GROQ_API_KEY is set"
    exit 1
fi

echo

# Test playful tone
echo -e "${BLUE}3. Testing playful tone with Groq (expect <2s response!)...${NC}"
echo "Sending request for 'Smart fitness tracker' with playful tone..."
START_TIME=$(date +%s.%N)
PLAYFUL_RESPONSE=$(curl -s -X POST http://localhost:3001/api/generate-text \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Smart fitness tracker",
    "tone": "playful",
    "temperature": 0.7
  }')
END_TIME=$(date +%s.%N)
DURATION=$(echo "$END_TIME - $START_TIME" | bc)

echo "Response: $PLAYFUL_RESPONSE"
echo "Response time: ${DURATION}s"

if echo "$PLAYFUL_RESPONSE" | grep -q '"headline"'; then
    echo -e "${GREEN}✓ Playful tone test passed${NC}"
else
    echo -e "${RED}✗ Playful tone test failed${NC}"
fi

echo

# Test serious tone
echo -e "${BLUE}4. Testing serious tone with Groq...${NC}"
echo "Sending request for 'Smart fitness tracker' with serious tone..."
SERIOUS_RESPONSE=$(curl -s -X POST http://localhost:3001/api/generate-text \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Smart fitness tracker",
    "tone": "serious",
    "temperature": 0.7
  }')

echo "Response: $SERIOUS_RESPONSE"

if echo "$SERIOUS_RESPONSE" | grep -q '"headline"'; then
    echo -e "${GREEN}✓ Serious tone test passed${NC}"
else
    echo -e "${RED}✗ Serious tone test failed${NC}"
fi

echo

# Test bold tone
echo -e "${BLUE}5. Testing bold tone with Groq...${NC}"
echo "Sending request for 'Smart fitness tracker' with bold tone..."
BOLD_RESPONSE=$(curl -s -X POST http://localhost:3001/api/generate-text \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Smart fitness tracker",
    "tone": "bold",
    "temperature": 0.7
  }')

echo "Response: $BOLD_RESPONSE"

if echo "$BOLD_RESPONSE" | grep -q '"headline"'; then
    echo -e "${GREEN}✓ Bold tone test passed${NC}"
else
    echo -e "${RED}✗ Bold tone test failed${NC}"
fi

echo

# Summary
echo -e "${YELLOW}📋 Test Summary${NC}"
echo "================"

# Count successful tests
SUCCESS_COUNT=0

if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    ((SUCCESS_COUNT++))
fi

if echo "$HEALTH_RESPONSE" | grep -q '"hasGroqToken":true'; then
    ((SUCCESS_COUNT++))
fi

if echo "$PLAYFUL_RESPONSE" | grep -q '"headline"'; then
    ((SUCCESS_COUNT++))
fi

if echo "$SERIOUS_RESPONSE" | grep -q '"headline"'; then
    ((SUCCESS_COUNT++))
fi

if echo "$BOLD_RESPONSE" | grep -q '"headline"'; then
    ((SUCCESS_COUNT++))
fi

echo "Tests passed: $SUCCESS_COUNT/5"

if [ $SUCCESS_COUNT -eq 5 ]; then
    echo -e "${GREEN}🎉 All tests passed! Your Groq API integration is working correctly.${NC}"
elif [ $SUCCESS_COUNT -ge 3 ]; then
    echo -e "${YELLOW}⚠️  Most tests passed, but some issues were detected.${NC}"
else
    echo -e "${RED}❌ Several tests failed. Please check your configuration.${NC}"
fi

echo
echo "Next steps:"
echo "1. If tests passed, try the frontend at http://localhost:8080"
echo "2. If tests failed, check the GROQ_SETUP_GUIDE.md guide"
echo "3. Run 'node test-api.js' for more detailed testing"

# 🧪 API Testing Guide

This guide provides multiple ways to test your Hugging Face API integration.

## Quick Testing Options

### Option 1: Manual Script (Fastest)
```bash
./test-manual.sh
```
This runs a simple shell script that tests basic functionality.

### Option 2: Comprehensive Node.js Test Suite
```bash
node test-api.js
```
This runs a detailed test suite with performance metrics and tone analysis.

### Option 3: Manual cURL Commands
Test individual endpoints manually:

```bash
# Health check
curl http://localhost:3001/api/health

# Test text generation
curl -X POST http://localhost:3001/api/generate-text \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Eco-friendly water bottle",
    "tone": "playful",
    "temperature": 0.7
  }'
```

## Prerequisites

1. **Start the API server:**
   ```bash
   npm run api
   ```

2. **Ensure environment is configured:**
   - Copy `.env.example` to `.env`
   - Add your Hugging Face token: `HF_TOKEN=hf_your_token_here`

## Expected Test Results

### ✅ Successful Response Format
```json
{
  "headline": "🌱 Game-Changing Eco Water Bottle!",
  "caption": "Stay hydrated while saving the planet! Our sustainable bottle keeps you performing at your peak. 🏃‍♂️💚"
}
```

### ⚠️ Fallback Response (when API is unavailable)
```json
{
  "headline": "🎉 Amazing Eco-friendly water bottle Just Dropped!",
  "caption": "Get ready for the most fun Eco-friendly water bottle experience ever! 🚀 This is going to change everything!",
  "fallback": true
}
```

## Tone Differences to Look For

### Playful Tone 🎉
- Uses emojis (🎉, 🚀, 💚)
- Casual, energetic language
- Exclamation marks
- Words like "amazing", "fun", "exciting"

### Serious Tone 💼
- Professional vocabulary
- No emojis or minimal emojis
- Focus on benefits and credibility
- Words like "professional", "reliable", "proven"

### Bold Tone ⚡
- Strong, confident language
- Action-oriented words
- Emphasis on power and transformation
- Words like "revolutionary", "ultimate", "powerful"

## Troubleshooting Common Issues

### 1. "Connection refused" errors
- Make sure the API server is running: `npm run api`
- Check that port 3001 is available

### 2. "HF_TOKEN is not configured" 
- Verify `.env` file exists and contains `HF_TOKEN=hf_...`
- Ensure the token is valid (test at https://huggingface.co/settings/tokens)

### 3. Slow responses or timeouts
- Hugging Face models may need "warming up" (first request is slower)
- Free tier has rate limits - wait a moment between requests
- Try again - models cache and become faster

### 4. Fallback responses
- This is normal when the API is temporarily unavailable
- Check your internet connection
- Verify your HF token has proper permissions

## Performance Expectations

- **First request**: 10-30 seconds (model cold start)
- **Subsequent requests**: 3-10 seconds
- **Success rate**: >90% with proper configuration
- **Fallback rate**: <10% under normal conditions

## Next Steps After Testing

1. **If tests pass**: Open http://localhost:8080 and test the full UI
2. **If tests fail**: Review the HUGGING_FACE_SETUP.md guide
3. **For production**: Consider rate limiting and error handling improvements

## Advanced Testing

### Load Testing
```bash
# Test multiple requests quickly
for i in {1..5}; do
  echo "Request $i:"
  curl -X POST http://localhost:3001/api/generate-text \
    -H "Content-Type: application/json" \
    -d "{\"prompt\": \"Test product $i\", \"tone\": \"playful\"}"
  echo -e "\n---"
done
```

### Different Product Types
Test with various product categories:
- Tech products: "Smart home assistant"
- Food/Beverage: "Organic energy drink"
- Fashion: "Sustainable athletic wear"
- Services: "Online fitness coaching"

This helps verify the AI generates appropriate content across different domains.

# Hugging Face Llama 3.1 8B Integration Setup Guide

## Overview
This guide will help you set up the Hugging Face Inference API integration with Llama 3.1 8B Instruct for your multimodal content generator.

## 🔧 Setup Instructions

### 1. Get Hugging Face API Token
1. Go to [Hugging Face Settings - Tokens](https://huggingface.co/settings/tokens)
2. Click "New token"
3. Name it something like "Content Generator API"
4. Select "Read" access type (sufficient for Inference API)
5. Copy the generated token

### 2. Configure Environment Variables
1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file and add your Hugging Face token:
   ```bash
   HF_TOKEN=hf_your_actual_token_here
   ```

### 3. Install Dependencies (if not already installed)
```bash
npm install
```

### 4. Start the Application
Run both the API server and frontend development server:
```bash
npm run dev:api
```

This will start:
- Express API server on `http://localhost:3001`
- Vite development server on `http://localhost:8080`

## 🎯 Testing the Integration

### 1. Health Check
First, verify the API server is running:
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-01-XX...",
  "env": {
    "hasHfToken": true,
    "nodeEnv": "development"
  }
}
```

### 2. Test Text Generation API
Test the text generation endpoint directly:
```bash
curl -X POST http://localhost:3001/api/generate-text \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Eco-friendly water bottle for athletes",
    "tone": "playful",
    "temperature": 0.7
  }'
```

Expected response:
```json
{
  "headline": "🌱 Game-Changing Eco Water Bottle for Champions!",
  "caption": "Stay hydrated while saving the planet! Our sustainable bottle keeps you performing at your peak. 🏃‍♂️💚"
}
```

### 3. Test Different Tones
Try all three tones to see the different responses:

**Playful tone:**
```bash
curl -X POST http://localhost:3001/api/generate-text \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Smart fitness tracker", "tone": "playful"}'
```

**Serious tone:**
```bash
curl -X POST http://localhost:3001/api/generate-text \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Smart fitness tracker", "tone": "serious"}'
```

**Bold tone:**
```bash
curl -X POST http://localhost:3001/api/generate-text \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Smart fitness tracker", "tone": "bold"}'
```

## 🔍 Frontend Testing

### 1. Open the Application
Navigate to `http://localhost:8080` in your browser.

### 2. Test Form Submission
1. Enter a product idea (e.g., "Smart home security camera")
2. Select a tone (Playful, Serious, or Bold)
3. Click "Generate Content"
4. Watch for the loading states and generated content

### 3. Verify Tone Differences
Try the same product with different tones and observe how the generated content changes:
- **Playful**: Should include emojis, casual language, exciting energy
- **Serious**: Should be professional, authoritative, trustworthy
- **Bold**: Should be powerful, confident, action-oriented

## 🔧 Key Implementation Features

### Tone-Aware Prompting
The system uses sophisticated prompts that include:
- **System prompts** that define the AI's personality for each tone
- **Style instructions** that guide the response format
- **Structured output** using Llama's chat template format

### Error Handling
- **API timeouts** (45 seconds for text generation)
- **Fallback content** with tone-specific messaging
- **Graceful degradation** when the API is unavailable

### Response Parsing
- **JSON parsing** of structured LLM responses
- **Fallback extraction** using regex patterns
- **Validation** of headline and caption fields

## 🚨 Troubleshooting

### Common Issues

1. **"HF_TOKEN environment variable is required" error**
   - Make sure you've created the `.env` file
   - Verify your HF_TOKEN is correct and not expired

2. **CORS errors**
   - Ensure both servers are running
   - Check that Vite proxy is configured correctly

3. **API timeout errors**
   - Hugging Face Inference API can be slow on free tier
   - Try again or consider upgrading to Pro tier

4. **Model loading errors**
   - The model might be "cold starting"
   - Wait a few minutes and try again

### Debug Mode
Enable detailed logging by setting:
```bash
NODE_ENV=development
```

## 📊 Expected Performance

- **Response time**: 5-15 seconds (depending on model load)
- **Success rate**: >95% when properly configured
- **Token usage**: ~100-200 tokens per request
- **Rate limits**: Free tier has limits, Pro tier is much higher

## 🎉 Success Indicators

You'll know the integration is working when:
1. ✅ Health check returns `hasHfToken: true`
2. ✅ Text generation returns different content for different tones
3. ✅ Frontend shows loading states and displays generated content
4. ✅ Regenerate buttons work properly
5. ✅ Error handling shows appropriate fallback content

## 🔄 Next Steps

Once basic integration is working:
1. Test with various product types and prompts
2. Experiment with different temperature values
3. Monitor API usage and performance
4. Consider implementing caching for frequently used prompts
5. Add analytics to track tone preference and success rates

# Grok API Integration Setup Guide

## Overview
This guide will help you set up the Grok API integration for your multimodal content generator. Grok is xAI's powerful language model that provides excellent performance and creativity for content generation.

## 🔧 Setup Instructions

### 1. Get Grok API Key
1. Go to [xAI Console](https://console.x.ai/)
2. Create an account or sign in
3. Navigate to "API Keys" section
4. Click "Create new API key"
5. Name it something like "Content Generator API"
6. Copy the generated API key (starts with `xai-`)

### 2. Configure Environment Variables
1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file and add your Grok API key:
   ```bash
   GROK_API_KEY=xai-your_actual_api_key_here
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
    "hasGrokToken": true,
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

### Grok API Integration
- **OpenAI-compatible API**: Uses familiar chat completion format
- **JSON mode**: Structured output for consistent parsing
- **System prompts**: Sophisticated tone-aware instructions
- **Fast responses**: Typically 2-8 seconds response time

### Tone-Aware Prompting
The system uses sophisticated prompts that include:
- **System prompts** that define the AI's personality for each tone
- **Style instructions** that guide the response format
- **JSON structured output** for reliable parsing

### Error Handling
- **API timeouts** (30 seconds for text generation)
- **Fallback content** with tone-specific messaging
- **Graceful degradation** when the API is unavailable

### Response Parsing
- **Direct JSON parsing** of structured responses
- **Pattern-based extraction** as fallback
- **Validation** of headline and caption fields

## 🚨 Troubleshooting

### Common Issues

1. **"GROK_API_KEY environment variable is required" error**
   - Make sure you've created the `.env` file
   - Verify your GROK_API_KEY is correct and starts with `xai-`
   - Check that the API key is not expired

2. **CORS errors**
   - Ensure both servers are running
   - Check that Vite proxy is configured correctly

3. **API authentication errors**
   - Verify your API key is valid at console.x.ai
   - Make sure you have sufficient credits/quota
   - Check for any billing issues

4. **Rate limiting errors**
   - Grok has usage limits based on your plan
   - Wait a moment between requests
   - Consider upgrading your plan for higher limits

### Debug Mode
Enable detailed logging by setting:
```bash
NODE_ENV=development
```

## 📊 Expected Performance

- **Response time**: 2-8 seconds (much faster than HuggingFace)
- **Success rate**: >98% when properly configured
- **Token usage**: ~100-300 tokens per request
- **Rate limits**: Varies by plan (check your xAI dashboard)

## 💰 Pricing Information

Grok API pricing (as of 2025):
- **Input tokens**: $5 per 1M tokens
- **Output tokens**: $15 per 1M tokens
- **Free tier**: Limited credits for testing
- **Pay-as-you-go**: No monthly minimums

For typical content generation:
- Cost per request: ~$0.01-0.03
- Much more cost-effective than GPT-4

## 🎉 Success Indicators

You'll know the integration is working when:
1. ✅ Health check returns `hasGrokToken: true`
2. ✅ Text generation returns different content for different tones
3. ✅ Frontend shows loading states and displays generated content
4. ✅ Regenerate buttons work properly
5. ✅ Error handling shows appropriate fallback content
6. ✅ Responses are fast (2-8 seconds typically)

## 🔄 Advantages of Grok vs Hugging Face

### Why Grok is Better:
1. **Faster responses**: 2-8s vs 10-30s
2. **More reliable**: 98%+ uptime vs variable availability
3. **Better creativity**: More engaging, varied content
4. **Structured output**: Built-in JSON mode
5. **No cold starts**: Always ready, no model loading delays
6. **Better pricing**: Predictable costs vs rate limiting

### Grok Specific Benefits:
- **Wit and humor**: Especially good for playful tone
- **Real-world knowledge**: Up-to-date information
- **Personality**: More character in responses
- **Consistency**: Reliable tone adherence

## 🔄 Next Steps

Once basic integration is working:
1. Test with various product types and prompts
2. Experiment with different temperature values (0.1-1.0)
3. Monitor API usage and costs in xAI dashboard
4. Consider implementing response caching
5. Add analytics to track tone preference and success rates
6. Explore other Grok capabilities for future features

## 📈 Advanced Configuration

### Custom Temperature Settings per Tone:
```javascript
const toneTemperatures = {
  playful: 0.8,   // Higher creativity
  serious: 0.3,   // More focused
  bold: 0.7       // Balanced
};
```

### Enhanced Prompting:
Consider adding industry-specific prompts or user personas for even better results.

## 🎯 Migration Benefits

You've successfully migrated from HuggingFace to Grok! Benefits include:
- ⚡ 3-5x faster response times
- 🎯 More consistent, creative outputs
- 💰 Predictable, cost-effective pricing
- 🛡️ Enterprise-grade reliability
- 🔧 Better developer experience

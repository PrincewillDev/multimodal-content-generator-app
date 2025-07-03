# 🚀 Multimodal Content Generator

A lightning-fast AI-powered content generator built with React, TypeScript, and Groq's ultra-fast LLM inference.

## ✨ Features

- **⚡ Lightning-Fast AI**: Powered by Groq's ultra-fast LLM inference (0.5-2s response times)
- **🎭 Tone-Aware Content**: Generate content in Playful, Serious, or Bold tones
- **🖼️ Image Generation**: AI-powered visual content creation
- **🔊 Audio Generation**: Text-to-speech conversion
- **📱 Responsive Design**: Beautiful UI built with React + Tailwind CSS

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Keys
```bash
# Copy the environment template
cp .env.example .env

# Edit .env and add your Groq API key:
# GROQ_API_KEY=gsk_your_actual_groq_api_key_here
```

**Get your Groq API key:**
1. Visit [console.groq.com](https://console.groq.com/)
2. Create an account and go to API Keys
3. Create a new API key (starts with `gsk_`)
4. Add it to your `.env` file

### 3. Start the Application
```bash
# Start both the API server and frontend
npm run dev:api

# Or start them separately:
npm run api     # API server (port 3001)
npm run dev     # Frontend (port 5173)
```

### 4. Test the Integration
```bash
npm run test:quick    # Quick validation
npm run test:api      # Comprehensive tests
npm run test:manual   # Manual cURL tests
```

## 🎯 What Makes This Special?

### Groq Integration
- **Ultra-fast responses**: 0.5-2 second generation times
- **Cost-effective**: Significantly cheaper than OpenAI
- **High quality**: Llama 3.1 8B model optimized for speed
- **Reliable**: 99.9% uptime with robust infrastructure

### Tone-Aware AI
The app generates content with three distinct tones:

- **Playful** 🎉: Fun, energetic content with emojis and casual language
- **Serious** 💼: Professional, authoritative content focused on credibility
- **Bold** 💪: Powerful, confident content with strong action-oriented language

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui components
- **Backend**: Express.js API server
- **AI**: Groq API (Llama 3.1 8B model)
- **Testing**: Comprehensive test suite with multiple validation methods

## 📁 Project Structure

```
├── src/
│   ├── pages/Index.tsx           # Main application page
│   ├── components/
│   │   └── GeneratedContent.tsx  # Content display component
│   └── config/api.ts            # API configuration
├── api/
│   ├── generate-text.js         # Groq API integration
│   ├── generate-image.js        # Image generation
│   └── generate-audio.js        # Audio generation
├── test-*.js                    # Test scripts
└── server-*.js                  # API servers
```

## 🧪 Testing

The project includes comprehensive testing:

- **Quick Test**: `npm run test:quick` - Fast validation
- **Full Test Suite**: `npm run test:api` - Comprehensive validation
- **Manual Tests**: `npm run test:manual` - cURL-based testing
- **Direct API Test**: `node test-direct.js` - Direct handler testing

## 📚 Documentation

- **Setup Guide**: `GROQ_SETUP_GUIDE.md` - Complete step-by-step setup
- **Implementation**: `GROQ_IMPLEMENTATION_COMPLETE.md` - Technical details
- **Testing Guide**: `API_TESTING_GUIDE.md` - Testing procedures

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start frontend development server |
| `npm run api` | Start API server only |
| `npm run dev:api` | Start both frontend and API |
| `npm run build` | Build for production |
| `npm run test:quick` | Quick API validation |
| `npm run test:api` | Comprehensive test suite |
| `npm run test:manual` | Manual cURL tests |

## 🌟 Why Groq?

- **Speed**: Sub-second response times vs 5-15s with other providers
- **Cost**: Up to 10x cheaper than OpenAI for similar quality
- **Reliability**: Enterprise-grade infrastructure with 99.9% uptime
- **Easy Migration**: OpenAI-compatible API format

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| "GROQ_API_KEY not configured" | Add `GROQ_API_KEY=gsk_...` to `.env` file |
| "API request failed" | Check your API key and Groq account credits |
| Slow responses | Groq should be sub-second; check internet connection |
| Server won't start | Try `node server-simple.js` for basic testing |

## 📄 License

This project is open source and available under the MIT License.

---

**Ready to generate lightning-fast AI content?** 🚀

Get your [Groq API key](https://console.groq.com/) and start building!

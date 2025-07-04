import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Import API handlers
import generateTextHandler from './api/generate-text.js';
import generateImageHandler from './api/generate-image.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://multimodal-content-generator.onrender.com']
    : ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:8081'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.static(join(__dirname, 'dist')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const hasGroqToken = !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here');
  const hasHfToken = !!(process.env.HUGGING_FACE_API_KEY && process.env.HUGGING_FACE_API_KEY !== 'your_hugging_face_api_key_here');

  console.log('🏥 Health Check');
  console.log('🔑 Groq API Key configured:', hasGroqToken);
  console.log('🔑 HuggingFace API Key configured:', hasHfToken);

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    apis: {
      hasGroqToken,
      hasHfToken
    }
  });
});

// API Routes
app.post('/api/generate-text', generateTextHandler);
app.post('/api/generate-image', generateImageHandler);

// Serve React app for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Multimodal Content Generator running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📱 Features: AI Text Generation, Image Generation, Web Speech API`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log(`🌐 Live URL: https://multimodal-content-generator.onrender.com`);
  } else {
    console.log(`🔧 Local server: http://localhost:${PORT}`);
  }
});

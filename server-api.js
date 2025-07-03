// Express server to handle API routes alongside Vite dev server
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Import API handlers
import generateTextHandler from './api/generate-text.js';
import generateImageHandler from './api/generate-image.js';
import generateAudioHandler from './api/generate-audio.js';

// API Routes
app.post('/api/generate-text', generateTextHandler);
app.post('/api/generate-image', generateImageHandler);
app.post('/api/generate-audio', generateAudioHandler);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    env: {
      hasGroqToken: !!process.env.GROQ_API_KEY,
      nodeEnv: process.env.NODE_ENV
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔑 GROQ_API_KEY configured: ${!!process.env.GROQ_API_KEY}`);
});

export default app;

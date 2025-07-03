// Simple server for testing Groq API integration
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Import the Groq text generation handler
import generateTextHandler from './api/generate-text.js';

// API Routes
app.post('/api/generate-text', generateTextHandler);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    env: {
      hasGroqToken: !!process.env.GROQ_API_KEY,
      nodeEnv: process.env.NODE_ENV || 'development'
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

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Groq API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 Text generation: http://localhost:${PORT}/api/generate-text`);
  console.log(`🔑 Groq API Key configured: ${!!process.env.GROQ_API_KEY}`);
});

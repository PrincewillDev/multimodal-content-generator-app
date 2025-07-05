import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static files from dist directory
app.use(express.static(join(__dirname, 'dist')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const hasGroqToken = !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here');
  const hasHfToken = !!(process.env.HUGGING_FACE_API_KEY && process.env.HUGGING_FACE_API_KEY !== 'your_hugging_face_api_key_here');

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    apis: {
      groq: hasGroqToken,
      huggingface: hasHfToken
    }
  });
});

// API Routes - import handlers dynamically to avoid module loading issues
app.post('/api/generate-text', async (req, res) => {
  try {
    const { default: handler } = await import('./api/generate-text.js');
    await handler(req, res);
  } catch (error) {
    console.error('Text generation error:', error);
    res.status(500).json({ error: 'Text generation failed' });
  }
});

app.post('/api/generate-image', async (req, res) => {
  try {
    const { default: handler } = await import('./api/generate-image.js');
    await handler(req, res);
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ error: 'Image generation failed' });
  }
});

// Serve React app for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Multimodal Content Generator running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📱 Features: AI Text Generation, Image Generation, Web Speech API`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log(`🌐 Ready for deployment on Render`);
  } else {
    console.log(`🔧 Local server: http://localhost:${PORT}`);
  }
});
